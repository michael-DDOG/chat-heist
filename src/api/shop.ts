import { Router, Response } from 'express';
import { authenticate, AuthRequest } from './middleware/auth.js';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { GAME_CONFIG, GEAR_TYPES } from '../core/constants.js';

const router = Router();

/**
 * GET /shop/gear
 * Get available gear and upgrades.
 */
router.get(
  '/gear',
  authenticate,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // Get user's current inventory
      const inventory = await prisma.inventory.findMany({
        where: { userId },
      });

      // Build gear catalog
      const catalog = GEAR_TYPES.map((gearType) => {
        const owned = inventory.find((i) => i.gear === gearType);
        const currentLevel = owned?.level || 0;
        const nextLevel = currentLevel + 1;
        const canUpgrade = nextLevel <= 5;
        const cost = canUpgrade
          ? GAME_CONFIG.GEAR_COSTS[nextLevel as keyof typeof GAME_CONFIG.GEAR_COSTS]
          : 0;

        return {
          type: gearType,
          currentLevel,
          nextLevel: canUpgrade ? nextLevel : null,
          cost: canUpgrade ? cost : null,
          owned: currentLevel > 0,
          maxLevel: 5,
        };
      });

      res.json({ catalog });
    } catch (error) {
      logger.error({ error }, 'Shop gear error');
      res.status(500).json({ error: 'Failed to fetch gear' });
    }
  }
);

/**
 * POST /shop/buy
 * Purchase or upgrade gear.
 */
router.post(
  '/buy',
  authenticate,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { gearType } = req.body;

      if (!gearType || !GEAR_TYPES.includes(gearType)) {
        res.status(400).json({ error: 'Invalid gear type' });
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

      // Get current gear level
      const owned = await prisma.inventory.findUnique({
        where: {
          userId_gear: { userId, gear: gearType },
        },
      });

      const currentLevel = owned?.level || 0;
      const nextLevel = currentLevel + 1;

      if (nextLevel > 5) {
        res.status(400).json({ error: 'Already at max level' });
        return;
      }

      // Check cost
      const cost =
        GAME_CONFIG.GEAR_COSTS[nextLevel as keyof typeof GAME_CONFIG.GEAR_COSTS];

      if (user.coinsTotal < cost) {
        res.status(400).json({
          error: 'Not enough coins',
          required: cost,
          current: user.coinsTotal,
        });
        return;
      }

      // Deduct coins and upgrade gear
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { coinsTotal: user.coinsTotal - cost },
        }),
        prisma.inventory.upsert({
          where: {
            userId_gear: { userId, gear: gearType },
          },
          update: { level: nextLevel },
          create: {
            userId,
            gear: gearType,
            level: nextLevel,
          },
        }),
      ]);

      logger.info(
        { userId, gearType, level: nextLevel, cost },
        'Gear purchased'
      );

      res.json({
        success: true,
        gearType,
        newLevel: nextLevel,
        coinsRemaining: user.coinsTotal - cost,
      });
    } catch (error) {
      logger.error({ error }, 'Shop buy error');
      res.status(500).json({ error: 'Failed to purchase gear' });
    }
  }
);

export default router;
