/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  Pera-Wiki  ·  Test Setup & Shared Utilities
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *  Provides mock data factories, helper functions, and reusable test fixtures
 *  that mirror the real Prisma models and Express request/response shapes used
 *  across the PeraWave backend (wikiController, wikiRoutes, authMiddleware).
 *
 *  Usage:
 *    import { createMockArticle, createMockUser, ... } from './wiki-test-setup';
 */

// ─── Type Definitions (mirroring Prisma schema + controller responses) ────────

export interface MockUser {
  id: number;
  email: string;
  password: string;
  fullName: string | null;
  faculty: string | null;
  registrationNumber: string | null;
  suspendedUntil: Date | null;
  suspensionReason: string | null;
  isDeleted: boolean;
  deletionReason: string | null;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MockModerator {
  id: number;
  email: string;
  password: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type WikiArticleStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MockWikiArticle {
  id: number;
  title: string;
  content: string;
  location: string | null;
  imageUrls: string[];
  status: WikiArticleStatus;
  authorId: number;
  modNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape returned by getApprovedArticles / getArticleById (includes author) */
export interface WikiArticleWithAuthor extends MockWikiArticle {
  author: {
    fullName: string | null;
    faculty: string | null;
    id?: number;
    email?: string;
  };
}

/** Decoded JWT payload attached to `req.user` by authMiddleware */
export interface MockJwtPayload {
  userId: number;
  role: 'USER' | 'MODERATOR' | 'SUPER_ADMIN';
  email: string;
  iat?: number;
  exp?: number;
}

// ─── Mock Data Factories ──────────────────────────────────────────────────────

let _idCounter = 1;

/** Generates a unique integer ID for test entities. */
export function nextId(): number {
  return _idCounter++;
}

/** Resets the auto-increment counter (call in `beforeEach`). */
export function resetIdCounter(): void {
  _idCounter = 1;
}

/**
 * Creates a mock User entity with sensible defaults.
 * Override any field via `overrides`.
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = overrides.id ?? nextId();
  return {
    id,
    email: `user${id}@pdn.ac.lk`,
    password: '$2b$10$hashedpasswordplaceholder',
    fullName: `Test User ${id}`,
    faculty: 'Faculty of Engineering',
    registrationNumber: `E/23/${String(id).padStart(3, '0')}`,
    suspendedUntil: null,
    suspensionReason: null,
    isDeleted: false,
    deletionReason: null,
    interests: ['history', 'culture'],
    createdAt: new Date('2025-01-15T08:00:00Z'),
    updatedAt: new Date('2025-01-15T08:00:00Z'),
    ...overrides,
  };
}

/**
 * Creates a mock Moderator entity.
 */
export function createMockModerator(overrides: Partial<MockModerator> = {}): MockModerator {
  const id = overrides.id ?? nextId();
  return {
    id,
    email: `mod${id}@pdn.ac.lk`,
    password: '$2b$10$hashedmodpassword',
    fullName: `Moderator ${id}`,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Creates a mock WikiArticle with sensible Peradeniya-themed defaults.
 */
export function createMockArticle(
  overrides: Partial<MockWikiArticle> = {},
): MockWikiArticle {
  const id = overrides.id ?? nextId();
  return {
    id,
    title: `Sarachchandra Open-Air Theatre #${id}`,
    content:
      'The Sarachchandra Open-Air Theatre, affectionately known as "Wala" by students, ' +
      'is an iconic open-air amphitheatre nestled among the lush greenery of the ' +
      'University of Peradeniya campus. Named after the distinguished playwright ' +
      'Professor Ediriweera Sarachchandra, this venue has hosted generations of ' +
      'dramatic performances, cultural festivals, and university ceremonies.',
    location: 'Near the Faculty of Arts',
    imageUrls: [
      'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/theatre_1.jpg',
      'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/theatre_2.jpg',
    ],
    status: 'PENDING',
    authorId: 1,
    modNote: null,
    createdAt: new Date('2025-06-10T14:30:00Z'),
    updatedAt: new Date('2025-06-10T14:30:00Z'),
    ...overrides,
  };
}

/**
 * Creates a WikiArticleWithAuthor (the shape returned by controller endpoints
 * that `include` or `select` the `author` relation).
 */
export function createMockArticleWithAuthor(
  articleOverrides: Partial<MockWikiArticle> = {},
  authorOverrides: Partial<WikiArticleWithAuthor['author']> = {},
): WikiArticleWithAuthor {
  const article = createMockArticle(articleOverrides);
  return {
    ...article,
    author: {
      fullName: authorOverrides.fullName ?? 'Kamal Perera',
      faculty: authorOverrides.faculty ?? 'Faculty of Engineering',
      ...authorOverrides,
    },
  };
}

/**
 * Creates a decoded JWT-like payload that `authMiddleware` would attach
 * to `req.user`.
 */
export function createMockJwt(overrides: Partial<MockJwtPayload> = {}): MockJwtPayload {
  return {
    userId: 1,
    role: 'USER',
    email: 'user1@pdn.ac.lk',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

// ─── Seed Data Catalogue ──────────────────────────────────────────────────────
// Pre-built articles covering diverse Peradeniya landmarks for integration tests

export const SEED_ARTICLES: Omit<MockWikiArticle, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Sarachchandra Open-Air Theatre (Wala)',
    content:
      'The Sarachchandra Open-Air Theatre, commonly known as "Wala", is one of the most iconic landmarks of the University of Peradeniya. Named after Professor Ediriweera Sarachchandra, it has been the home of student drama and cultural productions since the 1960s.',
    location: 'Near Faculty of Arts',
    imageUrls: ['https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/wala.jpg'],
    status: 'APPROVED',
    authorId: 1,
    modNote: null,
  },
  {
    title: 'Akbar Bridge',
    content:
      'Akbar Bridge is a historic pedestrian bridge spanning the Mahaweli River at the edge of the university. It connects the campus to the town of Peradeniya and holds a special place in student folklore.',
    location: 'Mahaweli River Crossing',
    imageUrls: [],
    status: 'APPROVED',
    authorId: 2,
    modNote: null,
  },
  {
    title: "Lover's Lane",
    content:
      "Lover's Lane is a scenic, tree-lined walkway that stretches along the banks of the Mahaweli River. It is one of the most photographed spots on campus, especially during the evening golden hour.",
    location: 'Along the Mahaweli River',
    imageUrls: [
      'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/lovers_lane.jpg',
    ],
    status: 'APPROVED',
    authorId: 1,
    modNote: null,
  },
  {
    title: 'Hanthana Mountain Range',
    content:
      'The Hanthana Mountain Range provides a breathtaking backdrop to the university campus. Popular among students for weekend hikes, it offers stunning views of the Kandy valley and the campus below.',
    location: 'Southern boundary of campus',
    imageUrls: [],
    status: 'PENDING',
    authorId: 3,
    modNote: null,
  },
  {
    title: 'The Great Hall',
    content:
      'The Great Hall of the University of Peradeniya is a masterpiece of tropical modern architecture, designed by Shirley de Alwis. It serves as the primary ceremonial venue for convocations and official university functions.',
    location: 'University Main Complex',
    imageUrls: [
      'https://res.cloudinary.com/perawave/image/upload/v1/wiki-images/great_hall.jpg',
    ],
    status: 'REJECTED',
    authorId: 2,
    modNote: 'Content needs more historical references. Please revise and resubmit.',
  },
];

// ─── Express Mock Helpers ─────────────────────────────────────────────────────

/**
 * Creates a minimal mock Express Response object for controller unit tests.
 * Tracks `.status()`, `.json()`, and `.send()` calls for assertions.
 */
export function createMockResponse() {
  const res: any = {
    _status: 200,
    _json: null as any,
    _sent: false,

    status(code: number) {
      res._status = code;
      return res;
    },
    json(body: any) {
      res._json = body;
      res._sent = true;
      return res;
    },
    send(body?: any) {
      res._json = body;
      res._sent = true;
      return res;
    },
  };
  return res;
}

/**
 * Creates a minimal mock Express Request object.
 */
export function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    files: undefined as any,
    user: undefined as MockJwtPayload | undefined,
    ...overrides,
  };
}

// ─── Assertion Helpers ────────────────────────────────────────────────────────

/**
 * Validates that a wiki article object has the required public shape
 * (the fields returned by getApprovedArticles).
 */
export function assertPublicArticleShape(article: any): void {
  const requiredFields = ['id', 'title', 'content', 'location', 'imageUrls', 'createdAt'];
  for (const field of requiredFields) {
    if (!(field in article)) {
      throw new Error(`Missing required field "${field}" in public article shape.`);
    }
  }
  if (!Array.isArray(article.imageUrls)) {
    throw new Error('imageUrls must be an array.');
  }
}

/**
 * Validates that a wiki article object has the required detail shape
 * (the fields returned by getArticleById, which includes the author relation).
 */
export function assertDetailArticleShape(article: any): void {
  assertPublicArticleShape(article);
  if (!article.author || typeof article.author !== 'object') {
    throw new Error('Detail article must include an "author" object.');
  }
  if (!('fullName' in article.author)) {
    throw new Error('Author object must include "fullName".');
  }
}

/**
 * Validates that a given status string is one of the valid WikiArticle statuses.
 */
export function assertValidStatus(status: string): void {
  const valid: WikiArticleStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
  if (!valid.includes(status as WikiArticleStatus)) {
    throw new Error(`Invalid status "${status}". Must be one of: ${valid.join(', ')}`);
  }
}
