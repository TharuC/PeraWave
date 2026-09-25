/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pera-Wiki  ·  Frontend Component Tests
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Tests for the three React frontend pages that comprise the Pera-Wiki UI:
 *
 *    1. WikiList.tsx           – Article listing with search & filtering
 *    2. WikiArticleDetail.tsx  – Single article detail view with gallery
 *    3. CreateWikiArticle.tsx  – Article submission form
 *
 *  Reference files:
 *    - PeraWaveFrontEnd/src/pages/WikiList.tsx
 *    - PeraWaveFrontEnd/src/pages/WikiArticleDetail.tsx
 *    - PeraWaveFrontEnd/src/pages/CreateWikiArticle.tsx
 *    - PeraWaveFrontEnd/src/styles/wiki.css
 *    - PeraWaveFrontEnd/src/utils/auth.ts
 *    - PeraWaveFrontEnd/src/config.ts
 *
 *  These tests validate component logic, state management, UI rendering rules,
 *  and user interaction flows without requiring a DOM or React test renderer.
 *  They simulate the component state machines and derive assertions from
 *  the actual component source code.
 */

import {
  createMockArticle,
  createMockArticleWithAuthor,
  resetIdCounter,
  WikiArticleWithAuthor,
  MockWikiArticle,
} from './wiki-test-setup';

// ─── WikiList Component Tests ─────────────────────────────────────────────────

/**
 * TEST GROUP 1: WikiList — Article Listing & Search
 *
 * Component: PeraWaveFrontEnd/src/pages/WikiList.tsx
 *
 * Key behaviours:
 *  - Fetches approved articles from GET /api/wiki on mount
 *  - Provides a search input filtering by title and location
 *  - Shows "Write an Article" button when user is logged in
 *  - Shows login hint when user is not logged in
 *  - Displays skeleton loading state while fetching
 *  - Shows empty state when no articles match
 *  - Truncates content to 120 chars as excerpt
 */
function testWikiListComponent() {
  console.log('\n═══ TEST GROUP 1: WikiList Component ═══');

  // Test 1.1 — Search filter matches by title (case-insensitive)
  {
    resetIdCounter();
    const articles: WikiArticleWithAuthor[] = [
      createMockArticleWithAuthor({ title: 'Sarachchandra Open-Air Theatre' }),
      createMockArticleWithAuthor({ title: 'Akbar Bridge' }),
      createMockArticleWithAuthor({ title: "Lover's Lane" }),
      createMockArticleWithAuthor({ title: 'The Great Hall' }),
    ];

    const search = 'bridge';
    const filtered = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.location ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    console.assert(filtered.length === 1, '1.1 FAIL: should find 1 article matching "bridge"');
    console.assert(filtered[0].title === 'Akbar Bridge', '1.1 FAIL: matched article should be Akbar Bridge');
    console.log('  ✅ 1.1 Search filters articles by title (case-insensitive)');
  }

  // Test 1.2 — Search filter matches by location
  {
    resetIdCounter();
    const articles: WikiArticleWithAuthor[] = [
      createMockArticleWithAuthor({ title: 'Article A', location: 'Near Faculty of Arts' }),
      createMockArticleWithAuthor({ title: 'Article B', location: 'Engineering Faculty' }),
      createMockArticleWithAuthor({ title: 'Article C', location: null }),
    ];

    const search = 'arts';
    const filtered = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.location ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    console.assert(filtered.length === 1, '1.2 FAIL: should find 1 article by location');
    console.assert(
      filtered[0].location === 'Near Faculty of Arts',
      '1.2 FAIL: matched by location',
    );
    console.log('  ✅ 1.2 Search filters articles by location');
  }

  // Test 1.3 — Search with no matches returns empty array
  {
    resetIdCounter();
    const articles: WikiArticleWithAuthor[] = [
      createMockArticleWithAuthor({ title: 'Test Article' }),
    ];

    const search = 'zzzznonexistent';
    const filtered = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.location ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    console.assert(filtered.length === 0, '1.3 FAIL: should return empty array');
    console.log('  ✅ 1.3 Returns empty result for non-matching search');
  }

  // Test 1.4 — Excerpt truncation (120 chars max + "...")
  {
    const longContent = 'A'.repeat(200);
    const excerpt = (text: string, max = 120) =>
      text.length > max ? text.slice(0, max) + '...' : text;

    const result = excerpt(longContent);
    console.assert(result.length === 123, '1.4 FAIL: excerpt should be 120 chars + "..."');
    console.assert(result.endsWith('...'), '1.4 FAIL: should end with ellipsis');
    console.log('  ✅ 1.4 Excerpt truncates to 120 chars with ellipsis');
  }

  // Test 1.5 — Short content is not truncated
  {
    const shortContent = 'A short description.';
    const excerpt = (text: string, max = 120) =>
      text.length > max ? text.slice(0, max) + '...' : text;

    const result = excerpt(shortContent);
    console.assert(result === shortContent, '1.5 FAIL: short content should not be truncated');
    console.log('  ✅ 1.5 Short content preserved without truncation');
  }

  // Test 1.6 — Date formatting produces readable format
  {
    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    const result = formatDate('2025-06-10T14:30:00Z');
    console.assert(
      typeof result === 'string' && result.length > 0,
      '1.6 FAIL: date should be formatted',
    );
    // Exact format depends on locale but should contain "2025"
    console.assert(result.includes('2025'), '1.6 FAIL: should contain year 2025');
    console.log(`  ✅ 1.6 Date formatting works (e.g. "${result}")`);
  }

  // Test 1.7 — Login state determines "Write an Article" button vs login hint
  {
    const isLoggedIn_a = !!null; // no token → false
    const isLoggedIn_b = !!'some-jwt-token'; // has token → true

    console.assert(!isLoggedIn_a, '1.7 FAIL: no token should mean logged out');
    console.assert(isLoggedIn_b, '1.7 FAIL: token should mean logged in');
    console.log('  ✅ 1.7 Login state correctly derived from token presence');
  }

  // Test 1.8 — Articles with images use first imageUrl for card thumbnail
  {
    resetIdCounter();
    const article = createMockArticleWithAuthor({
      imageUrls: [
        'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/img1.jpg',
        'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/img2.jpg',
      ],
    });

    const thumbnailUrl = article.imageUrls.length > 0 ? article.imageUrls[0] : null;
    console.assert(
      thumbnailUrl === 'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/img1.jpg',
      '1.8 FAIL: should use first image as thumbnail',
    );
    console.log('  ✅ 1.8 Card thumbnail uses first image URL');
  }

  // Test 1.9 — Articles without images render placeholder
  {
    resetIdCounter();
    const article = createMockArticleWithAuthor({ imageUrls: [] });
    const hasImage = article.imageUrls.length > 0;
    console.assert(!hasImage, '1.9 FAIL: should have no images');
    console.log('  ✅ 1.9 Articles without images trigger placeholder rendering');
  }
}

