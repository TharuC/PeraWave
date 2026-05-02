import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request interface to include the user property
export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
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
