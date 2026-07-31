import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createWikiArticle,
  getApprovedArticles,
  getRecentArticles,
  getArticleById,
  getPendingArticles,
  updateArticleStatus,
  deleteArticle,
} from '../controllers/wikiController';
import { verifyToken, requireModerator } from '../middlewares/authMiddleware';

const router = Router();

// Multer — store temp files in ./uploads before uploading to Cloudinary
const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max per image
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed.'));
    }
  },
});

// ── Public endpoints (no auth required) ─────────────────────────────────────────
router.get('/', getApprovedArticles);
router.get('/recent', getRecentArticles);

// ── Moderator-only endpoints ────────────────────────────────────────────────────
router.get('/pending', requireModerator, getPendingArticles);
router.patch('/:id/status', requireModerator, updateArticleStatus);

// ── Authenticated user endpoints ────────────────────────────────────────────────
router.post('/', verifyToken, upload.array('images', 5), createWikiArticle);
router.delete('/:id', verifyToken, deleteArticle);

// ── Parameterised public routes (must come after named sub-routes) ───────────────
router.get('/:id', getArticleById);

export default router;
