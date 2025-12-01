import { Router, Response } from 'express';
import { authenticate, AuthRequest } from './middleware/auth.js';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /me
 * Get current user profile and stats.
 */
router.get(
  '/',
  authenticate,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          inventory: true,
          runs: {
            where: { finishedAt: { not: null } },
            orderBy: { finishedAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Calculate stats
      const totalRuns = await prisma.run.count({
        where: { userId, finishedAt: { not: null } },
      });

      const successfulRuns = await prisma.run.count({
        where: { userId, success: true },
      });

      const highScore = await prisma.run.findFirst({
        where: { userId },
        orderBy: { score: 'desc' },
      });

      res.json({
        user: {
          id: user.id,
          tgUserId: user.tgUserId.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          coinsTotal: user.coinsTotal,
          energy: user.energy,
          heat: user.heat,
          gearLvl: user.gearLvl,
          createdAt: user.createdAt,
          lastSeenAt: user.lastSeenAt,
        },
        stats: {
          totalRuns,
          successfulRuns,
          successRate:
            totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : '0',
          highScore: highScore?.score || 0,
        },
        inventory: user.inventory.map((item) => ({
          gear: item.gear,
          level: item.level,
        })),
        recentRuns: user.runs.map((run) => ({
          id: run.id,
          score: run.score,
          cashEarned: run.cashEarned,
          success: run.success,
          difficulty: run.difficulty,
          mode: run.mode,
          finishedAt: run.finishedAt,
        })),
      });
    } catch (error) {
      logger.error({ error }, 'Profile fetch error');
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

export default router;