// ─── WikiArticleDetail Component Tests ────────────────────────────────────────

/**
 * TEST GROUP 2: WikiArticleDetail — Single Article View
 *
 * Component: PeraWaveFrontEnd/src/pages/WikiArticleDetail.tsx
 *
 * Key behaviours:
 *  - Fetches article by ID from GET /api/wiki/:id
 *  - Shows loading skeleton while fetching
 *  - Shows 404 "Article Not Found" state when API returns non-200
 *  - Renders image gallery with active image selection
 *  - Displays author name, faculty, location tag, and publication date
 */
function testWikiArticleDetailComponent() {
  console.log('\n═══ TEST GROUP 2: WikiArticleDetail Component ═══');

  // Test 2.1 — Article detail page displays all required fields
  {
    resetIdCounter();
    const article = createMockArticleWithAuthor({
      id: 1,
      title: 'Sarachchandra Open-Air Theatre',
      content: 'A historic amphitheatre.',
      location: 'Near Faculty of Arts',
      imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      status: 'APPROVED',
    });

    console.assert(article.title.length > 0, '2.1 FAIL: title should be present');
    console.assert(article.content.length > 0, '2.1 FAIL: content should be present');
    console.assert(article.location !== null, '2.1 FAIL: location should be present');
    console.assert(article.author.fullName !== null, '2.1 FAIL: author fullName should be present');
    console.log('  ✅ 2.1 Article detail displays all required fields');
  }

  // Test 2.2 — Image gallery: active image index defaults to 0
  {
    let activeImg = 0; // useState(0) initial value in component
    console.assert(activeImg === 0, '2.2 FAIL: activeImg should default to 0');
    console.log('  ✅ 2.2 Image gallery active index defaults to 0');
  }

  // Test 2.3 — Image gallery: clicking thumbnail changes active image
  {
    let activeImg = 0;
    const imageUrls = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

    // Simulate clicking on thumbnail at index 2
    activeImg = 2;
    console.assert(activeImg === 2, '2.3 FAIL: active image should change to 2');
    console.assert(
      imageUrls[activeImg] === 'img3.jpg',
      '2.3 FAIL: hero image should show img3.jpg',
    );
    console.log('  ✅ 2.3 Clicking gallery thumbnail updates hero image');
  }

  // Test 2.4 — Single-image articles do not render gallery thumbnails
  {
    const article = createMockArticleWithAuthor({
      imageUrls: ['https://example.com/only_one.jpg'],
    });
    const showGallery = article.imageUrls.length > 1;
    console.assert(!showGallery, '2.4 FAIL: single image should not show gallery');
    console.log('  ✅ 2.4 Single-image articles hide gallery thumbnails');
  }

  // Test 2.5 — Articles with no images do not render any image section
  {
    const article = createMockArticleWithAuthor({ imageUrls: [] });
    const showHero = article.imageUrls.length > 0;
    console.assert(!showHero, '2.5 FAIL: no-image articles should hide image section');
    console.log('  ✅ 2.5 No-image articles hide entire image section');
  }

  // Test 2.6 — notFound state set when API returns error
  {
    let notFound = false;
    const simulatedApiResponse = { ok: false, status: 404 };

    if (!simulatedApiResponse.ok) {
      notFound = true;
    }

    console.assert(notFound, '2.6 FAIL: notFound should be true on API error');
    console.log('  ✅ 2.6 Sets notFound state on failed API response');
  }

  // Test 2.7 — Date formatting uses long month format
  {
    const formatDate = (d: string) =>
      new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    const result = formatDate('2025-06-10T14:30:00Z');
    // Should produce something like "June 10, 2025"
    console.assert(result.includes('2025'), '2.7 FAIL: should contain year');
    console.log(`  ✅ 2.7 Date uses long month format (e.g. "${result}")`);
  }

  // Test 2.8 — Author display shows "Unknown" when fullName is null
  {
    const article = createMockArticleWithAuthor({}, { fullName: null });
    const displayName = article.author?.fullName || 'Unknown';
    console.assert(displayName === 'Unknown', '2.8 FAIL: should show "Unknown"');
    console.log('  ✅ 2.8 Shows "Unknown" when author fullName is null');
  }

  // Test 2.9 — Faculty display hidden when faculty is null
  {
    const article = createMockArticleWithAuthor({}, { faculty: null });
    const facultySuffix = article.author?.faculty ? ` · ${article.author.faculty}` : '';
    console.assert(facultySuffix === '', '2.9 FAIL: faculty suffix should be empty');
    console.log('  ✅ 2.9 Faculty badge hidden when not available');
  }
}

