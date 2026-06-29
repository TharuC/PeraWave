import { Request, Response } from 'express';
import prisma from '../config/db';

export const getModerationActions = async (req: Request, res: Response) => {
  try {
    const actions = await prisma.moderationAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        moderator: { select: { fullName: true, email: true } }
      }
    });
    res.status(200).json(actions);
  } catch (error) {
    console.error('Error fetching moderation actions:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, newUsersToday, suspendedUsers, totalPosts, totalModerators] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isDeleted: false, createdAt: { gte: today } } }),
      prisma.user.count({ where: { isDeleted: false, suspendedUntil: { gt: new Date() } } }),
      prisma.forumPost.count(),
      prisma.moderator.count(),
    ]);

    res.status(200).json({
      totalUsers,
      newUsersToday,
      suspendedUsers,
      totalPosts,
      totalModerators,
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getModerators = async (req: Request, res: Response) => {
  try {
    const moderators = await prisma.moderator.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      }
    });
    res.status(200).json(moderators);
  } catch (error) {
    console.error('Error fetching moderators:', error);
    res.status(500).json({ error: 'Failed to fetch moderators' });
  }
};

export const warnUser = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error warning user:', error);
    res.status(500).json({ error: 'Failed to warn user' });
  }
};

const body_warn = (body: any) => body as { targetUserId: number, reason: string };
const body_suspend = (body: any) => body as { targetUserId: number, reason: string, durationDays: number };
const body_delete = (body: any) => body as { targetUserId: number, reason: string };

export const suspendUser = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
