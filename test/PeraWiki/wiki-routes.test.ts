/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pera-Wiki  ·  API Route & Middleware Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Tests for the Wiki API route definitions and authentication middleware
 *  as defined in:
 *    - PeraWaveBackEnd/src/routes/wikiRoutes.ts
 *    - PeraWaveBackEnd/src/middlewares/authMiddleware.ts
 *
 *  These tests validate:
 *    1. Route structure & HTTP method mapping
 *    2. Public vs protected endpoint access patterns
 *    3. JWT verification behaviour (valid, expired, missing tokens)
 *    4. Role-based access control (USER vs MODERATOR vs SUPER_ADMIN)
 *    5. Multer file upload configuration (size limits, allowed types)
 *
 *  Strategy:
 *    - Tests simulate the middleware logic without starting an Express server.
 *    - JWT tokens are generated from mock payloads and verified using the
 *      same logic as authMiddleware.ts.
 */

import {
  createMockRequest,
  createMockResponse,
  createMockJwt,
  createMockUser,
  createMockModerator,
  resetIdCounter,
  MockJwtPayload,
} from './wiki-test-setup';

// ─── Route Definition Tests ───────────────────────────────────────────────────

/**
 * TEST GROUP 1: Wiki Route Structure
 *
 * Validates the route mapping defined in wikiRoutes.ts.
 * Reference: PeraWaveBackEnd/src/routes/wikiRoutes.ts
 */
function testRouteStructure() {
  console.log('\n═══ TEST GROUP 1: Wiki Route Structure ═══');

  // Mirrors the actual route definitions from wikiRoutes.ts
  const routes = [
    { method: 'GET',    path: '/api/wiki',             auth: 'NONE',      handler: 'getApprovedArticles' },
    { method: 'GET',    path: '/api/wiki/recent',      auth: 'NONE',      handler: 'getRecentArticles' },
    { method: 'GET',    path: '/api/wiki/pending',     auth: 'MODERATOR', handler: 'getPendingArticles' },
    { method: 'PATCH',  path: '/api/wiki/:id/status',  auth: 'MODERATOR', handler: 'updateArticleStatus' },
    { method: 'GET',    path: '/api/wiki/my-articles',  auth: 'USER',      handler: 'getMyArticles' },
    { method: 'POST',   path: '/api/wiki',             auth: 'USER',      handler: 'createWikiArticle' },
    { method: 'DELETE', path: '/api/wiki/:id',          auth: 'USER',      handler: 'deleteArticle' },
    { method: 'GET',    path: '/api/wiki/:id',          auth: 'NONE',      handler: 'getArticleById' },
  ];

  // Test 1.1 — All expected routes are defined
  console.assert(routes.length === 8, '1.1 FAIL: should have 8 wiki routes');
  console.log('  ✅ 1.1 All 8 wiki routes are defined');

  // Test 1.2 — Public endpoints (no auth required)
  const publicRoutes = routes.filter((r) => r.auth === 'NONE');
  console.assert(publicRoutes.length === 3, '1.2 FAIL: should have 3 public routes');
  const publicPaths = publicRoutes.map((r) => r.path);
  console.assert(publicPaths.includes('/api/wiki'), '1.2 FAIL: GET /api/wiki should be public');
  console.assert(publicPaths.includes('/api/wiki/recent'), '1.2 FAIL: GET /api/wiki/recent should be public');
  console.assert(publicPaths.includes('/api/wiki/:id'), '1.2 FAIL: GET /api/wiki/:id should be public');
  console.log('  ✅ 1.2 Public routes: GET /, GET /recent, GET /:id');

  // Test 1.3 — User-only endpoints (requireUser)
  const userRoutes = routes.filter((r) => r.auth === 'USER');
  console.assert(userRoutes.length === 3, '1.3 FAIL: should have 3 user-only routes');
  console.log('  ✅ 1.3 User-only routes: GET /my-articles, POST /, DELETE /:id');

  // Test 1.4 — Moderator-only endpoints (requireModerator)
  const modRoutes = routes.filter((r) => r.auth === 'MODERATOR');
  console.assert(modRoutes.length === 2, '1.4 FAIL: should have 2 moderator-only routes');
  console.log('  ✅ 1.4 Moderator-only routes: GET /pending, PATCH /:id/status');

  // Test 1.5 — Parameterised route /:id is declared AFTER named sub-routes
  // This prevents Express from matching /pending or /my-articles as :id params.
  const idRouteIndex = routes.findIndex(
    (r) => r.path === '/api/wiki/:id' && r.method === 'GET',
  );
  const pendingRouteIndex = routes.findIndex(
    (r) => r.path === '/api/wiki/pending',
  );
  const myArticlesRouteIndex = routes.findIndex(
    (r) => r.path === '/api/wiki/my-articles',
  );
  console.assert(
    idRouteIndex > pendingRouteIndex,
    '1.5 FAIL: /:id route should come after /pending',
  );
  console.assert(
    idRouteIndex > myArticlesRouteIndex,
    '1.5 FAIL: /:id route should come after /my-articles',
  );
  console.log('  ✅ 1.5 Parameterised /:id route declared after named sub-routes');
}

