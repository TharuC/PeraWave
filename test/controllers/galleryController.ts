import { Request, Response } from 'express';
import prisma from '../config/db';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middlewares/authMiddleware';
import fs from 'fs';

const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'perawave/gallery-images',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  fs.unlink(filePath, () => {});
  return result.secure_url;
};

export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    const category = (req.body.category || '').toUpperCase();
    const authorId = req.user?.userId;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    if (!['DRAWING', 'POEM', 'STORY', 'OTHER'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!authorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      imageUrls = await Promise.all(uploadPromises);
    }

    const item = await prisma.galleryItem.create({
      data: {
        title,
        content,
        category,
        authorId,
        imageUrls,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
};

export const getAllGalleryItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { fullName: true, email: true, faculty: true },
        },
      },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
};

export const getGalleryItemById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const item = await prisma.galleryItem.findUnique({
      where: { id },
      include: {
        author: {
          select: { fullName: true, email: true, faculty: true },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching gallery item by id:', error);
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
};

export const getRecentGalleryItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.galleryItem.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        imageUrls: true,
        createdAt: true,
        author: {
          select: { fullName: true, email: true },
        },
      },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching recent gallery items:', error);
    res.status(500).json({ error: 'Failed to fetch recent gallery items' });
  }
};

export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    if (item.authorId !== userId && role !== 'MODERATOR' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.galleryItem.delete({
      where: { id },
    });

    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
};
