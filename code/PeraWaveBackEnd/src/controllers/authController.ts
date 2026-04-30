import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        faculty: user.faculty,
        registrationNumber: user.registrationNumber,
        createdAt: user.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};