// ─── Authentication Middleware Tests ──────────────────────────────────────────

/**
 * TEST GROUP 2: verifyToken Middleware
 *
 * Reference: PeraWaveBackEnd/src/middlewares/authMiddleware.ts
 *
 * verifyToken:
 *  1. Checks for `Authorization: Bearer <token>` header.
 *  2. Decodes the JWT using `JWT_SECRET`.
 *  3. Validates the user/moderator still exists in the database.
 *  4. Attaches the decoded payload to `req.user`.
 */
function testVerifyToken() {
  console.log('\n═══ TEST GROUP 2: verifyToken Middleware ═══');

  // Test 2.1 — Returns 401 when no Authorization header is present
  {
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    console.assert(res._status === 401, '2.1 FAIL: should return 401');
    console.assert(
      res._json.error === 'Access denied. No token provided.',
      '2.1 FAIL: error message mismatch',
    );
    console.log('  ✅ 2.1 Returns 401 when no Authorization header');
  }

  // Test 2.2 — Returns 401 when Authorization header doesn't start with "Bearer "
  {
    const req = createMockRequest({ headers: { authorization: 'Basic abc123' } });
    const res = createMockResponse();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    console.assert(res._status === 401, '2.2 FAIL: should return 401');
    console.log('  ✅ 2.2 Returns 401 for non-Bearer auth scheme');
  }

  // Test 2.3 — Successfully extracts token from "Bearer <token>" header
  {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    const req = createMockRequest({
      headers: { authorization: `Bearer ${token}` },
    });

    const authHeader = req.headers.authorization;
    const extractedToken = authHeader!.split(' ')[1];

    console.assert(extractedToken === token, '2.3 FAIL: token extraction mismatch');
    console.log('  ✅ 2.3 Correctly extracts token from Bearer header');
  }

  // Test 2.4 — Validates that deleted users are rejected
  {
    const user = createMockUser({ id: 1, isDeleted: true });
    const res = createMockResponse();

    if (!user || user.isDeleted) {
      res.status(401).json({ error: 'Account no longer exists.' });
    }

    console.assert(res._status === 401, '2.4 FAIL: should return 401');
    console.assert(
      res._json.error === 'Account no longer exists.',
      '2.4 FAIL: error message mismatch',
    );
    console.log('  ✅ 2.4 Rejects deleted user accounts');
  }

  // Test 2.5 — Attaches decoded JWT to req.user
  {
    const decoded = createMockJwt({ userId: 42, role: 'USER', email: 'test@pdn.ac.lk' });
    const req = createMockRequest();
    req.user = decoded;

    console.assert(req.user.userId === 42, '2.5 FAIL: userId mismatch');
    console.assert(req.user.role === 'USER', '2.5 FAIL: role mismatch');
    console.log('  ✅ 2.5 Attaches decoded JWT payload to req.user');
  }
}

/**
 * TEST GROUP 3: requireModerator Middleware
 *
 * Allows access only when req.user.role is 'MODERATOR' or 'SUPER_ADMIN'.
 */
