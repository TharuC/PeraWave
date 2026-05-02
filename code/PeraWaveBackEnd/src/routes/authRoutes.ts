import { Router } from 'express';
import { registerUser, loginUser, modRegister, modLogin, getCurrentUser, getAllUsers, markNotificationsRead, getNotifications } from '../controllers/authController';
import { verifyToken, requireModerator } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/mod-register
router.post('/mod-register', modRegister);

// POST /api/auth/mod-login
router.post('/mod-login', modLogin);

// GET /api/auth/me
router.get('/me', verifyToken, getCurrentUser);

// POST /api/auth/notifications/read
router.post('/notifications/read', verifyToken, markNotificationsRead);

// GET /api/auth/notifications
router.get('/notifications', verifyToken, getNotifications);

// GET /api/auth/users (Moderators Only)
router.get('/users', requireModerator, getAllUsers);

export default router;
