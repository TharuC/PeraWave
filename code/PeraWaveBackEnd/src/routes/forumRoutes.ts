import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  addComment,
  votePost,
  deletePost,
} from '../controllers/forumController';
import { verifyToken, requireModerator } from '../middlewares/authMiddleware';

const router = Router();

// GET  /api/forum/posts        – list posts (filtered by visibility for user, all for mod)
router.get('/posts', verifyToken, getPosts);

// GET  /api/forum/posts/:id    – get single post + comments
router.get('/posts/:id', verifyToken, getPostById);

// POST /api/forum/posts        – create new post (user only)
router.post('/posts', verifyToken, createPost);

// POST /api/forum/posts/:id/comments  – add comment
router.post('/posts/:id/comments', verifyToken, addComment);

// POST /api/forum/posts/:id/vote      – upvote/downvote
router.post('/posts/:id/vote', verifyToken, votePost);

// DELETE /api/forum/posts/:id  – moderator removes a post
router.delete('/posts/:id', requireModerator, deletePost);

export default router;