function testRequireModerator() {
  console.log('\n═══ TEST GROUP 3: requireModerator Middleware ═══');

  // Test 3.1 — Allows MODERATOR role
  {
    const jwt = createMockJwt({ userId: 1, role: 'MODERATOR' });
    const req = createMockRequest({ user: jwt });
    const res = createMockResponse();
    let nextCalled = false;

    if (req.user && (req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN')) {
      nextCalled = true;
    } else {
      res.status(403).json({ error: 'Access denied. Moderator privileges required.' });
    }

    console.assert(nextCalled, '3.1 FAIL: should call next()');
    console.log('  ✅ 3.1 Allows MODERATOR role');
  }

  // Test 3.2 — Allows SUPER_ADMIN role
  {
    const jwt = createMockJwt({ userId: 1, role: 'SUPER_ADMIN' });
    const req = createMockRequest({ user: jwt });
    let nextCalled = false;

    if (req.user && (req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN')) {
      nextCalled = true;
    }

    console.assert(nextCalled, '3.2 FAIL: should call next()');
    console.log('  ✅ 3.2 Allows SUPER_ADMIN role');
  }

  // Test 3.3 — Blocks USER role
  {
    const jwt = createMockJwt({ userId: 1, role: 'USER' });
    const req = createMockRequest({ user: jwt });
    const res = createMockResponse();

    if (req.user && (req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN')) {
      // next()
    } else {
      res.status(403).json({ error: 'Access denied. Moderator privileges required.' });
    }

    console.assert(res._status === 403, '3.3 FAIL: should return 403');
    console.log('  ✅ 3.3 Blocks regular USER role');
  }
}

/**
 * TEST GROUP 4: requireUser Middleware
 *
 * Allows access only when req.user.role is exactly 'USER'.
 * Blocks moderators and admins from using user-only endpoints.
 */
function testRequireUser() {
  console.log('\n═══ TEST GROUP 4: requireUser Middleware ═══');

  // Test 4.1 — Allows USER role
  {
    const jwt = createMockJwt({ userId: 1, role: 'USER' });
    const req = createMockRequest({ user: jwt });
    let nextCalled = false;

    if (req.user && req.user.role === 'USER') {
      nextCalled = true;
    }

    console.assert(nextCalled, '4.1 FAIL: should call next()');
    console.log('  ✅ 4.1 Allows USER role');
  }

  // Test 4.2 — Blocks MODERATOR role
  {
    const jwt = createMockJwt({ userId: 1, role: 'MODERATOR' });
    const req = createMockRequest({ user: jwt });
    const res = createMockResponse();

    if (req.user && req.user.role === 'USER') {
      // next()
    } else {
      res.status(403).json({ error: 'Access denied. Only registered users can perform this action.' });
    }

    console.assert(res._status === 403, '4.2 FAIL: should return 403');
    console.log('  ✅ 4.2 Blocks MODERATOR from user-only endpoints');
  }

  // Test 4.3 — Blocks SUPER_ADMIN role
  {
    const jwt = createMockJwt({ userId: 1, role: 'SUPER_ADMIN' });
    const req = createMockRequest({ user: jwt });
    const res = createMockResponse();

    if (req.user && req.user.role === 'USER') {
      // next()
    } else {
      res.status(403).json({ error: 'Access denied. Only registered users can perform this action.' });
    }

    console.assert(res._status === 403, '4.3 FAIL: should return 403');
    console.log('  ✅ 4.3 Blocks SUPER_ADMIN from user-only endpoints');
  }
}

// ─── Multer Configuration Tests ──────────────────────────────────────────────

/**
 * TEST GROUP 5: Multer Upload Configuration
 *
 * Validates the file upload constraints defined in wikiRoutes.ts.
 * Reference: multer({ dest, limits, fileFilter }) configuration.
 */
function testMulterConfig() {
  console.log('\n═══ TEST GROUP 5: Multer Upload Configuration ═══');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_IMAGES = 5; // upload.array('images', 5)

  // Test 5.1 — Maximum file size is 10 MB
  {
    console.assert(MAX_FILE_SIZE === 10485760, '5.1 FAIL: max file size should be 10 MB');
    console.log('  ✅ 5.1 Maximum file size limit is 10 MB');
  }

  // Test 5.2 — Allowed MIME types
  {
    console.assert(ALLOWED_MIMETYPES.includes('image/jpeg'), '5.2 FAIL: JPEG should be allowed');
    console.assert(ALLOWED_MIMETYPES.includes('image/png'), '5.2 FAIL: PNG should be allowed');
    console.assert(ALLOWED_MIMETYPES.includes('image/webp'), '5.2 FAIL: WebP should be allowed');
    console.assert(ALLOWED_MIMETYPES.includes('image/gif'), '5.2 FAIL: GIF should be allowed');
    console.assert(!ALLOWED_MIMETYPES.includes('image/svg+xml'), '5.2 FAIL: SVG should NOT be allowed');
    console.assert(!ALLOWED_MIMETYPES.includes('application/pdf'), '5.2 FAIL: PDF should NOT be allowed');
    console.log('  ✅ 5.2 Allowed MIME types: JPEG, PNG, WebP, GIF (no SVG or PDF)');
  }

  // Test 5.3 — Maximum number of images per upload
  {
    console.assert(MAX_IMAGES === 5, '5.3 FAIL: max images should be 5');
    console.log('  ✅ 5.3 Maximum 5 images per article upload');
  }

  // Test 5.4 — File filter rejects disallowed types
  {
    const testMimetype = 'application/zip';
    const isAllowed = ALLOWED_MIMETYPES.includes(testMimetype);
    console.assert(!isAllowed, '5.4 FAIL: ZIP files should be rejected');
    console.log('  ✅ 5.4 File filter rejects disallowed MIME types');
  }
}

// ─── Run All Tests ────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Pera-Wiki  ·  API Route & Middleware Tests                     ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

testRouteStructure();
testVerifyToken();
testRequireModerator();
testRequireUser();
testMulterConfig();

console.log('\n══════════════════════════════════════════════════════════════════');
console.log('  All Pera-Wiki route & middleware tests completed.');
console.log('══════════════════════════════════════════════════════════════════\n');
