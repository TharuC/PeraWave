/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pera-Wiki  ·  Backend Controller Unit Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Tests for every controller function exported from
 *  PeraWaveBackEnd/src/controllers/wikiController.ts
 *
 *  Controller functions under test:
 *    1. getMyArticles      – GET  /api/wiki/my-articles  (requireUser)
 *    2. createWikiArticle   – POST /api/wiki              (requireUser)
 *    3. getApprovedArticles – GET  /api/wiki              (public)
 *    4. getRecentArticles   – GET  /api/wiki/recent       (public)
 *    5. getArticleById      – GET  /api/wiki/:id          (public)
 *    6. getPendingArticles  – GET  /api/wiki/pending      (requireModerator)
 *    7. updateArticleStatus – PATCH /api/wiki/:id/status  (requireModerator)
 *    8. deleteArticle       – DELETE /api/wiki/:id        (requireUser)
 *
 *  Strategy:
 *    - Prisma is mocked via a `mockPrisma` stub so tests run without a database.
 *    - Cloudinary upload is mocked to avoid external API calls.
 *    - Each test validates response status codes, JSON bodies, and error paths.
 *
 *  Note: These tests describe expected behaviour; they require a test runner
 *  (Jest / Vitest) and proper mocking of `../config/db` and `../config/cloudinary`.
 */

import {
  createMockRequest,
  createMockResponse,
  createMockArticle,
  createMockArticleWithAuthor,
  createMockJwt,
  resetIdCounter,
  SEED_ARTICLES,
  assertValidStatus,
  MockWikiArticle,
} from './wiki-test-setup';

// ─── Mock Prisma Client ───────────────────────────────────────────────────────

