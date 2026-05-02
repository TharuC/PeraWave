import express from 'express';
import { getUsers, warnUser, suspendUser, deleteUser, getModerationActions, getPlatformStats } from '../controllers/modController';
import { requireModerator } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/users', requireModerator, getUsers);
router.post('/users/warn', requireModerator, warnUser);
router.post('/users/suspend', requireModerator, suspendUser);
router.post('/users/delete', requireModerator, deleteUser);
router.get('/audit-logs', requireModerator, getModerationActions);
router.get('/stats', requireModerator, getPlatformStats);

export default router;
