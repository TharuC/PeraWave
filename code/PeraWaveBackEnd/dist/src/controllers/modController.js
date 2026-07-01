"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.suspendUser = exports.warnUser = exports.getModerators = exports.getUsers = exports.getPlatformStats = exports.getModerationActions = void 0;
const db_1 = __importDefault(require("../config/db"));
const getModerationActions = async (req, res) => {
    try {
        const actions = await db_1.default.moderationAction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                moderator: { select: { fullName: true, email: true } }
            }
        });
        res.status(200).json(actions);
    }
    catch (error) {
        console.error('Error fetching moderation actions:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};
exports.getModerationActions = getModerationActions;
const getPlatformStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalUsers, newUsersToday, suspendedUsers, totalPosts, totalModerators] = await Promise.all([
            db_1.default.user.count({ where: { isDeleted: false } }),
            db_1.default.user.count({ where: { isDeleted: false, createdAt: { gte: today } } }),
            db_1.default.user.count({ where: { isDeleted: false, suspendedUntil: { gt: new Date() } } }),
            db_1.default.forumPost.count(),
            db_1.default.moderator.count(),
        ]);
        res.status(200).json({
            totalUsers,
            newUsersToday,
            suspendedUsers,
            totalPosts,
            totalModerators,
        });
    }
    catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
exports.getPlatformStats = getPlatformStats;
const getUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            where: { isDeleted: false },
            select: {
                id: true,
                email: true,
                fullName: true,
                faculty: true,
                registrationNumber: true,
                suspendedUntil: true,
                suspensionReason: true,
                createdAt: true,
            }
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const getModerators = async (req, res) => {
    try {
        const moderators = await db_1.default.moderator.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
            }
        });
        res.status(200).json(moderators);
    }
    catch (error) {
        console.error('Error fetching moderators:', error);
        res.status(500).json({ error: 'Failed to fetch moderators' });
    }
};
exports.getModerators = getModerators;
const warnUser = async (req, res) => {
    const { targetUserId, reason } = body_warn(req.body);
    try {
        await db_1.default.$transaction([
            db_1.default.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'WARNING',
                    message: reason,
                }
            }),
            db_1.default.moderationAction.create({
                data: {
                    targetUserId,
                    actionType: 'WARN',
                    reason,
                }
            })
        ]);
        res.status(200).json({ message: 'User warned successfully' });
    }
    catch (error) {
        console.error('Error warning user:', error);
        res.status(500).json({ error: 'Failed to warn user' });
    }
};
exports.warnUser = warnUser;
const body_warn = (body) => body;
const body_suspend = (body) => body;
const body_delete = (body) => body;
const suspendUser = async (req, res) => {
    const { targetUserId, reason, durationDays } = body_suspend(req.body);
    try {
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);
        await db_1.default.$transaction([
            db_1.default.user.update({
                where: { id: targetUserId },
                data: { suspendedUntil, suspensionReason: reason }
            }),
            db_1.default.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'SUSPENSION',
                    message: `Your account has been suspended for ${durationDays} days. Reason: ${reason}`,
                }
            }),
            db_1.default.moderationAction.create({
                data: {
                    targetUserId,
                    actionType: 'SUSPEND',
                    reason,
                    durationDays,
                }
            })
        ]);
        res.status(200).json({ message: 'User suspended successfully' });
    }
    catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ error: 'Failed to suspend user' });
    }
};
exports.suspendUser = suspendUser;
const deleteUser = async (req, res) => {
    const { targetUserId, reason } = body_delete(req.body);
    try {
        await db_1.default.$transaction([
            db_1.default.user.update({
                where: { id: targetUserId },
                data: { isDeleted: true, deletionReason: reason }
            }),
            db_1.default.moderationAction.create({
                data: {
                    targetUserId,
                    actionType: 'DELETE',
                    reason,
                }
            })
        ]);
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
