import { Router, Response } from 'express';
import { authenticate, AuthRequest } from './middleware/auth.js';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { generateSeed, generateNonce } from '../core/rng.js';
import {
  validateRun,
  calculateRewards,
  calculateEnergyCost,
} from '../core/scoring.js';
import {
  checkNonceReplay,
  checkRunRateLimit,
  checkSuspiciousPatterns,
  flagUser,
  isUserFlagged,
  calculateChecksum,
} from '../core/antiCheat.js';
import { GAME_CONFIG } from '../core/constants.js';
import { setGameScore } from '../bot/telegram.js';

const router = Router();

/**
 * POST /game/start
 * Start a new game run.
 */
router.post(
  '/start',
  authenticate,
  rateLimit(rateLimitPresets.game),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { difficulty = 1, mode = 'SOLO', chatId } = req.body;

      // Validate difficulty
      if (difficulty < 1 || difficulty > 5) {
        res.status(400).json({ error: 'Invalid difficulty (1-5)' });
        return;
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check energy
      const energyCost = calculateEnergyCost(difficulty);
      if (user.energy < energyCost) {
        res.status(400).json({
          error: 'Not enough energy',
          energy: user.energy,
          required: energyCost,
        });
        return;
      }

      // Check if flagged
      if (await isUserFlagged(userId)) {
        res.status(403).json({ error: 'Account flagged for review' });
        return;
      }

      // Check run rate limit
      if (await checkRunRateLimit(userId)) {
        res.status(429).json({ error: 'Too many runs, slow down' });
        return;
      }

      // Deduct energy
      await prisma.user.update({
        where: { id: userId },
        data: { energy: user.energy - energyCost },
      });

      // Generate seed and nonce
      const seed = generateSeed();
      const nonce = generateNonce();

      // Create run
      const run = await prisma.run.create({
        data: {
          userId,
          chatId: chatId || null,
          mode: mode.toUpperCase(),
          difficulty,
          seed,
          nonce,
        },
      });

      logger.info({ runId: run.id, userId, difficulty }, 'Run started');

      res.json({
        runId: run.id,
        seed,
        nonce,
        difficulty,
        mode,
        startedAt: run.startedAt,
      });
    } catch (error) {
      logger.error({ error }, 'Game start error');
      res.status(500).json({ error: 'Failed to start game' });
    }
  }
);

/**
 * POST /game/complete
 * Complete a run and validate score.
 */
router.post(
  '/complete',
  authenticate,
  rateLimit(rateLimitPresets.game),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const {
        runId,
        score,
        eventsCompleted,
        inputs,
        checksum,
      } = req.body;

      if (!runId || score === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get run
      const run = await prisma.run.findUnique({
        where: { id: runId },
        include: { user: true },
      });

      if (!run) {
        res.status(404).json({ error: 'Run not found' });
        return;
      }

      if (run.userId !== userId) {
        res.status(403).json({ error: 'Not your run' });
        return;
      }

      if (run.finishedAt) {
        res.status(400).json({ error: 'Run already completed' });
        return;
      }

      const now = new Date();
      const duration = (now.getTime() - run.startedAt.getTime()) / 1000;

      // Check nonce replay
      if (run.nonce && (await checkNonceReplay(run.nonce))) {
        logger.warn({ runId, userId }, 'Nonce replay detected');
        res.status(403).json({ error: 'Invalid request' });
        return;
      }

      // Validate checksum
      const expectedChecksum = calculateChecksum({
        seed: run.seed || '',
        nonce: run.nonce || '',
        score,
        duration: Math.floor(duration),
      });

      if (checksum && checksum !== expectedChecksum) {
        logger.warn({ runId, userId }, 'Checksum mismatch');
        await flagUser(userId, 'Checksum mismatch');
      }

      // Validate run
      const validation = validateRun(
        {
          seed: run.seed || '',
          difficulty: run.difficulty,
          playerCount: 1, // TODO: handle co-op
          duration,
          betrayUsed: run.betrayUsed,
          gearLevel: run.user.gearLvl,
        },
        {
          score,
          eventsCompleted: eventsCompleted || 0,
          inputs: inputs || 0,
        }
      );

      if (!validation.valid) {
        logger.warn(
          { runId, userId, reason: validation.reason },
          'Run validation failed'
        );
        await flagUser(userId, validation.reason || 'Validation failed');

        // Mark run as failed
        await prisma.run.update({
          where: { id: runId },
          data: {
            finishedAt: now,
            success: false,
            score: 0,
            cashEarned: 0,
            validated: false,
          },
        });

        res.status(400).json({ error: validation.reason });
        return;
      }

      // Calculate rewards
      const result = calculateRewards(
        {
          seed: run.seed || '',
          difficulty: run.difficulty,
          playerCount: 1,
          duration,
          betrayUsed: run.betrayUsed,
          gearLevel: run.user.gearLvl,
        },
        score
      );

      // Apply heat penalty
      const heatPenalty = Math.max(0, 1 - run.user.heat * 0.05);
      result.cashEarned = Math.floor(result.cashEarned * heatPenalty);

      // Update run
      await prisma.run.update({
        where: { id: runId },
        data: {
          finishedAt: now,
          success: result.success,
          score: result.score,
          cashEarned: result.cashEarned,
          validated: true,
        },
      });

      // Update user stats
      const newCoins = run.user.coinsTotal + result.cashEarned;
      const newHeat = Math.max(
        0,
        run.user.heat - GAME_CONFIG.HEAT_DECAY_PER_RUN
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          coinsTotal: newCoins,
          heat: newHeat,
        },
      });

      // Update leaderboard
      await updateLeaderboard(userId, run.chatId, score);

      // Set Telegram game score
      try {
        await setGameScore(Number(run.user.tgUserId), score, { force: false });
      } catch (error) {
        logger.error({ error }, 'Failed to set Telegram score');
      }

      // Check for suspicious patterns
      const suspiciousCheck = await checkSuspiciousPatterns(userId);
      if (suspiciousCheck.suspicious) {
        await flagUser(userId, suspiciousCheck.reason || 'Suspicious pattern');
      }

      logger.info(
        { runId, userId, score, cashEarned: result.cashEarned },
        'Run completed'
      );

      res.json({
        success: result.success,
        score: result.score,
        cashEarned: result.cashEarned,
        totalCoins: newCoins,
        heat: newHeat,
      });
    } catch (error) {
      logger.error({ error }, 'Game complete error');
      res.status(500).json({ error: 'Failed to complete game' });
    }
  }
);

/**
 * Update leaderboard for user.
 */
async function updateLeaderboard(
  userId: string,
  chatId: string | null,
  score: number
): Promise<void> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // Update global leaderboard
  await prisma.leaderboard.upsert({
    where: {
      scope_chatId_weekStartDate_userId: {
        scope: 'GLOBAL',
        chatId: null as any,
        weekStartDate: weekStart,
        userId,
      },
    },
    update: {
      bestScore: {
        set: score,
      },
    },
    create: {
      scope: 'GLOBAL',
      weekStartDate: weekStart,
      userId,
      bestScore: score,
    },
  });

  // Update chat leaderboard if in group
  if (chatId) {
    await prisma.leaderboard.upsert({
      where: {
        scope_chatId_weekStartDate_userId: {
          scope: 'CHAT',
          chatId,
          weekStartDate: weekStart,
          userId,
        },
      },
      update: {
        bestScore: {
          set: score,
        },
      },
      create: {
        scope: 'CHAT',
        chatId,
        weekStartDate: weekStart,
        userId,
        bestScore: score,
      },
    });
  }
}

export default router;
