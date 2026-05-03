import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

// Extend the Express Request interface to include the user property
export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Validate that the user still exists in the database
    if (decoded.role === 'MODERATOR' || decoded.role === 'SUPER_ADMIN') {
      const mod = await prisma.moderator.findUnique({ where: { id: decoded.userId } });
      if (!mod) {
        return res.status(401).json({ error: 'Account no longer exists.' });
      }
    } else {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || user.isDeleted) {
        return res.status(401).json({ error: 'Account no longer exists.' });
      }
    }

    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireModerator = (req: AuthRequest, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN')) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Moderator privileges required.' });
    }
  });
};
