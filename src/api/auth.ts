import { Router, Request, Response } from 'express';
import { verifyTelegramInitData } from '../bot/verifyInitData.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js';
import crypto from 'crypto';
import { GAME_CONFIG } from '../core/constants.js';

const router = Router();
const botToken = process.env.TELEGRAM_BOT_TOKEN!;

/**
 * POST /auth/verifyInitData
 * Verify Telegram initData and create/return session token.
 */
router.post(
  '/verifyInitData',
  rateLimit(rateLimitPresets.auth),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { initData } = req.body;

      if (!initData) {
        res.status(400).json({ error: 'initData required' });
        return;
      }

      // Verify initData HMAC
      const verification = verifyTelegramInitData(initData, botToken);

      if (!verification.valid || !verification.data) {
        res.status(401).json({ error: 'Invalid initData' });
        return;
      }

      const { user: tgUser } = verification.data;

      // Create or update user in database
      const user = await prisma.user.upsert({
        where: { tgUserId: BigInt(tgUser.id) },
        update: {
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          lastSeenAt: new Date(),
        },
        create: {
          tgUserId: BigInt(tgUser.id),
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          energy: GAME_CONFIG.MAX_ENERGY,
          heat: 0,
          gearLvl: 1,
          coinsTotal: 0,
        },
      });

      // Create session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(
        expiresAt.getHours() + GAME_CONFIG.SESSION_DURATION_HOURS
      );

      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      logger.info({ userId: user.id, tgUserId: user.tgUserId }, 'User authenticated');

      res.json({
        token,
        expiresAt,
        user: {
          id: user.id,
          tgUserId: user.tgUserId.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          energy: user.energy,
          heat: user.heat,
          gearLvl: user.gearLvl,
          coinsTotal: user.coinsTotal,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Auth error');
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
);

export default router;
