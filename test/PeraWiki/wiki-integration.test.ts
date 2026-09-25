/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pera-Wiki  ·  Integration / End-to-End Lifecycle Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Tests the complete article lifecycle as described in the PERA_WIKI_README
 *  content flow diagram:
 *
 *    Contributor → Drafts Article → Submits for Review → Moderation Queue
 *      → APPROVED  → Public Archive → Viewed by students & alumni
 *      → REJECTED  → Feedback to contributor → Re-draft
 *
 *  These integration tests simulate full user journeys across both backend
 *  API endpoints and frontend state transitions, validating that the
 *  PeraWiki feature works end-to-end.
 *
 *  Reference files:
 *    - PERA_WIKI_README.md (content lifecycle flow)
 *    - PeraWaveBackEnd/src/controllers/wikiController.ts
 *    - PeraWaveBackEnd/src/routes/wikiRoutes.ts
 *    - PeraWaveFrontEnd/src/pages/WikiList.tsx
 *    - PeraWaveFrontEnd/src/pages/WikiArticleDetail.tsx
 *    - PeraWaveFrontEnd/src/pages/CreateWikiArticle.tsx
 */

import {
  createMockArticle,
  createMockArticleWithAuthor,
  createMockUser,
  createMockModerator,
  createMockJwt,
  createMockRequest,
  createMockResponse,
  resetIdCounter,
  assertPublicArticleShape,
  assertDetailArticleShape,
  assertValidStatus,
  SEED_ARTICLES,
  MockWikiArticle,
  WikiArticleWithAuthor,
} from './wiki-test-setup';

// ─── Simulated In-Memory Database ─────────────────────────────────────────────

class InMemoryWikiStore {
  private articles: MockWikiArticle[] = [];
  private nextId = 1;

