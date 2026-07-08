import { Request, Response } from 'express';
import prisma from '../config/db';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middlewares/authMiddleware';
import fs from 'fs';

// ── Helper ────────────────────────────────────────────────────────────────────
const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'perawave/event-flyers',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  // Clean up the temp file after upload
  fs.unlink(filePath, () => {});
  return result.secure_url;
};

// ── POST /api/events ──────────────────────────────────────────────────────────
// Authenticated users submit a new event (starts as PENDING)
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, eventDate, eventTime, location, link } = req.body;
    const organizerId = req.user?.userId;

    if (!title || !description || !eventDate || !eventTime || !location) {
      return res.status(400).json({ error: 'title, description, eventDate, eventTime and location are required.' });
    }

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        eventTime,
        location,
        link: link || null,
        imageUrl: imageUrl || null,
        organizerId,
        status: 'PENDING',
      },
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/events ───────────────────────────────────────────────────────────
// Returns all APPROVED events (public, requires auth)
export const getApprovedEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'APPROVED' },
      orderBy: { eventDate: 'asc' },
      include: {
        organizer: { select: { fullName: true, faculty: true } },
      },
    });
    return res.json(events);
  } catch (err) {
    console.error('getApprovedEvents error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/events/upcoming ──────────────────────────────────────────────────
// Returns the top 5 upcoming APPROVED events (for home page widget)
export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const events = await prisma.event.findMany({
      where: { status: 'APPROVED', eventDate: { gte: now } },
      orderBy: { eventDate: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        eventDate: true,
        eventTime: true,
        location: true,
        imageUrl: true,
        link: true,
      },
    });
    return res.json(events);
  } catch (err) {
    console.error('getUpcomingEvents error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/events/pending  (moderators only) ────────────────────────────────
export const getPendingEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: { select: { id: true, fullName: true, email: true, faculty: true } },
      },
    });
    return res.json(events);
  } catch (err) {
    console.error('getPendingEvents error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PATCH /api/events/:id/status  (moderators only) ──────────────────────────
export const updateEventStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED.' });
    }

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.json(event);
  } catch (err) {
    console.error('updateEventStatus error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── DELETE /api/events/:id  (organizer or moderator) ─────────────────────────
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const eventId = Number(id);
    const userId = req.user?.userId;
    const role = req.user?.role;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    // Allow delete if organizer or moderator
    if (event.organizerId !== userId && role !== 'MODERATOR' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorised.' });
    }

    await prisma.event.delete({ where: { id: eventId } });
    return res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
