"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', authController_1.registerUser);
// POST /api/auth/login
router.post('/login', authController_1.loginUser);
// POST /api/auth/mod-register
router.post('/mod-register', authController_1.modRegister);
// POST /api/auth/mod-login
router.post('/mod-login', authController_1.modLogin);
// GET /api/auth/me
router.get('/me', authMiddleware_1.verifyToken, authController_1.getCurrentUser);
// POST /api/auth/notifications/read
router.post('/notifications/read', authMiddleware_1.verifyToken, authController_1.markNotificationsRead);
// GET /api/auth/users (Moderators Only)
router.get('/users', authMiddleware_1.requireModerator, authController_1.getAllUsers);
exports.default = router;
