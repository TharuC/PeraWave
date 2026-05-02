"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.suspendUser = exports.warnUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
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
const warnUser = async (req, res) => {
    const { targetUserId, reason } = body_warn(req.body);
    try {
        await prisma.$transaction([
            prisma.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'WARNING',
                    message: reason,
                }
            }),
            prisma.moderationAction.create({
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
        await prisma.$transaction([
            prisma.user.update({
                where: { id: targetUserId },
                data: { suspendedUntil, suspensionReason: reason }
            }),
            prisma.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'SUSPENSION',
                    message: `Your account has been suspended for ${durationDays} days. Reason: ${reason}`,
                }
            }),
            prisma.moderationAction.create({
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
        await prisma.$transaction([
            prisma.user.update({
                where: { id: targetUserId },
                data: { isDeleted: true, deletionReason: reason }
            }),
            prisma.moderationAction.create({
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
