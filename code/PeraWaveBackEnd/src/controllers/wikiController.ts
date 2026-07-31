import { Request, Response } from 'express';
import prisma from '../config/db';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middlewares/authMiddleware';
import fs from 'fs';

// ── Helper ─────────────────────────────────────────────────────────────────────
const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'perawave/wiki-images',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  fs.unlink(filePath, () => {});
  return result.secure_url;
};

// ── POST /api/wiki ──────────────────────────────────────────────────────────────
// Authenticated users submit a new wiki article (starts as PENDING)
export const createWikiArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, location } = req.body;
    const authorId = req.user?.userId;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required.' });
    }

    const imageUrls: string[] = [];
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToCloudinary(file.path);
        imageUrls.push(url);
      }
    }

    const article = await prisma.wikiArticle.create({
      data: {
        title,
        content,
        location: location || null,
        imageUrls,
        authorId,
        status: 'PENDING',
      },
    });

    return res.status(201).json(article);
  } catch (err) {
    console.error('createWikiArticle error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/wiki ───────────────────────────────────────────────────────────────
// Returns all APPROVED wiki articles (public – no auth required)
export const getApprovedArticles = async (_req: Request, res: Response) => {
  try {
    const articles = await prisma.wikiArticle.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        location: true,
        imageUrls: true,
        createdAt: true,
        author: { select: { fullName: true, faculty: true } },
      },
    });
    return res.json(articles);
  } catch (err) {
    console.error('getApprovedArticles error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/wiki/recent ────────────────────────────────────────────────────────
// Returns the latest 6 approved articles for the Welcome page widget
export const getRecentArticles = async (_req: Request, res: Response) => {
  try {
    const articles = await prisma.wikiArticle.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        location: true,
        imageUrls: true,
        createdAt: true,
      },
    });
    return res.json(articles);
  } catch (err) {
    console.error('getRecentArticles error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/wiki/:id ──────────────────────────────────────────────────────────
// Returns a single approved article by ID (public – no auth required)
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const articleId = Number(req.params.id);
    if (isNaN(articleId)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }

    const article = await prisma.wikiArticle.findUnique({
      where: { id: articleId },
      include: { author: { select: { fullName: true, faculty: true } } },
    });

    if (!article || article.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Article not found.' });
    }

    return res.json(article);
  } catch (err) {
    console.error('getArticleById error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── GET /api/wiki/pending  (moderators only) ───────────────────────────────────
export const getPendingArticles = async (_req: Request, res: Response) => {
  try {
    const articles = await prisma.wikiArticle.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, fullName: true, email: true, faculty: true } },
      },
    });
    return res.json(articles);
  } catch (err) {
    console.error('getPendingArticles error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── PATCH /api/wiki/:id/status  (moderators only) ─────────────────────────────
export const updateArticleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const articleId = Number(req.params.id);
    const { status, modNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED.' });
    }

    const article = await prisma.wikiArticle.update({
      where: { id: articleId },
      data: { status, modNote: modNote || null },
    });

    return res.json(article);
  } catch (err) {
    console.error('updateArticleStatus error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ── DELETE /api/wiki/:id  (author or moderator) ────────────────────────────────
export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const articleId = Number(req.params.id);
    const userId = req.user?.userId;
    const role = req.user?.role;

    const article = await prisma.wikiArticle.findUnique({ where: { id: articleId } });
    if (!article) return res.status(404).json({ error: 'Article not found.' });

    if (article.authorId !== userId && role !== 'MODERATOR' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorised.' });
    }

    await prisma.wikiArticle.delete({ where: { id: articleId } });
    return res.json({ message: 'Article deleted.' });
  } catch (err) {
    console.error('deleteArticle error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
