import { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from '../../utils/redis.js';
import { logger } from '../../utils/logger.js';
import type { AuthRequest } from './auth.js';

export interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
}

/**
 * Rate limiter middleware using Redis.
 * Limits requests per user (if authenticated) or per IP.
 */
export function rateLimit(config: RateLimitConfig) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Build key: prefer userId, fallback to IP
      const identifier = req.userId || req.ip || 'unknown';
      const key = `ratelimit:${config.keyPrefix}:${identifier}`;

      const result = await checkRateLimit(
        key,
        config.maxRequests,
        config.windowSeconds
      );

      // Set headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader(
        'X-RateLimit-Reset',
        Date.now() + config.windowSeconds * 1000
      );

      if (!result.allowed) {
        logger.warn(
          { identifier, key },
          'Rate limit exceeded'
        );
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: config.windowSeconds,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error({ error }, 'Rate limit check failed');
      // Don't block on rate limit errors
      next();
    }
  };
}

// Preset configurations
export const rateLimitPresets = {
  auth: { windowSeconds: 60, maxRequests: 10, keyPrefix: 'auth' },
  game: { windowSeconds: 60, maxRequests: 30, keyPrefix: 'game' },
  api: { windowSeconds: 60, maxRequests: 100, keyPrefix: 'api' },
  webhook: { windowSeconds: 1, maxRequests: 10, keyPrefix: 'webhook' },
};
