import { Router, Response } from 'express';
import { authenticate, AuthRequest } from './middleware/auth.js';
import { rateLimit, rateLimitPresets } from './middleware/rateLimit.js';
import { prisma } from '../db/client.js';
import { logger } from '../utils/logger.js';
import { DAILY_TASK_TYPES } from '../core/constants.js';

const router = Router();

/**
 * GET /dailies
 * Get user's daily tasks.
 */
router.get(
  '/',
  authenticate,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get or create daily tasks
      let tasks = await prisma.dailyTask.findMany({
        where: {
          userId,
          date: today,
        },
      });

      // If no tasks exist for today, create them
      if (tasks.length === 0) {
        const taskTypes = Object.keys(DAILY_TASK_TYPES);
        const createTasks = taskTypes.map((taskType) => {
          const config =
            DAILY_TASK_TYPES[taskType as keyof typeof DAILY_TASK_TYPES];
          return prisma.dailyTask.create({
            data: {
              userId,
              date: today,
              taskType,
              progress: 0,
              target: config.target,
            },
          });
        });

        tasks = await prisma.$transaction(createTasks);
      }

      // Format response
      const dailies = tasks.map((task) => {
        const config =
          DAILY_TASK_TYPES[task.taskType as keyof typeof DAILY_TASK_TYPES];
        return {
          id: task.id,
          type: task.taskType,
          progress: task.progress,
          target: task.target,
          reward: config?.reward || 0,
          completed: task.progress >= task.target,
          claimed: task.rewardClaimed,
        };
      });

      res.json({ dailies, date: today });
    } catch (error) {
      logger.error({ error }, 'Dailies fetch error');
      res.status(500).json({ error: 'Failed to fetch daily tasks' });
    }
  }
);

/**
 * POST /dailies/claim
 * Claim reward for completed daily task.
 */
router.post(
  '/claim',
  authenticate,
  rateLimit(rateLimitPresets.api),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { taskId } = req.body;

      if (!taskId) {
        res.status(400).json({ error: 'taskId required' });
        return;
      }

      // Get task
      const task = await prisma.dailyTask.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      if (task.userId !== userId) {
        res.status(403).json({ error: 'Not your task' });
        return;
      }

      if (task.rewardClaimed) {
        res.status(400).json({ error: 'Reward already claimed' });
        return;
      }

      if (task.progress < task.target) {
        res.status(400).json({ error: 'Task not completed' });
        return;
      }

      // Get reward amount
      const config =
        DAILY_TASK_TYPES[task.taskType as keyof typeof DAILY_TASK_TYPES];
      const reward = config?.reward || 0;

      // Award coins and mark claimed
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { coinsTotal: { increment: reward } },
        }),
        prisma.dailyTask.update({
          where: { id: taskId },
          data: { rewardClaimed: true },
        }),
      ]);

      logger.info({ userId, taskId, reward }, 'Daily task reward claimed');

      res.json({
        success: true,
        reward,
        taskType: task.taskType,
      });
    } catch (error) {
      logger.error({ error }, 'Dailies claim error');
      res.status(500).json({ error: 'Failed to claim reward' });
    }
  }
);

/**
 * Update daily task progress (internal helper, not exposed).
 */
export async function updateDailyProgress(
  userId: string,
  taskType: string,
  increment: number
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.dailyTask.updateMany({
      where: {
        userId,
        date: today,
        taskType,
        rewardClaimed: false,
      },
      data: {
        progress: { increment },
      },
    });
  } catch (error) {
    logger.error({ error, userId, taskType }, 'Failed to update daily progress');
  }
}

export default router;
