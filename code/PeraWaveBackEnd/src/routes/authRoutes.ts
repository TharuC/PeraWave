import { Router } from 'express';
import { registerUser, loginUser, modRegister, modLogin, getCurrentUser, getAllUsers, markNotificationsRead, getNotifications, sendOtp, verifyOtp, deleteMe, sendResetPasswordOtp, resetPassword, sendModResetPasswordOtp, modResetPassword, sendModRegisterOtp, getPublicProfile } from '../controllers/authController';
import { verifyToken, requireModerator } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);

// POST /api/auth/reset-password-otp
router.post('/reset-password-otp', sendResetPasswordOtp);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/auth/mod-reset-password-otp
router.post('/mod-reset-password-otp', sendModResetPasswordOtp);

// POST /api/auth/mod-reset-password
router.post('/mod-reset-password', modResetPassword);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/mod-register-otp
router.post('/mod-register-otp', sendModRegisterOtp);

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

// DELETE /api/auth/me (User self-deletion)
router.delete('/me', verifyToken, deleteMe);

// GET /api/auth/users (Moderators Only)
router.get('/users', requireModerator, getAllUsers);

// GET /api/auth/users/:id/profile (Authenticated users — public profile, no email/e-number)
router.get('/users/:id/profile', verifyToken, getPublicProfile);

export default router;
