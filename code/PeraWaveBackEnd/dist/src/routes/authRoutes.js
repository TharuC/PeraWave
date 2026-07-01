"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', authController_1.registerUser);
// POST /api/auth/send-otp
router.post('/send-otp', authController_1.sendOtp);
// POST /api/auth/verify-otp
router.post('/verify-otp', authController_1.verifyOtp);
// POST /api/auth/reset-password-otp
router.post('/reset-password-otp', authController_1.sendResetPasswordOtp);
// POST /api/auth/reset-password
router.post('/reset-password', authController_1.resetPassword);
// POST /api/auth/mod-reset-password-otp
router.post('/mod-reset-password-otp', authController_1.sendModResetPasswordOtp);
// POST /api/auth/mod-reset-password
router.post('/mod-reset-password', authController_1.modResetPassword);
// POST /api/auth/login
router.post('/login', authController_1.loginUser);
// POST /api/auth/mod-register-otp
router.post('/mod-register-otp', authController_1.sendModRegisterOtp);
// POST /api/auth/mod-register
router.post('/mod-register', authController_1.modRegister);
// POST /api/auth/mod-login
router.post('/mod-login', authController_1.modLogin);
// GET /api/auth/me
router.get('/me', authMiddleware_1.verifyToken, authController_1.getCurrentUser);
// POST /api/auth/notifications/read
router.post('/notifications/read', authMiddleware_1.verifyToken, authController_1.markNotificationsRead);
// GET /api/auth/notifications
router.get('/notifications', authMiddleware_1.verifyToken, authController_1.getNotifications);
// DELETE /api/auth/me (User self-deletion)
router.delete('/me', authMiddleware_1.verifyToken, authController_1.deleteMe);
// GET /api/auth/users (Moderators Only)
router.get('/users', authMiddleware_1.requireModerator, authController_1.getAllUsers);
exports.default = router;