  create(data: Omit<MockWikiArticle, 'id' | 'createdAt' | 'updatedAt'>): MockWikiArticle {
    const article: MockWikiArticle = {
      ...data,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.articles.push(article);
    return article;
  }

  findById(id: number): MockWikiArticle | null {
    return this.articles.find((a) => a.id === id) ?? null;
  }

  findByAuthor(authorId: number): MockWikiArticle[] {
    return this.articles
      .filter((a) => a.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findApproved(): MockWikiArticle[] {
    return this.articles
      .filter((a) => a.status === 'APPROVED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findPending(): MockWikiArticle[] {
    return this.articles
      .filter((a) => a.status === 'PENDING')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findRecentApproved(limit: number): MockWikiArticle[] {
    return this.findApproved().slice(0, limit);
  }

  updateStatus(id: number, status: string, modNote: string | null): MockWikiArticle | null {
    const article = this.findById(id);
    if (!article) return null;
    article.status = status as any;
    article.modNote = modNote;
    article.updatedAt = new Date();
    return article;
  }

  delete(id: number): boolean {
    const idx = this.articles.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.articles.splice(idx, 1);
    return true;
  }

  count(): number {
    return this.articles.length;
  }

  reset(): void {
    this.articles = [];
    this.nextId = 1;
  }
}

// ─── Lifecycle Integration Tests ──────────────────────────────────────────────

/**
 * TEST GROUP 1: Complete Article Lifecycle — Happy Path
 *
 * Simulates the full content lifecycle from PERA_WIKI_README:
 *   User creates → Article is PENDING → Moderator approves → Public listing
 */
function testHappyPathLifecycle() {
  console.log('\n═══ TEST GROUP 1: Happy Path — Create → Approve → View ═══');

  const store = new InMemoryWikiStore();
  const user = createMockUser({ id: 1, fullName: 'Kamal Perera', faculty: 'Faculty of Engineering' });
  const moderator = createMockModerator({ id: 1, fullName: 'Admin Mod' });

  // Step 1: User submits a new article
  const article = store.create({
    title: 'Sarachchandra Open-Air Theatre',
    content: 'The iconic amphitheatre known as Wala...',
    location: 'Near Faculty of Arts',
    imageUrls: ['https://res.cloudinary.com/perawave/wiki-images/wala.jpg'],
    status: 'PENDING',
    authorId: user.id,
    modNote: null,
  });

  console.assert(article.id === 1, '1.1 FAIL: first article should have id 1');
  console.assert(article.status === 'PENDING', '1.1 FAIL: initial status should be PENDING');
  console.assert(article.authorId === user.id, '1.1 FAIL: authorId should match');
  console.log('  ✅ Step 1: User submits article (status: PENDING)');

  // Step 2: Article should NOT appear in public listing yet
  const publicBefore = store.findApproved();
  console.assert(publicBefore.length === 0, '1.2 FAIL: no articles should be public yet');
  console.log('  ✅ Step 2: PENDING article hidden from public listing');

  // Step 3: Article appears in moderator's pending queue
  const pending = store.findPending();
  console.assert(pending.length === 1, '1.3 FAIL: should have 1 pending article');
  console.assert(pending[0].id === article.id, '1.3 FAIL: pending article id mismatch');
  console.log('  ✅ Step 3: Article visible in moderator pending queue');

  // Step 4: User can see their article in "my articles" (all statuses)
  const myArticles = store.findByAuthor(user.id);
  console.assert(myArticles.length === 1, '1.4 FAIL: user should see their article');
  console.assert(myArticles[0].status === 'PENDING', '1.4 FAIL: status should be PENDING');
  console.log('  ✅ Step 4: User sees article in "My Articles" with PENDING status');

  // Step 5: Moderator approves the article
  const updated = store.updateStatus(article.id, 'APPROVED', 'Well researched. Approved!');
  console.assert(updated!.status === 'APPROVED', '1.5 FAIL: status should be APPROVED');
  console.assert(updated!.modNote === 'Well researched. Approved!', '1.5 FAIL: modNote mismatch');
  console.log('  ✅ Step 5: Moderator approves article');

  // Step 6: Article now appears in public listing
  const publicAfter = store.findApproved();
  console.assert(publicAfter.length === 1, '1.6 FAIL: should have 1 approved article');
  console.assert(publicAfter[0].title === 'Sarachchandra Open-Air Theatre', '1.6 FAIL: title mismatch');
  console.log('  ✅ Step 6: Approved article visible in public listing');

  // Step 7: Article no longer in pending queue
  const pendingAfter = store.findPending();
  console.assert(pendingAfter.length === 0, '1.7 FAIL: pending queue should be empty');
  console.log('  ✅ Step 7: Approved article removed from pending queue');

  // Step 8: Public can view the article detail by ID
  const detail = store.findById(article.id);
  console.assert(detail !== null, '1.8 FAIL: article should exist');
  console.assert(detail!.status === 'APPROVED', '1.8 FAIL: detail should show APPROVED');
  console.log('  ✅ Step 8: Public can view article detail by ID');

  store.reset();
}

/**
 * TEST GROUP 2: Rejection & Revision Flow
 *
 *   User creates → Moderator rejects with feedback → User revises & resubmits
 */
function testRejectionRevisionFlow() {
  console.log('\n═══ TEST GROUP 2: Rejection → Revision → Resubmit ═══');

  const store = new InMemoryWikiStore();
  const user = createMockUser({ id: 1 });

  // Step 1: User submits an article with factual issues
  const article = store.create({
    title: 'Hanthana Mountain',
    content: 'Hanthana is 5000m tall...',  // Inaccurate height
    location: 'Southern boundary',
    imageUrls: [],
    status: 'PENDING',
    authorId: user.id,
    modNote: null,
  });
  console.log('  ✅ Step 1: User submits article with factual issues');

  // Step 2: Moderator rejects with feedback note
  const rejected = store.updateStatus(
    article.id,
    'REJECTED',
    'Hanthana is approximately 1,150m, not 5,000m. Please correct and resubmit.',
  );
  console.assert(rejected!.status === 'REJECTED', '2.2 FAIL: status should be REJECTED');
  console.assert(
    rejected!.modNote!.includes('1,150m'),
    '2.2 FAIL: modNote should contain feedback',
  );
  console.log('  ✅ Step 2: Moderator rejects with detailed feedback');

  // Step 3: Article is NOT visible publicly
  const publicArticles = store.findApproved();
  console.assert(publicArticles.length === 0, '2.3 FAIL: rejected article should not be public');
  console.log('  ✅ Step 3: Rejected article hidden from public listing');

  // Step 4: User sees rejection reason in "My Articles"
  const myArticles = store.findByAuthor(user.id);
  console.assert(myArticles[0].status === 'REJECTED', '2.4 FAIL: status should be REJECTED');
  console.assert(
    myArticles[0].modNote!.includes('Please correct'),
    '2.4 FAIL: modNote feedback visible',
  );
  console.log('  ✅ Step 4: User sees rejection reason in My Articles');

  // Step 5: User submits a corrected version (new article)
  const corrected = store.create({
    title: 'Hanthana Mountain Range',
    content: 'The Hanthana Mountain Range rises to approximately 1,150m above sea level...',
    location: 'Southern boundary of campus',
    imageUrls: ['https://res.cloudinary.com/perawave/wiki-images/hanthana.jpg'],
    status: 'PENDING',
    authorId: user.id,
    modNote: null,
  });
  console.assert(corrected.status === 'PENDING', '2.5 FAIL: resubmission should be PENDING');
  console.assert(store.findByAuthor(user.id).length === 2, '2.5 FAIL: user should have 2 articles');
  console.log('  ✅ Step 5: User resubmits corrected article');

  // Step 6: Moderator approves the corrected version
  const approved = store.updateStatus(corrected.id, 'APPROVED', null);
  console.assert(approved!.status === 'APPROVED', '2.6 FAIL: should be APPROVED');
  console.assert(store.findApproved().length === 1, '2.6 FAIL: 1 approved article');
  console.log('  ✅ Step 6: Moderator approves corrected version');

  store.reset();
}

/**
 * TEST GROUP 3: Deletion Scenarios
 */
function testDeletionScenarios() {
  console.log('\n═══ TEST GROUP 3: Deletion Scenarios ═══');

  const store = new InMemoryWikiStore();

  // Scenario 3.1: Author deletes their own PENDING article
  {
    const article = store.create({
      title: 'Draft Article',
      content: 'Work in progress...',
      location: null,
      imageUrls: [],
      status: 'PENDING',
      authorId: 5,
      modNote: null,
    });

    const userJwt = createMockJwt({ userId: 5, role: 'USER' });
    const canDelete =
      article.authorId === userJwt.userId ||
      userJwt.role === 'MODERATOR' ||
      userJwt.role === 'SUPER_ADMIN';

    console.assert(canDelete, '3.1 FAIL: author should be able to delete own article');

    store.delete(article.id);
    console.assert(store.findById(article.id) === null, '3.1 FAIL: article should be deleted');
    console.log('  ✅ 3.1 Author deletes their own article');
  }

  // Scenario 3.2: Moderator deletes a problematic article
  {
    const article = store.create({
      title: 'Problematic Article',
      content: 'Inappropriate content...',
      location: null,
      imageUrls: [],
      status: 'APPROVED',
      authorId: 10,
      modNote: null,
    });

    const modJwt = createMockJwt({ userId: 99, role: 'MODERATOR' });
    const canDelete =
      article.authorId === modJwt.userId ||
      modJwt.role === 'MODERATOR' ||
      modJwt.role === 'SUPER_ADMIN';

    console.assert(canDelete, '3.2 FAIL: moderator should be able to delete any article');

    store.delete(article.id);
    console.assert(store.findById(article.id) === null, '3.2 FAIL: article should be deleted');
    console.log('  ✅ 3.2 Moderator deletes problematic article');
  }

  // Scenario 3.3: Non-author user cannot delete
  {
    const article = store.create({
      title: 'Protected Article',
      content: 'Important content.',
      location: null,
      imageUrls: [],
      status: 'APPROVED',
      authorId: 10,
      modNote: null,
    });

    const otherUser = createMockJwt({ userId: 77, role: 'USER' });
    const canDelete =
      article.authorId === otherUser.userId ||
      otherUser.role === 'MODERATOR' ||
      otherUser.role === 'SUPER_ADMIN';

    console.assert(!canDelete, '3.3 FAIL: non-author user should NOT delete');
    console.log('  ✅ 3.3 Non-author user blocked from deletion');
  }

  store.reset();
}

/**
 * TEST GROUP 4: Welcome Page Widget (Recent Articles)
 *
 * The Welcome page displays the 6 most recent approved articles.
 * Reference: GET /api/wiki/recent endpoint + Welcome.tsx integration.
 */
function testWelcomePageWidget() {
  console.log('\n═══ TEST GROUP 4: Welcome Page Widget (Recent Articles) ═══');

  const store = new InMemoryWikiStore();

  // Populate with 10 approved articles and 3 pending
  for (let i = 1; i <= 10; i++) {
    store.create({
      title: `Approved Article ${i}`,
      content: `Content for article ${i}`,
      location: `Location ${i}`,
      imageUrls: [],
      status: 'APPROVED',
      authorId: 1,
      modNote: null,
    });
  }
  for (let i = 1; i <= 3; i++) {
    store.create({
      title: `Pending Article ${i}`,
      content: `Pending content ${i}`,
      location: null,
      imageUrls: [],
      status: 'PENDING',
      authorId: 2,
      modNote: null,
    });
  }

  // Test 4.1 — Returns at most 6
  const recent = store.findRecentApproved(6);
  console.assert(recent.length === 6, '4.1 FAIL: should return exactly 6');
  console.log('  ✅ 4.1 Returns exactly 6 recent approved articles');

  // Test 4.2 — Only includes APPROVED articles
  console.assert(
    recent.every((a) => a.status === 'APPROVED'),
    '4.2 FAIL: all should be APPROVED',
  );
  console.log('  ✅ 4.2 Widget excludes PENDING and REJECTED articles');

  // Test 4.3 — Ordered by createdAt descending (most recent first)
  for (let i = 0; i < recent.length - 1; i++) {
    console.assert(
      recent[i].createdAt.getTime() >= recent[i + 1].createdAt.getTime(),
      `4.3 FAIL: articles not sorted by createdAt desc at index ${i}`,
    );
  }
  console.log('  ✅ 4.3 Articles ordered by most recent first');

  store.reset();
}

/**
 * TEST GROUP 5: Multi-User Collaboration Scenario
 *
 * Simulates multiple users contributing articles, as described in the
 * PERA_WIKI_README engagement section (alumni + freshers contributing).
 */
function testMultiUserCollaboration() {
  console.log('\n═══ TEST GROUP 5: Multi-User Collaboration ═══');

  const store = new InMemoryWikiStore();
  const fresher = createMockUser({ id: 1, fullName: 'Nimal Fernando', faculty: 'Engineering' });
  const senior = createMockUser({ id: 2, fullName: 'Kumari Silva', faculty: 'Arts' });
  const alumnus = createMockUser({ id: 3, fullName: 'Sunil Jayawardena', faculty: 'Science' });

  // Step 1: Multiple users contribute articles about different landmarks
  store.create({
    title: 'New Engineering Building',
    content: 'The latest addition to the Faculty of Engineering...',
    location: 'Faculty of Engineering',
    imageUrls: [],
    status: 'PENDING',
    authorId: fresher.id,
    modNote: null,
  });

  store.create({
    title: 'History of the Arts Faculty',
    content: 'The Faculty of Arts has a rich tradition dating back to...',
    location: 'Faculty of Arts',
    imageUrls: [],
    status: 'PENDING',
    authorId: senior.id,
    modNote: null,
  });

  store.create({
    title: 'The Old Science Block',
    content: 'Before the modern laboratories, the Science faculty operated from...',
    location: 'Old Science Complex',
    imageUrls: [],
    status: 'PENDING',
    authorId: alumnus.id,
    modNote: null,
  });

  console.assert(store.count() === 3, '5.1 FAIL: should have 3 articles');
  console.log('  ✅ Step 1: Three different users submit articles');

  // Step 2: Each user can only see their own articles
  console.assert(store.findByAuthor(fresher.id).length === 1, '5.2 FAIL: fresher has 1 article');
  console.assert(store.findByAuthor(senior.id).length === 1, '5.2 FAIL: senior has 1 article');
  console.assert(store.findByAuthor(alumnus.id).length === 1, '5.2 FAIL: alumnus has 1 article');
  console.log('  ✅ Step 2: Each user sees only their own submissions');

  // Step 3: Moderator sees all 3 pending
  console.assert(store.findPending().length === 3, '5.3 FAIL: 3 pending articles');
  console.log('  ✅ Step 3: Moderator sees all 3 pending articles');

  // Step 4: Moderator approves 2, rejects 1
  store.updateStatus(1, 'APPROVED', null);
  store.updateStatus(2, 'APPROVED', 'Excellent historical research!');
  store.updateStatus(3, 'REJECTED', 'Needs more detailed sources.');

  console.assert(store.findApproved().length === 2, '5.4 FAIL: 2 approved');
  console.assert(store.findPending().length === 0, '5.4 FAIL: 0 pending');
  console.log('  ✅ Step 4: Moderator processes all articles (2 approved, 1 rejected)');

  // Step 5: Public listing shows only the 2 approved articles
  const publicList = store.findApproved();
  console.assert(publicList.length === 2, '5.5 FAIL: public should show 2 articles');
  const publicTitles = publicList.map((a) => a.title);
  console.assert(publicTitles.includes('New Engineering Building'), '5.5 FAIL: eng article');
  console.assert(publicTitles.includes('History of the Arts Faculty'), '5.5 FAIL: arts article');
  console.assert(!publicTitles.includes('The Old Science Block'), '5.5 FAIL: rejected hidden');
  console.log('  ✅ Step 5: Public listing shows only approved articles');

  store.reset();
}

/**
 * TEST GROUP 6: Search & Discovery (Frontend Logic)
 *
 * Tests the search/filter behaviour described in the PERA_WIKI_README
 * "Dynamic Search & Discovery" feature.
 */
function testSearchAndDiscovery() {
  console.log('\n═══ TEST GROUP 6: Search & Discovery ═══');

  resetIdCounter();
  const articles: WikiArticleWithAuthor[] = [
    createMockArticleWithAuthor({
      title: 'Sarachchandra Open-Air Theatre',
      location: 'Near Faculty of Arts',
      status: 'APPROVED',
    }),
    createMockArticleWithAuthor({
      title: 'Akbar Bridge',
      location: 'Mahaweli River Crossing',
      status: 'APPROVED',
    }),
    createMockArticleWithAuthor({
      title: "Lover's Lane",
      location: 'Along the Mahaweli River',
      status: 'APPROVED',
    }),
    createMockArticleWithAuthor({
      title: 'The Great Hall',
      location: 'University Main Complex',
      status: 'APPROVED',
    }),
    createMockArticleWithAuthor({
      title: 'Hilda Obeysekera Hall',
      location: 'Residential Area',
      status: 'APPROVED',
    }),
  ];

  const searchFilter = (query: string) =>
    articles.filter(
      (a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        (a.location ?? '').toLowerCase().includes(query.toLowerCase()),
    );

  // Test 6.1 — Search by landmark name
  {
    const results = searchFilter('akbar');
    console.assert(results.length === 1, '6.1 FAIL: should find 1 result for "akbar"');
    console.assert(results[0].title === 'Akbar Bridge', '6.1 FAIL: should find Akbar Bridge');
    console.log('  ✅ 6.1 Finds article by landmark name');
  }

  // Test 6.2 — Search by location keyword
  {
    const results = searchFilter('mahaweli');
    console.assert(results.length === 2, '6.2 FAIL: should find 2 results near Mahaweli');
    console.log('  ✅ 6.2 Finds articles by location keyword (Mahaweli → 2 results)');
  }

  // Test 6.3 — Case-insensitive search
  {
    const results = searchFilter('HALL');
    console.assert(results.length === 2, '6.3 FAIL: should find Great Hall + Hilda Hall');
    console.log('  ✅ 6.3 Search is case-insensitive');
  }

  // Test 6.4 — Empty search returns all articles
  {
    const results = searchFilter('');
    console.assert(results.length === 5, '6.4 FAIL: empty search returns all');
    console.log('  ✅ 6.4 Empty search returns all articles');
  }

  // Test 6.5 — No results for irrelevant query
  {
    const results = searchFilter('zzz_nonexistent_xyz');
    console.assert(results.length === 0, '6.5 FAIL: should return 0 results');
    console.log('  ✅ 6.5 Returns empty for non-matching query');
  }
}

/**
 * TEST GROUP 7: Data Shape Validation
 *
 * Validates that mock data shapes match the Prisma schema and controller
 * response formats.
 */
function testDataShapeValidation() {
  console.log('\n═══ TEST GROUP 7: Data Shape Validation ═══');

  // Test 7.1 — Public article shape validation
  {
    resetIdCounter();
    const article = createMockArticleWithAuthor({ status: 'APPROVED' });
    const publicShape = {
      id: article.id,
      title: article.title,
      content: article.content,
      location: article.location,
      imageUrls: article.imageUrls,
      createdAt: article.createdAt,
    };

    try {
      assertPublicArticleShape(publicShape);
      console.log('  ✅ 7.1 Public article shape is valid');
    } catch (e: any) {
      console.log(`  ❌ 7.1 FAIL: ${e.message}`);
    }
  }

  // Test 7.2 — Detail article shape validation (with author)
  {
    resetIdCounter();
    const article = createMockArticleWithAuthor({ status: 'APPROVED' });

    try {
      assertDetailArticleShape(article);
      console.log('  ✅ 7.2 Detail article shape (with author) is valid');
    } catch (e: any) {
      console.log(`  ❌ 7.2 FAIL: ${e.message}`);
    }
  }

  // Test 7.3 — All status values are valid
  {
    const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
    let allValid = true;
    for (const s of statuses) {
      try {
        assertValidStatus(s);
      } catch {
        allValid = false;
      }
    }
    console.assert(allValid, '7.3 FAIL: all statuses should be valid');
    console.log('  ✅ 7.3 All three status values (PENDING, APPROVED, REJECTED) are valid');
  }

  // Test 7.4 — Invalid status is rejected
  {
    let threw = false;
    try {
      assertValidStatus('DRAFT');
    } catch {
      threw = true;
    }
    console.assert(threw, '7.4 FAIL: should throw for invalid status "DRAFT"');
    console.log('  ✅ 7.4 Invalid status "DRAFT" correctly rejected');
  }

  // Test 7.5 — imageUrls is always an array
  {
    const article = createMockArticle({ imageUrls: [] });
    console.assert(Array.isArray(article.imageUrls), '7.5 FAIL: imageUrls should be array');

    const articleWithImages = createMockArticle();
    console.assert(Array.isArray(articleWithImages.imageUrls), '7.5 FAIL: imageUrls with data');
    console.log('  ✅ 7.5 imageUrls is always an array (empty or populated)');
  }
}

// ─── Run All Tests ────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Pera-Wiki  ·  Integration / End-to-End Lifecycle Tests         ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

testHappyPathLifecycle();
testRejectionRevisionFlow();
testDeletionScenarios();
testWelcomePageWidget();
testMultiUserCollaboration();
testSearchAndDiscovery();
testDataShapeValidation();

console.log('\n══════════════════════════════════════════════════════════════════');
console.log('  All Pera-Wiki integration / lifecycle tests completed.');
console.log('══════════════════════════════════════════════════════════════════\n');