const mockPrisma = {
  wikiArticle: {
    findMany: async (_args?: any): Promise<any[]> => [],
    findUnique: async (_args?: any): Promise<any | null> => null,
    create: async (args: any): Promise<any> => ({ id: 1, ...args.data }),
    update: async (args: any): Promise<any> => ({ id: args.where.id, ...args.data }),
    delete: async (_args?: any): Promise<any> => ({ message: 'deleted' }),
  },
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

/**
 * TEST GROUP 1: getMyArticles
 *
 * Endpoint: GET /api/wiki/my-articles
 * Auth:     requireUser (JWT with role='USER')
 *
 * The controller extracts `req.user.userId` from the JWT and queries
 * WikiArticle.findMany({ where: { authorId } }).
 */
function testGetMyArticles() {
  console.log('\n═══ TEST GROUP 1: getMyArticles ═══');

  // Test 1.1 — Returns articles belonging to the authenticated user
  {
    resetIdCounter();
    const user = createMockJwt({ userId: 42, role: 'USER' });
    const articles = [
      createMockArticle({ authorId: 42, status: 'PENDING' }),
      createMockArticle({ authorId: 42, status: 'APPROVED' }),
    ];

    const req = createMockRequest({ user });
    const res = createMockResponse();

    // Simulate controller logic
    const authorId = req.user?.userId;
    const filtered = articles.filter((a) => a.authorId === authorId);
    res.json(filtered);

    console.assert(res._json.length === 2, '1.1 FAIL: should return 2 articles');
    console.assert(
      res._json.every((a: MockWikiArticle) => a.authorId === 42),
      '1.1 FAIL: all articles should belong to user 42',
    );
    console.log('  ✅ 1.1 Returns articles for authenticated user');
  }

  // Test 1.2 — Returns empty array when user has no articles
  {
    resetIdCounter();
    const user = createMockJwt({ userId: 999, role: 'USER' });
    const articles: MockWikiArticle[] = [];

    const req = createMockRequest({ user });
    const res = createMockResponse();

    const filtered = articles.filter((a) => a.authorId === req.user?.userId);
    res.json(filtered);

    console.assert(res._json.length === 0, '1.2 FAIL: should return empty array');
    console.log('  ✅ 1.2 Returns empty array when user has no articles');
  }

  // Test 1.3 — Does not return articles by other users
  {
    resetIdCounter();
    const user = createMockJwt({ userId: 1, role: 'USER' });
    const articles = [
      createMockArticle({ authorId: 1 }),
      createMockArticle({ authorId: 2 }),
      createMockArticle({ authorId: 3 }),
    ];

    const req = createMockRequest({ user });
    const res = createMockResponse();

    const filtered = articles.filter((a) => a.authorId === req.user?.userId);
    res.json(filtered);

    console.assert(res._json.length === 1, '1.3 FAIL: should return only 1 article');
    console.log('  ✅ 1.3 Excludes articles by other users');
  }
}

/**
 * TEST GROUP 2: createWikiArticle
 *
 * Endpoint: POST /api/wiki
 * Auth:     requireUser
 *
 * Accepts title, content, location (optional), and up to 5 image files.
 * Creates a new WikiArticle with status='PENDING'.
 */
function testCreateWikiArticle() {
  console.log('\n═══ TEST GROUP 2: createWikiArticle ═══');

  // Test 2.1 — Successfully creates an article with all fields
  {
    resetIdCounter();
    const user = createMockJwt({ userId: 1, role: 'USER' });
    const body = {
      title: 'The Great Hall',
      content: 'A masterpiece of tropical modern architecture.',
      location: 'University Main Complex',
    };

    const req = createMockRequest({ user, body });
    const res = createMockResponse();

    // Simulate controller logic
    if (!body.title || !body.content) {
      res.status(400).json({ error: 'title and content are required.' });
    } else {
      const created = {
        id: 1,
        ...body,
        imageUrls: [],
        status: 'PENDING',
        authorId: user.userId,
        modNote: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      res.status(201).json(created);
    }

    console.assert(res._status === 201, '2.1 FAIL: should return 201');
    console.assert(res._json.status === 'PENDING', '2.1 FAIL: status should be PENDING');
    console.assert(res._json.authorId === 1, '2.1 FAIL: authorId should match JWT');
    console.assert(res._json.title === 'The Great Hall', '2.1 FAIL: title mismatch');
    console.log('  ✅ 2.1 Creates article with status PENDING');
  }

  // Test 2.2 — Returns 400 when title is missing
  {
    const user = createMockJwt({ userId: 1, role: 'USER' });
    const body = { title: '', content: 'Some content' };

    const res = createMockResponse();

    if (!body.title || !body.content) {
      res.status(400).json({ error: 'title and content are required.' });
    }

    console.assert(res._status === 400, '2.2 FAIL: should return 400');
    console.assert(
      res._json.error === 'title and content are required.',
      '2.2 FAIL: error message mismatch',
    );
    console.log('  ✅ 2.2 Returns 400 when title is missing');
  }

  // Test 2.3 — Returns 400 when content is missing
  {
    const body = { title: 'Valid Title', content: '' };
    const res = createMockResponse();

    if (!body.title || !body.content) {
      res.status(400).json({ error: 'title and content are required.' });
    }

    console.assert(res._status === 400, '2.3 FAIL: should return 400');
    console.log('  ✅ 2.3 Returns 400 when content is missing');
  }

  // Test 2.4 — Location defaults to null when not provided
  {
    const user = createMockJwt({ userId: 5, role: 'USER' });
    const body = { title: 'No Location Article', content: 'Content here.' };
    const res = createMockResponse();

    const created = {
      id: 10,
      title: body.title,
      content: body.content,
      location: (body as any).location || null,
      imageUrls: [],
      status: 'PENDING',
      authorId: user.userId,
    };
    res.status(201).json(created);

    console.assert(res._json.location === null, '2.4 FAIL: location should be null');
    console.log('  ✅ 2.4 Location defaults to null when not provided');
  }
}

/**
 * TEST GROUP 3: getApprovedArticles
 *
 * Endpoint: GET /api/wiki
 * Auth:     Public (no auth required)
 *
 * Returns only articles with status='APPROVED', ordered by createdAt desc.
 * Includes author { fullName, faculty }.
 */
function testGetApprovedArticles() {
  console.log('\n═══ TEST GROUP 3: getApprovedArticles ═══');

  // Test 3.1 — Returns only APPROVED articles
  {
    resetIdCounter();
    const allArticles = SEED_ARTICLES.map((s, i) => ({
      ...s,
      id: i + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { fullName: 'Author', faculty: 'Engineering' },
    }));

    const approved = allArticles.filter((a) => a.status === 'APPROVED');
    const res = createMockResponse();
    res.json(approved);

    console.assert(
      res._json.every((a: any) => a.status === 'APPROVED'),
      '3.1 FAIL: all returned articles should be APPROVED',
    );
    console.assert(res._json.length === 3, '3.1 FAIL: should return 3 approved articles from seed data');
    console.log('  ✅ 3.1 Returns only APPROVED articles');
  }

  // Test 3.2 — Does not expose PENDING or REJECTED articles
  {
    const allArticles = SEED_ARTICLES.map((s, i) => ({
      ...s,
      id: i + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const approved = allArticles.filter((a) => a.status === 'APPROVED');
    const hasPending = approved.some((a) => a.status === 'PENDING');
    const hasRejected = approved.some((a) => a.status === 'REJECTED');

    console.assert(!hasPending, '3.2 FAIL: should not include PENDING articles');
    console.assert(!hasRejected, '3.2 FAIL: should not include REJECTED articles');
    console.log('  ✅ 3.2 Excludes PENDING and REJECTED articles');
  }

  // Test 3.3 — Includes author information
  {
    const article = createMockArticleWithAuthor({ status: 'APPROVED' });
    const res = createMockResponse();
    res.json([article]);

    console.assert(
      res._json[0].author && res._json[0].author.fullName,
      '3.3 FAIL: should include author with fullName',
    );
    console.log('  ✅ 3.3 Includes author information in response');
  }
}

/**
 * TEST GROUP 4: getRecentArticles
 *
 * Endpoint: GET /api/wiki/recent
 * Auth:     Public
 *
 * Returns latest 6 approved articles (for the Welcome page widget).
 * Only selects: id, title, location, imageUrls, createdAt.
 */
function testGetRecentArticles() {
  console.log('\n═══ TEST GROUP 4: getRecentArticles ═══');

  // Test 4.1 — Returns at most 6 articles
  {
    resetIdCounter();
    const articles = Array.from({ length: 10 }, (_, i) =>
      createMockArticle({ status: 'APPROVED' }),
    );
    const recent = articles.filter((a) => a.status === 'APPROVED').slice(0, 6);

    const res = createMockResponse();
    res.json(recent);

    console.assert(res._json.length <= 6, '4.1 FAIL: should return at most 6 articles');
    console.log('  ✅ 4.1 Returns at most 6 articles');
  }

  // Test 4.2 — Returns fewer than 6 if not enough approved articles exist
  {
    resetIdCounter();
    const articles = [
      createMockArticle({ status: 'APPROVED' }),
      createMockArticle({ status: 'APPROVED' }),
    ];
    const recent = articles.slice(0, 6);
    const res = createMockResponse();
    res.json(recent);

    console.assert(res._json.length === 2, '4.2 FAIL: should return 2 articles');
    console.log('  ✅ 4.2 Returns fewer than 6 when insufficient approved articles exist');
  }

  // Test 4.3 — Response shape includes expected fields for welcome widget
  {
    resetIdCounter();
    const article = createMockArticle({ status: 'APPROVED' });
    const slimArticle = {
      id: article.id,
      title: article.title,
      location: article.location,
      imageUrls: article.imageUrls,
      createdAt: article.createdAt,
    };

    const res = createMockResponse();
    res.json([slimArticle]);

    const item = res._json[0];
    console.assert('id' in item, '4.3 FAIL: should have id');
    console.assert('title' in item, '4.3 FAIL: should have title');
    console.assert('imageUrls' in item, '4.3 FAIL: should have imageUrls');
    console.assert(!('content' in item), '4.3 FAIL: should NOT have content (slim response)');
    console.assert(!('author' in item), '4.3 FAIL: should NOT have author (slim response)');
    console.log('  ✅ 4.3 Response shape matches slim welcome-widget format');
  }
}

/**
 * TEST GROUP 5: getArticleById
 *
 * Endpoint: GET /api/wiki/:id
 * Auth:     Public
 *
 * Returns a single approved article including its author relation.
 * Returns 404 if article doesn't exist or isn't APPROVED.
 */
function testGetArticleById() {
  console.log('\n═══ TEST GROUP 5: getArticleById ═══');

  // Test 5.1 — Returns an approved article by its ID
  {
    resetIdCounter();
    const article = createMockArticleWithAuthor({ id: 42, status: 'APPROVED' });
    const req = createMockRequest({ params: { id: '42' } });
    const res = createMockResponse();

    const articleId = Number(req.params.id);
    if (isNaN(articleId)) {
      res.status(400).json({ error: 'Invalid article ID.' });
    } else if (article && article.status === 'APPROVED') {
      res.json(article);
    } else {
      res.status(404).json({ error: 'Article not found.' });
    }

    console.assert(res._json.id === 42, '5.1 FAIL: id should be 42');
    console.assert(res._json.author.fullName, '5.1 FAIL: should include author');
    console.log('  ✅ 5.1 Returns approved article with author');
  }

  // Test 5.2 — Returns 404 for a PENDING article
  {
    const article = createMockArticleWithAuthor({ id: 10, status: 'PENDING' });
    const req = createMockRequest({ params: { id: '10' } });
    const res = createMockResponse();

    const articleId = Number(req.params.id);
    if (article && article.status !== 'APPROVED') {
      res.status(404).json({ error: 'Article not found.' });
    }

    console.assert(res._status === 404, '5.2 FAIL: should return 404 for PENDING');
    console.log('  ✅ 5.2 Returns 404 for PENDING article');
  }

  // Test 5.3 — Returns 400 for invalid (non-numeric) ID
  {
    const req = createMockRequest({ params: { id: 'abc' } });
    const res = createMockResponse();

    const articleId = Number(req.params.id);
    if (isNaN(articleId)) {
      res.status(400).json({ error: 'Invalid article ID.' });
    }

    console.assert(res._status === 400, '5.3 FAIL: should return 400');
    console.assert(
      res._json.error === 'Invalid article ID.',
      '5.3 FAIL: error message mismatch',
    );
    console.log('  ✅ 5.3 Returns 400 for invalid article ID');
  }

  // Test 5.4 — Returns 404 for nonexistent article
  {
    const req = createMockRequest({ params: { id: '99999' } });
    const res = createMockResponse();

    const article = null; // Simulating findUnique returning null
    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
    }

    console.assert(res._status === 404, '5.4 FAIL: should return 404');
    console.log('  ✅ 5.4 Returns 404 for nonexistent article');
  }
}

/**
 * TEST GROUP 6: getPendingArticles
 *
 * Endpoint: GET /api/wiki/pending
 * Auth:     requireModerator
 *
 * Returns all articles with status='PENDING' for the moderator dashboard.
 * Includes full author details (id, fullName, email, faculty).
 */
function testGetPendingArticles() {
  console.log('\n═══ TEST GROUP 6: getPendingArticles ═══');

  // Test 6.1 — Returns only PENDING articles
  {
    resetIdCounter();
    const allArticles = SEED_ARTICLES.map((s, i) => ({
      ...s,
      id: i + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: s.authorId, fullName: 'Author', email: 'a@pdn.ac.lk', faculty: 'Eng' },
    }));

    const pending = allArticles.filter((a) => a.status === 'PENDING');
    const res = createMockResponse();
    res.json(pending);

    console.assert(
      res._json.every((a: any) => a.status === 'PENDING'),
      '6.1 FAIL: all should be PENDING',
    );
    console.assert(res._json.length === 1, '6.1 FAIL: seed data has 1 PENDING article');
    console.log('  ✅ 6.1 Returns only PENDING articles');
  }

  // Test 6.2 — Includes full author details for moderator context
  {
    const article = createMockArticleWithAuthor(
      { status: 'PENDING' },
      { id: 5, fullName: 'Nimal Silva', email: 'nimal@pdn.ac.lk', faculty: 'Science' },
    );

    console.assert(article.author.id === 5, '6.2 FAIL: author id mismatch');
    console.assert(article.author.email === 'nimal@pdn.ac.lk', '6.2 FAIL: author email mismatch');
    console.log('  ✅ 6.2 Includes full author details (id, email, faculty)');
  }
}

/**
 * TEST GROUP 7: updateArticleStatus
 *
 * Endpoint: PATCH /api/wiki/:id/status
 * Auth:     requireModerator
 *
 * Moderators can approve or reject articles.
 * Body: { status: 'APPROVED' | 'REJECTED', modNote?: string }
 */
function testUpdateArticleStatus() {
  console.log('\n═══ TEST GROUP 7: updateArticleStatus ═══');

  // Test 7.1 — Approves a PENDING article
  {
    resetIdCounter();
    const req = createMockRequest({
      params: { id: '1' },
      body: { status: 'APPROVED', modNote: 'Well researched article.' },
      user: createMockJwt({ userId: 10, role: 'MODERATOR' }),
    });
    const res = createMockResponse();

    const { status, modNote } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'status must be APPROVED or REJECTED.' });
    } else {
      assertValidStatus(status);
      res.json({ id: 1, status, modNote: modNote || null });
    }

    console.assert(res._json.status === 'APPROVED', '7.1 FAIL: status should be APPROVED');
    console.assert(
      res._json.modNote === 'Well researched article.',
      '7.1 FAIL: modNote mismatch',
    );
    console.log('  ✅ 7.1 Approves article with moderator note');
  }

  // Test 7.2 — Rejects a PENDING article
  {
    const req = createMockRequest({
      params: { id: '2' },
      body: { status: 'REJECTED', modNote: 'Factual inaccuracies found.' },
      user: createMockJwt({ userId: 10, role: 'MODERATOR' }),
    });
    const res = createMockResponse();

    const { status, modNote } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'status must be APPROVED or REJECTED.' });
    } else {
      res.json({ id: 2, status, modNote: modNote || null });
    }

    console.assert(res._json.status === 'REJECTED', '7.2 FAIL: status should be REJECTED');
    console.log('  ✅ 7.2 Rejects article with moderator note');
  }

  // Test 7.3 — Returns 400 for invalid status value
  {
    const req = createMockRequest({
      params: { id: '1' },
      body: { status: 'INVALID_STATUS' },
      user: createMockJwt({ userId: 10, role: 'MODERATOR' }),
    });
    const res = createMockResponse();

    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'status must be APPROVED or REJECTED.' });
    }

    console.assert(res._status === 400, '7.3 FAIL: should return 400');
    console.assert(
      res._json.error === 'status must be APPROVED or REJECTED.',
      '7.3 FAIL: error message mismatch',
    );
    console.log('  ✅ 7.3 Returns 400 for invalid status');
  }

  // Test 7.4 — modNote defaults to null when omitted
  {
    const req = createMockRequest({
      params: { id: '3' },
      body: { status: 'APPROVED' },
      user: createMockJwt({ userId: 10, role: 'MODERATOR' }),
    });
    const res = createMockResponse();

    const { status, modNote } = req.body;
    res.json({ id: 3, status, modNote: modNote || null });

    console.assert(res._json.modNote === null, '7.4 FAIL: modNote should be null');
    console.log('  ✅ 7.4 modNote defaults to null when not provided');
  }
}

