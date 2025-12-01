import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/client.js';
import { logger } from '../../utils/logger.js';

export interface AuthRequest extends Request {
  userId?: string;
  session?: {
    id: string;
    userId: string;
    token: string;
  };
}

/**
 * Middleware to authenticate requests via session token.
 * Expects Authorization: Bearer <token> header.
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    // Look up session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    // Update lastSeen
    await prisma.user.update({
      where: { id: session.userId },
      data: { lastSeenAt: new Date() },
    });

    // Attach to request
    req.userId = session.userId;
    req.session = {
      id: session.id,
      userId: session.userId,
      token: session.token,
    };

    next();
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional auth - doesn't fail if no token, but attaches userId if valid
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (session && session.expiresAt >= new Date()) {
      req.userId = session.userId;
      req.session = {
        id: session.id,
        userId: session.userId,
        token: session.token,
      };
    }

    next();
  } catch (error) {
    logger.error({ error }, 'Optional auth error');
    next();
  }
}
