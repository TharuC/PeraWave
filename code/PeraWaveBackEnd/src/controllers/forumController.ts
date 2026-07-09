import { Request, Response } from 'express';
import prisma from '../config/db';

// Helper: derive batch from registration number
// Supports: E/23/900 -> E/23, E23-CO2060 -> E23
const deriveBatch = (regNum: string | null) => {
  if (!regNum) return null;
  const cleaned = regNum.trim();
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  }
  if (cleaned.includes('-')) {
    return cleaned.split('-')[0];
  }
  return cleaned.substring(0, 3);
};

// Helper: build author display info based on anonymous flag
const buildAuthorInfo = (post: any, isModerator: boolean) => {
  if (!post.isAnonymous) {
    return { displayName: post.authorName || 'Unknown', authorId: post.authorId };
  }
  if (isModerator) {
    // Moderators can see real identity even on anonymous posts
    return {
      displayName: 'Anonymous',
      authorId: post.authorId,
      realName: post.authorName || 'Unknown',   // hidden field only in mod view
      realEmail: post.authorEmail || '',
    };
  }
  return { displayName: 'Anonymous', authorId: null };
};

// ─── GET /api/forum/posts ──────────────────────────────────────────────────────
export const getPosts = async (req: any, res: Response) => {
  try {
    const userId  = req.user?.userId;
    const role    = req.user?.role;
    const isMod   = role === 'MODERATOR';

    // Fetch the requesting user so we can filter by faculty/batch
    let userFaculty  = '';
    let userBatch    = '';

    if (userId && !isMod) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      userFaculty  = user?.faculty || '';
      userBatch    = deriveBatch(user?.registrationNumber || '') || '';
    }

    // Build filter
    const orConditions: any[] = [{ visibility: 'UNIVERSITY_WIDE' }];
    if (userFaculty) {
      orConditions.push({ visibility: 'FACULTY_ONLY', faculty: userFaculty });
      if (userBatch) {
        orConditions.push({ visibility: 'BATCH_ONLY', batch: userBatch });
      }
    }

    const whereClause: any = isMod ? {} : { OR: orConditions };

    if (req.query.saved === 'true' && userId) {
      whereClause.savedBy = { some: { userId } };
    }

    const posts = await prisma.forumPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { comments: true } },
        votes: userId ? { where: { userId } } : false,
        savedBy: userId ? { where: { userId } } : false,
      },
    });

    // Resolve author names by fetching users
    const authorIds = [...new Set(posts.map((p) => p.authorId))];
    const authors   = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, fullName: true, email: true, faculty: true },
    });
    const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));

    // Fetch report counts for these posts if user is a moderator
    let reportCountMap: Record<number, number> = {};
    if (isMod) {
      const postIds = posts.map(p => p.id);
      const reports = await prisma.report.groupBy({
        by: ['contentId'],
        where: { contentType: 'POST', contentId: { in: postIds }, status: { not: 'REJECTED' } },
        _count: { _all: true },
      });
      reports.forEach(r => {
        reportCountMap[r.contentId] = r._count._all;
      });
    }

    const result = posts.map((post) => {
      const author = authorMap[post.authorId] || {};
      const info   = buildAuthorInfo(
        { ...post, authorName: author.fullName, authorEmail: (author as any).email },
        isMod
      );
      const userVote = post.votes && (post.votes as any[]).length > 0
        ? (post.votes as any[])[0].value
        : 0;
      return {
        id:           post.id,
        title:        post.title,
        content:      post.content,
        faculty:      post.faculty,
        batch:        post.batch,
        visibility:   post.visibility,
        isAnonymous:  post.isAnonymous,
        upvotes:      post.upvotes,
        commentCount: post._count.comments,
        createdAt:    post.createdAt,
        tags:         (post as any).tags || [],
        userVote,
        isSaved:      post.savedBy && (post.savedBy as any[]).length > 0,
        isAuthor:     post.authorId === userId,
        // Always expose email to mods; for normal users only if not anonymous
        authorEmail:  isMod ? (author as any).email : (!post.isAnonymous ? (author as any).email : undefined),
        reportCount:  isMod ? (reportCountMap[post.id] || 0) : undefined,
        ...info,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── GET /api/forum/posts/my-posts ────────────────────────────────────────────
export const getMyPosts = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const posts = await prisma.forumPost.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { comments: true } },
        votes: { where: { userId } },
      },
    });

    const result = posts.map((post) => {
      const userVote = (post.votes as any[]).length > 0 ? (post.votes as any[])[0].value : 0;
      return {
        id:           post.id,
        title:        post.title,
        content:      post.content,
        faculty:      post.faculty,
        batch:        post.batch,
        visibility:   post.visibility,
        isAnonymous:  post.isAnonymous,
        upvotes:      post.upvotes,
        commentCount: post._count.comments,
        createdAt:    post.createdAt,
        userVote,
        isAuthor:     true,
        displayName:  post.isAnonymous ? 'Anonymous (You)' : 'You',
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── GET /api/forum/posts/:id ──────────────────────────────────────────────────
export const getPostById = async (req: any, res: Response) => {
  try {
    const postId  = parseInt(req.params.id);
    const userId  = req.user?.userId;
    const isMod   = req.user?.role === 'MODERATOR';

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
        votes: userId ? { where: { userId } } : false,
        savedBy: userId ? { where: { userId } } : false,
      },
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const author = await prisma.user.findUnique({
      where: { id: post.authorId },
      select: { id: true, fullName: true, email: true },
    });

    const authorInfo = buildAuthorInfo(
      { ...post, authorName: author?.fullName, authorEmail: author?.email },
      isMod
    );

    // Resolve comment authors
    const commentAuthorIds = [...new Set(post.comments.map((c) => c.authorId))];
    const commentAuthors   = await prisma.user.findMany({
      where: { id: { in: commentAuthorIds } },
      select: { id: true, fullName: true },
    });
    const commentAuthorMap = Object.fromEntries(commentAuthors.map((a) => [a.id, a]));

    const commentsResult = post.comments.map((c) => {
      const ca = commentAuthorMap[c.authorId] || {};
      return {
        id:          c.id,
        content:     c.content,
        isAnonymous: c.isAnonymous,
        createdAt:   c.createdAt,
        displayName: c.isAnonymous
          ? isMod ? `Anonymous (${(ca as any).fullName || 'Unknown'})` : 'Anonymous'
          : (ca as any).fullName || 'Unknown',
        authorId:    c.isAnonymous && !isMod ? null : c.authorId,
        isAuthor:    c.authorId === userId,
      };
    });

    const userVote = post.votes && (post.votes as any[]).length > 0
      ? (post.votes as any[])[0].value
      : 0;

    return res.status(200).json({
      id:           post.id,
      title:        post.title,
      content:      post.content,
      faculty:      post.faculty,
      batch:        post.batch,
      visibility:   post.visibility,
      isAnonymous:  post.isAnonymous,
      upvotes:      post.upvotes,
      createdAt:    post.createdAt,
      tags:         (post as any).tags || [],
      userVote,
      isSaved:      post.savedBy && (post.savedBy as any[]).length > 0,
      isAuthor:     post.authorId === userId,
      comments:     commentsResult,
      ...authorInfo,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── POST /api/forum/posts ─────────────────────────────────────────────────────
export const createPost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    // Block suspended users
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return res.status(403).json({ error: 'Your account is suspended. You cannot post.' });
    }

    const { title, content, visibility, isAnonymous, faculty, batch, tags } = req.body;

    if (!title || !content || !visibility) {
      return res.status(400).json({ error: 'title, content, and visibility are required' });
    }

    const validVisibilities = ['UNIVERSITY_WIDE', 'FACULTY_ONLY', 'BATCH_ONLY'];
    if (!validVisibilities.includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    const VALID_TAGS = [
      'academics', 'non-academics', 'social', 'entertainment', 'sports',
      'arts & culture', 'music', 'travel', 'innovation', 'technology', 'funny'
    ];
    const cleanedTags = Array.isArray(tags)
      ? tags.filter((t: any) => typeof t === 'string' && VALID_TAGS.includes(t))
      : [];

    const post = await prisma.forumPost.create({
      data: {
        authorId:    userId,
        title:       title.trim(),
        content:     content.trim(),
        visibility,
        isAnonymous: isAnonymous === true,
        faculty:     faculty || user.faculty || null,
        batch:       batch   || deriveBatch(user.registrationNumber) || null,
        tags:        cleanedTags,
      },
    });

    return res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── POST /api/forum/posts/:id/comments ───────────────────────────────────────
export const addComment = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const postId      = parseInt(req.params.id);
    const { content, isAnonymous } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId:    userId,
        content:     content.trim(),
        isAnonymous: isAnonymous === true,
      },
    });

    return res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── POST /api/forum/posts/:id/vote ───────────────────────────────────────────
export const votePost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const postId = parseInt(req.params.id);
    const { value } = req.body; // 1 or -1

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existingVote = await prisma.postVote.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    let delta = 0;

    if (!existingVote) {
      await prisma.postVote.create({ data: { postId, userId, value } });
      delta = value;
    } else if (existingVote.value === value) {
      // Undo vote (toggle off)
      await prisma.postVote.delete({ where: { postId_userId: { postId, userId } } });
      delta = -value;
    } else {
      // Change vote direction
      await prisma.postVote.update({
        where: { postId_userId: { postId, userId } },
        data: { value },
      });
      delta = value * 2;
    }

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: { upvotes: { increment: delta } },
    });

    return res.status(200).json({ upvotes: updated.upvotes });
  } catch (error) {
    console.error('Error voting on post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── DELETE /api/forum/posts/:id  (author or mod) ──────────────────────────────
export const deletePost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isMod = req.user?.role === 'MODERATOR' || req.user?.role === 'SUPER_ADMIN';
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const postId = parseInt(req.params.id);
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!isMod && post.authorId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await prisma.forumPost.delete({ where: { id: postId } });
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── DELETE /api/forum/comments/:id  (author or mod) ──────────────────────────
export const deleteComment = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const isMod = req.user?.role === 'MODERATOR' || req.user?.role === 'SUPER_ADMIN';
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const commentId = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!isMod && comment.authorId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── POST /api/forum/posts/:id/save (toggle save) ──────────────────────────────
export const toggleSavePost = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const postId = parseInt(req.params.id);
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingSave = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedPost.delete({ where: { userId_postId: { userId, postId } } });
      return res.status(200).json({ message: 'Post unsaved', isSaved: false });
    } else {
      // Save
      await prisma.savedPost.create({ data: { userId, postId } });
      return res.status(200).json({ message: 'Post saved', isSaved: true });
    }
  } catch (error) {
    console.error('Error toggling save post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
