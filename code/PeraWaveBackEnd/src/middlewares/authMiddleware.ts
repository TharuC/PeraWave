import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

// Extend the Express Request interface to include the user property
export interface AuthRequest extends Request {
  user?: any;
}

// ── Core token verifier (proper async middleware) ───────────────────────────────
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Validate that the user still exists in the database
    if (decoded.role === 'MODERATOR' || decoded.role === 'SUPER_ADMIN') {
      const mod = await prisma.moderator.findUnique({ where: { id: decoded.userId } });
      if (!mod) {
        res.status(401).json({ error: 'Account no longer exists.' });
        return;
      }
    } else {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || user.isDeleted) {
        res.status(401).json({ error: 'Account no longer exists.' });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// ── Moderator / Super-Admin guard ───────────────────────────────────────────────
export const requireModerator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  await verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN')) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Moderator privileges required.' });
    }
  });
};

/**
 * Middleware that only allows authenticated regular users (role === 'USER').
 * Blocks unauthenticated requests and moderator / admin accounts.
 */
export const requireUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  await verifyToken(req, res, () => {
    if (req.user && req.user.role === 'USER') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Only registered users can perform this action.' });
    }
  });
};