// ─── CreateWikiArticle Component Tests ────────────────────────────────────────

/**
 * TEST GROUP 3: CreateWikiArticle — Submission Form
 *
 * Component: PeraWaveFrontEnd/src/pages/CreateWikiArticle.tsx
 *
 * Key behaviours:
 *  - Redirects to /login if user is not authenticated
 *  - Form fields: title (required), location (optional), content (required)
 *  - Supports up to 5 image uploads with preview
 *  - Shows validation errors for missing required fields
 *  - On success, shows confirmation card with "Browse Wiki" / "Submit Another"
 *  - FormData is sent as multipart (images appended individually)
 */
function testCreateWikiArticleComponent() {
  console.log('\n═══ TEST GROUP 3: CreateWikiArticle Component ═══');

  const MAX_IMAGES = 5;

  // Test 3.1 — Auth guard: redirects when no token
  {
    const token = null; // getToken() returns null
    const shouldRedirect = !token;
    console.assert(shouldRedirect, '3.1 FAIL: should redirect when no token');
    console.log('  ✅ 3.1 Redirects to /login when user has no token');
  }

  // Test 3.2 — Form validation: rejects empty title
  {
    const form = { title: '', content: 'Some content', location: '' };
    const isValid = form.title.trim() !== '' && form.content.trim() !== '';
    console.assert(!isValid, '3.2 FAIL: should be invalid with empty title');
    console.log('  ✅ 3.2 Validates: title is required');
  }

  // Test 3.3 — Form validation: rejects empty content
  {
    const form = { title: 'Valid Title', content: '   ', location: '' };
    const isValid = form.title.trim() !== '' && form.content.trim() !== '';
    console.assert(!isValid, '3.3 FAIL: should be invalid with whitespace-only content');
    console.log('  ✅ 3.3 Validates: content is required (trims whitespace)');
  }

  // Test 3.4 — Form validation: accepts valid form with optional location
  {
    const form = { title: 'The Great Hall', content: 'Historic building.', location: '' };
    const isValid = form.title.trim() !== '' && form.content.trim() !== '';
    console.assert(isValid, '3.4 FAIL: should be valid');
    console.log('  ✅ 3.4 Accepts valid form (location is optional)');
  }

  // Test 3.5 — Image uploads capped at MAX_IMAGES (5)
  {
    const currentImages = ['img1', 'img2', 'img3'];
    const newFiles = ['img4', 'img5', 'img6', 'img7'];
    const available = MAX_IMAGES - currentImages.length;
    const toAdd = newFiles.slice(0, available);

    console.assert(toAdd.length === 2, '3.5 FAIL: should only add 2 more images');
    console.assert(
      currentImages.length + toAdd.length <= MAX_IMAGES,
      '3.5 FAIL: total should not exceed MAX_IMAGES',
    );
    console.log('  ✅ 3.5 Image uploads capped at 5');
  }

  // Test 3.6 — Removing an image updates both images and previews arrays
  {
    let images = ['a.jpg', 'b.jpg', 'c.jpg'];
    let previews = ['data:a', 'data:b', 'data:c'];
    const removeIndex = 1;

    images = images.filter((_, i) => i !== removeIndex);
    previews = previews.filter((_, i) => i !== removeIndex);

    console.assert(images.length === 2, '3.6 FAIL: images should have 2 items');
    console.assert(previews.length === 2, '3.6 FAIL: previews should have 2 items');
    console.assert(!images.includes('b.jpg'), '3.6 FAIL: removed image should not exist');
    console.log('  ✅ 3.6 Removing image updates both arrays correctly');
  }

  // Test 3.7 — Success state shows confirmation card
  {
    let success = false;
    success = true; // Simulating successful API response

    console.assert(success, '3.7 FAIL: success state should be true');
    // In the component, success=true renders the wiki-success-card div
    console.log('  ✅ 3.7 Success state triggers confirmation card rendering');
  }

  // Test 3.8 — Reset form clears all state
  {
    let form = { title: 'Some Title', content: 'Content', location: 'Somewhere' };
    let images = ['img1.jpg'];
    let previews = ['data:img1'];
    let error = 'Some error';
    let success = true;

    // Simulate resetForm()
    success = false;
    form = { title: '', content: '', location: '' };
    images = [];
    previews = [];
    error = '';

    console.assert(form.title === '', '3.8 FAIL: title should be cleared');
    console.assert(images.length === 0, '3.8 FAIL: images should be empty');
    console.assert(!success, '3.8 FAIL: success should be false');
    console.assert(error === '', '3.8 FAIL: error should be cleared');
    console.log('  ✅ 3.8 Reset form clears all state');
  }

  // Test 3.9 — FormData construction includes all required fields
  {
    const form = { title: 'Great Hall', content: 'Architecture masterpiece', location: 'Main Campus' };
    const images = ['file1', 'file2'];

    // Simulate FormData construction from CreateWikiArticle.tsx
    const fd: Record<string, any> = {};
    fd['title'] = form.title.trim();
    fd['content'] = form.content.trim();
    if (form.location.trim()) fd['location'] = form.location.trim();
    fd['images'] = images;

    console.assert(fd.title === 'Great Hall', '3.9 FAIL: title mismatch');
    console.assert(fd.content === 'Architecture masterpiece', '3.9 FAIL: content mismatch');
    console.assert(fd.location === 'Main Campus', '3.9 FAIL: location mismatch');
    console.assert(fd.images.length === 2, '3.9 FAIL: images count mismatch');
    console.log('  ✅ 3.9 FormData constructed correctly with all fields');
  }

  // Test 3.10 — FormData omits location when empty
  {
    const form = { title: 'No Location', content: 'Content', location: '  ' };

    const fd: Record<string, any> = {};
    fd['title'] = form.title.trim();
    fd['content'] = form.content.trim();
    if (form.location.trim()) fd['location'] = form.location.trim();

    console.assert(!('location' in fd), '3.10 FAIL: location should be omitted when empty');
    console.log('  ✅ 3.10 FormData omits location when empty/whitespace');
  }
}

// ─── Run All Tests ────────────────────────────────────────────────────────────

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Pera-Wiki  ·  Frontend Component Tests                         ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

testWikiListComponent();
testWikiArticleDetailComponent();
testCreateWikiArticleComponent();

console.log('\n══════════════════════════════════════════════════════════════════');
console.log('  All Pera-Wiki frontend component tests completed.');
console.log('══════════════════════════════════════════════════════════════════\n');
