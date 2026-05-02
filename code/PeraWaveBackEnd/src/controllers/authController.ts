import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, faculty, registrationNumber } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // 3. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Save the user to the database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        faculty,
        registrationNumber,
      },
    });

    // 5. Send success response (excluding password)
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        faculty: newUser.faculty,
        registrationNumber: newUser.registrationNumber,
      },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during registration', 
      details: error?.message || String(error),
      stack: error?.stack 
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'USER' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        faculty: user.faculty,
        registrationNumber: user.registrationNumber,
        suspendedUntil: user.suspendedUntil,
        suspensionReason: user.suspensionReason,
        createdAt: user.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const modRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, password, adminCode } = req.body;

    if (!name || !email || !password || !adminCode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const expectedCode = process.env.ADMIN_REGISTRATION_CODE || 'PeraWaveAdmin2026';
    if (adminCode !== expectedCode) {
      return res.status(403).json({ error: 'Invalid admin authorization code' });
    }

    const existingMod = await prisma.moderator.findUnique({ where: { email } });
    if (existingMod) {
      return res.status(409).json({ error: 'Moderator with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMod = await prisma.moderator.create({
      data: {
        email,
        password: hashedPassword,
        fullName: name,
      },
    });

    return res.status(201).json({
      message: 'Moderator registered successfully',
      user: {
        id: newMod.id,
        email: newMod.email,
        fullName: newMod.fullName,
        role: 'MODERATOR',
      },
    });

  } catch (error: any) {
    console.error('Moderator registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const modLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const moderator = await prisma.moderator.findUnique({ where: { email } });

    if (!moderator) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, moderator.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: moderator.id, email: moderator.email, role: 'MODERATOR' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Moderator login successful',
      token,
      user: {
        id: moderator.id,
        email: moderator.email,
        fullName: moderator.fullName,
        role: 'MODERATOR',
        createdAt: moderator.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Moderator login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (role === 'MODERATOR') {
      const mod = await prisma.moderator.findUnique({ where: { id: userId } });
      if (!mod) return res.status(404).json({ error: 'Moderator not found' });
      return res.status(200).json({
        id: mod.id,
        email: mod.email,
        fullName: mod.fullName,
        role: 'MODERATOR',
        createdAt: mod.createdAt
      });
    } else {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { notifications: { where: { isRead: false } } }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        faculty: user.faculty,
        registrationNumber: user.registrationNumber,
        role: 'USER',
        suspendedUntil: user.suspendedUntil,
        suspensionReason: user.suspensionReason,
        notifications: user.notifications,
        createdAt: user.createdAt
      });
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        faculty: true,
        registrationNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // We'll map them to the format expected by the frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      status: "Active", // Assuming all are active for now, you can add a status field to the schema later
      joined: new Date(user.createdAt).toISOString().split('T')[0]
    }));

    return res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markNotificationsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
