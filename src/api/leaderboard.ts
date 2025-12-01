import { Router, Response } from 'express';
import { optionalAuth, AuthRequest } from './middleware/auth.js';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /leaderboard/global
 * Get global leaderboard.
 */
router.get(
  '/global',
  optionalAuth,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const userId = req.userId;

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Get top entries
      const entries = await prisma.leaderboard.findMany({
        where: {
          scope: 'GLOBAL',
          weekStartDate: weekStart,
        },
        orderBy: { bestScore: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              tgUserId: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Format results
      const leaderboard = entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        tgUserId: entry.user.tgUserId.toString(),
        username: entry.user.username,
        firstName: entry.user.firstName,
        lastName: entry.user.lastName,
        score: entry.bestScore,
        updatedAt: entry.updatedAt,
      }));

      // Get current user's rank if authenticated
      let userRank = null;
      if (userId) {
        const userEntry = await prisma.leaderboard.findUnique({
          where: {
            scope_chatId_weekStartDate_userId: {
              scope: 'GLOBAL',
              chatId: null as any,
              weekStartDate: weekStart,
              userId,
            },
          },
        });

        if (userEntry) {
          const rankCount = await prisma.leaderboard.count({
            where: {
              scope: 'GLOBAL',
              weekStartDate: weekStart,
              bestScore: { gt: userEntry.bestScore },
            },
          });

          userRank = {
            rank: rankCount + 1,
            score: userEntry.bestScore,
            updatedAt: userEntry.updatedAt,
          };
        }
      }

      res.json({
        leaderboard,
        userRank,
        weekStart,
      });
    } catch (error) {
      logger.error({ error }, 'Global leaderboard error');
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
);

/**
 * GET /leaderboard/chat/:chatId
 * Get chat-specific leaderboard.
 */
router.get(
  '/chat/:chatId',
  optionalAuth,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const userId = req.userId;

      // Find chat
      const chat = await prisma.chat.findUnique({
        where: { tgChatId: BigInt(chatId) },
      });

      if (!chat) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Get top entries
      const entries = await prisma.leaderboard.findMany({
        where: {
          scope: 'CHAT',
          chatId: chat.id,
          weekStartDate: weekStart,
        },
        orderBy: { bestScore: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              tgUserId: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Format results
      const leaderboard = entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        tgUserId: entry.user.tgUserId.toString(),
        username: entry.user.username,
        firstName: entry.user.firstName,
        lastName: entry.user.lastName,
        score: entry.bestScore,
        updatedAt: entry.updatedAt,
      }));

      // Get current user's rank if authenticated
      let userRank = null;
      if (userId) {
        const userEntry = await prisma.leaderboard.findUnique({
          where: {
            scope_chatId_weekStartDate_userId: {
              scope: 'CHAT',
              chatId: chat.id,
              weekStartDate: weekStart,
              userId,
            },
          },
        });

        if (userEntry) {
          const rankCount = await prisma.leaderboard.count({
            where: {
              scope: 'CHAT',
              chatId: chat.id,
              weekStartDate: weekStart,
              bestScore: { gt: userEntry.bestScore },
            },
          });

          userRank = {
            rank: rankCount + 1,
            score: userEntry.bestScore,
            updatedAt: userEntry.updatedAt,
          };
        }
      }

      res.json({
        leaderboard,
        userRank,
        weekStart,
        chat: {
          id: chat.tgChatId.toString(),
          title: chat.title,
        },
      });
    } catch (error) {
      logger.error({ error }, 'Chat leaderboard error');
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
);

export default router;
