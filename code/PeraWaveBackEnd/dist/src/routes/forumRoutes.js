"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forumController_1 = require("../controllers/forumController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// GET  /api/forum/posts        – list posts (filtered by visibility for user, all for mod)
router.get('/posts', authMiddleware_1.verifyToken, forumController_1.getPosts);
// GET  /api/forum/posts/my-posts – posts authored by the current user
router.get('/posts/my-posts', authMiddleware_1.verifyToken, forumController_1.getMyPosts);
// GET  /api/forum/posts/:id    – get single post + comments
router.get('/posts/:id', authMiddleware_1.verifyToken, forumController_1.getPostById);
// POST /api/forum/posts        – create new post (user only)
router.post('/posts', authMiddleware_1.verifyToken, forumController_1.createPost);
// POST /api/forum/posts/:id/comments  – add comment
router.post('/posts/:id/comments', authMiddleware_1.verifyToken, forumController_1.addComment);
// POST /api/forum/posts/:id/vote      – upvote/downvote
router.post('/posts/:id/vote', authMiddleware_1.verifyToken, forumController_1.votePost);
// DELETE /api/forum/posts/:id  – author or moderator removes a post
router.delete('/posts/:id', authMiddleware_1.verifyToken, forumController_1.deletePost);
// DELETE /api/forum/comments/:id - author or moderator removes a comment
router.delete('/comments/:id', authMiddleware_1.verifyToken, forumController_1.deleteComment);
exports.default = router;
