import { Redis } from '@upstash/redis';
import { logger } from './logger.js';

const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!restUrl || !restToken) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are required');
}

// Use Upstash REST API (more reliable for serverless/edge)
export const redis = new Redis({
  url: restUrl,
  token: restToken,
});

logger.info('Redis client initialized (Upstash REST)');

// Helper functions
export async function setWithExpiry(
  key: string,
  value: string,
  expirySeconds: number
): Promise<void> {
  await redis.set(key, value, { ex: expirySeconds });
}

export async function incrementKey(
  key: string,
  expirySeconds?: number
): Promise<number> {
  const count = await redis.incr(key);
  if (expirySeconds && count === 1) {
    await redis.expire(key, expirySeconds);
  }
  return count;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const count = await incrementKey(key, windowSeconds);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
