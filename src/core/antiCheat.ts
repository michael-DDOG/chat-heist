import { prisma } from '../db/client.js';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Check if a nonce has been used before (replay attack prevention).
 */
export async function checkNonceReplay(nonce: string): Promise<boolean> {
  const key = `nonce:${nonce}`;
  const exists = await redis.exists(key);

  if (exists) {
    logger.warn({ nonce }, 'Nonce replay detected');
    return true;
  }

  // Mark nonce as used (expire after 1 hour)
  await redis.set(key, '1', { ex: 3600 });
  return false;
}

/**
 * Check if user is attempting too many runs too quickly.
 */
export async function checkRunRateLimit(userId: string): Promise<boolean> {
  const key = `runrate:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }

  // Max 10 runs per minute
  if (count > 10) {
    logger.warn({ userId, count }, 'Run rate limit exceeded');
    return true;
  }

  return false;
}

/**
 * Check user's recent run patterns for suspicious behavior.
 */
export async function checkSuspiciousPatterns(
  userId: string
): Promise<{ suspicious: boolean; reason?: string }> {
  // Get last 10 runs
  const recentRuns = await prisma.run.findMany({
    where: { userId },
    orderBy: { finishedAt: 'desc' },
    take: 10,
  });

  if (recentRuns.length < 5) {
    return { suspicious: false }; // Not enough data
  }

  // Check 1: All runs have perfect scores
  const allPerfect = recentRuns.every((run) => run.score > 9000);
  if (allPerfect) {
    return { suspicious: true, reason: 'All perfect scores' };
  }

  // Check 2: Identical scores (bot behavior)
  const scores = recentRuns.map((r) => r.score);
  const uniqueScores = new Set(scores);
  if (uniqueScores.size === 1 && scores.length >= 5) {
    return { suspicious: true, reason: 'Identical scores' };
  }

  // Check 3: Run durations too consistent (should have natural variance)
  const durations = recentRuns
    .filter((r) => r.startedAt && r.finishedAt)
    .map(
      (r) =>
        (r.finishedAt!.getTime() - r.startedAt.getTime()) / 1000
    );

  if (durations.length >= 5) {
    const avgDuration =
      durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance =
      durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) /
      durations.length;
    const stdDev = Math.sqrt(variance);

    // If standard deviation is less than 1 second, suspicious
    if (stdDev < 1) {
      return { suspicious: true, reason: 'Too consistent timing' };
    }
  }

  return { suspicious: false };
}

/**
 * Flag a user for review.
 */
export async function flagUser(
  userId: string,
  reason: string
): Promise<void> {
  logger.warn({ userId, reason }, 'User flagged for review');

  // Store flag in Redis for quick checks
  const key = `flagged:${userId}`;
  await redis.set(key, reason, { ex: 86400 * 7 }); // 7 days

  // Could also create a database entry for persistent tracking
}

/**
 * Check if user is flagged.
 */
export async function isUserFlagged(userId: string): Promise<boolean> {
  const key = `flagged:${userId}`;
  return (await redis.exists(key)) === 1;
}

/**
 * Calculate checksum for run data (simple hash for integrity check).
 */
export function calculateChecksum(data: {
  seed: string;
  nonce: string;
  score: number;
  duration: number;
}): string {
  const str = `${data.seed}:${data.nonce}:${data.score}:${data.duration}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
