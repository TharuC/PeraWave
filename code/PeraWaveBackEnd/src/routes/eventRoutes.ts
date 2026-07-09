import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createEvent,
  getApprovedEvents,
  getEventById,
  getUpcomingEvents,
  getPendingEvents,
  updateEventStatus,
  deleteEvent,
} from '../controllers/eventController';
import { verifyToken, requireModerator } from '../middlewares/authMiddleware';

const router = Router();

// Multer — store temp files in ./uploads before uploading to Cloudinary
const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed.'));
    }
  },
});

// ── Public (authenticated users) ────────────────────────────────────────────────────────────────
router.get('/', verifyToken, getApprovedEvents);
router.get('/upcoming', verifyToken, getUpcomingEvents);
router.post('/', verifyToken, upload.single('flyer'), createEvent);

// ── Moderator only ────────────────────────────────────────────────────────────────
router.get('/pending', requireModerator, getPendingEvents);
router.patch('/:id/status', requireModerator, updateEventStatus);

// ── Parameterised routes (must come after named sub-routes) ──────────────────
router.get('/:id', verifyToken, getEventById);
router.delete('/:id', verifyToken, deleteEvent);

export default router;
