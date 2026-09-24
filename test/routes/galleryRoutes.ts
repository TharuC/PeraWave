import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  createGalleryItem,
  getAllGalleryItems,
  getGalleryItemById,
  getRecentGalleryItems,
  deleteGalleryItem,
} from '../controllers/galleryController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed.'));
    }
  },
});

router.get('/', getAllGalleryItems);
router.get('/recent', getRecentGalleryItems);
router.post('/', verifyToken, upload.array('images', 5), createGalleryItem);
router.delete('/:id', verifyToken, deleteGalleryItem);
router.get('/:id', getGalleryItemById);

export default router;