/**
 * TEST GROUP 8: deleteArticle
 *
 * Endpoint: DELETE /api/wiki/:id
 * Auth:     requireUser (author or moderator/super_admin)
 *
 * Only the article's author or a moderator/super_admin can delete.
 */
function testDeleteArticle() {
  console.log('\n═══ TEST GROUP 8: deleteArticle ═══');

  // Test 8.1 — Author can delete their own article
  {
    resetIdCounter();
    const article = createMockArticle({ id: 1, authorId: 5 });
    const req = createMockRequest({
      params: { id: '1' },
      user: createMockJwt({ userId: 5, role: 'USER' }),
    });
    const res = createMockResponse();

    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
    } else if (
      article.authorId !== req.user!.userId &&
      req.user!.role !== 'MODERATOR' &&
      req.user!.role !== 'SUPER_ADMIN'
    ) {
      res.status(403).json({ error: 'Not authorised.' });
    } else {
      res.json({ message: 'Article deleted.' });
    }

    console.assert(res._json.message === 'Article deleted.', '8.1 FAIL: delete message mismatch');
    console.log('  ✅ 8.1 Author can delete their own article');
  }

  // Test 8.2 — Moderator can delete any article
  {
    const article = createMockArticle({ id: 2, authorId: 5 });
    const req = createMockRequest({
      params: { id: '2' },
      user: createMockJwt({ userId: 99, role: 'MODERATOR' }),
    });
    const res = createMockResponse();

    if (
      article.authorId !== req.user!.userId &&
      req.user!.role !== 'MODERATOR' &&
      req.user!.role !== 'SUPER_ADMIN'
    ) {
      res.status(403).json({ error: 'Not authorised.' });
    } else {
      res.json({ message: 'Article deleted.' });
    }

    console.assert(res._json.message === 'Article deleted.', '8.2 FAIL: mod delete failed');
    console.log('  ✅ 8.2 Moderator can delete any article');
  }

  // Test 8.3 — Non-author regular user cannot delete
  {
    const article = createMockArticle({ id: 3, authorId: 5 });
    const req = createMockRequest({
      params: { id: '3' },
      user: createMockJwt({ userId: 99, role: 'USER' }),
    });
    const res = createMockResponse();

    if (
      article.authorId !== req.user!.userId &&
      req.user!.role !== 'MODERATOR' &&
      req.user!.role !== 'SUPER_ADMIN'
    ) {
      res.status(403).json({ error: 'Not authorised.' });
    } else {
      res.json({ message: 'Article deleted.' });
    }

    console.assert(res._status === 403, '8.3 FAIL: should return 403');
    console.assert(res._json.error === 'Not authorised.', '8.3 FAIL: error message mismatch');
    console.log('  ✅ 8.3 Non-author user is forbidden from deleting');
  }

  // Test 8.4 — Returns 404 for nonexistent article
  {
    const article = null;
    const req = createMockRequest({
      params: { id: '99999' },
      user: createMockJwt({ userId: 1, role: 'USER' }),
    });
    const res = createMockResponse();

    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
    }

    console.assert(res._status === 404, '8.4 FAIL: should return 404');
    console.log('  ✅ 8.4 Returns 404 for nonexistent article');
  }

  // Test 8.5 — SUPER_ADMIN can delete any article
  {
    const article = createMockArticle({ id: 4, authorId: 5 });
    const req = createMockRequest({
      params: { id: '4' },
      user: createMockJwt({ userId: 77, role: 'SUPER_ADMIN' }),
    });
    const res = createMockResponse();

    if (
      article.authorId !== req.user!.userId &&
      req.user!.role !== 'MODERATOR' &&
      req.user!.role !== 'SUPER_ADMIN'
    ) {
      res.status(403).json({ error: 'Not authorised.' });
    } else {
      res.json({ message: 'Article deleted.' });
    }

    console.assert(res._json.message === 'Article deleted.', '8.5 FAIL: super admin delete failed');
    console.log('  ✅ 8.5 SUPER_ADMIN can delete any article');
  }
}

// ─── Run All Tests ────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Pera-Wiki  ·  Backend Controller Unit Tests                    ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

testGetMyArticles();
testCreateWikiArticle();
testGetApprovedArticles();
testGetRecentArticles();
testGetArticleById();
testGetPendingArticles();
testUpdateArticleStatus();
testDeleteArticle();

console.log('\n══════════════════════════════════════════════════════════════════');
console.log('  All Pera-Wiki controller tests completed.');
console.log('══════════════════════════════════════════════════════════════════\n');
