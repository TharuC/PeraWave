# PeraWave Backend

## Overview

PeraWave is a university forum platform that allows students to create posts, comment, vote, and interact within controlled visibility scopes (university-wide, faculty-only, or batch-only). The backend provides RESTful APIs for user authentication, forum management, moderation, and reporting systems.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **CORS**: Enabled for cross-origin requests

## Installation

1. Navigate to the backend directory:
   ```bash
   cd Backend/PeraWaveBackEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Variables section below).

## Database Setup

1. Ensure PostgreSQL is running and accessible.

2. Configure the database connection in `prisma/schema.prisma` and environment variables.

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Running the Server

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication (`/api/auth`)
- `POST /send-otp` - Send OTP for user registration
- `POST /verify-otp` - Verify OTP and complete registration
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /send-reset-otp` - Send OTP for password reset
- `POST /reset-password` - Reset user password

### Moderator Authentication (`/api/auth`)
- `POST /mod/send-register-otp` - Send OTP for moderator registration
- `POST /mod/register` - Register a new moderator
- `POST /mod/login` - Moderator login
- `POST /mod/send-reset-otp` - Send OTP for moderator password reset
- `POST /mod/reset-password` - Reset moderator password

### Forum (`/api/forum`)
- `GET /posts` - Retrieve forum posts (filtered by visibility and user permissions)
- `POST /posts` - Create a new forum post
- `GET /posts/:id` - Get details of a specific post including comments
- `POST /posts/:id/comments` - Add a comment to a post
- `POST /posts/:id/vote` - Vote on a post (upvote/downvote)

### Moderation (`/api/mod`)
- `GET /dashboard` - Get moderation dashboard data
- `POST /actions` - Perform moderation actions (warn, suspend, delete users)
- `GET /reports` - Get pending reports
- `POST /reports/:id/resolve` - Resolve a report

### Reports (`/api/reports`)
- `POST /` - Submit a report for a post or comment

### Health Check
- `GET /api/health` - Check if the backend is running

## Authentication Mechanism

### User Registration
1. User provides email.
2. System sends OTP (One-Time Password) to email.
3. User verifies OTP.
4. User completes registration with password and profile details.

### Login
1. User provides email and password.
2. System validates credentials.
3. If valid, returns JWT token for subsequent requests.

### Password Reset
Similar to registration: OTP sent to email, verified, then new password set.

### JWT Authentication
- JWT tokens are required for protected routes.
- Tokens are included in the `Authorization` header as `Bearer <token>`.
- Tokens expire after 24 hours.

## Forum Operations

### Post Visibility
Posts can have three visibility levels:
- **UNIVERSITY_WIDE**: Visible to all users
- **FACULTY_ONLY**: Visible only to users in the same faculty
- **BATCH_ONLY**: Visible only to users in the same batch (derived from registration number)

### Anonymous Posting
Users can choose to post anonymously. Moderators can see the real identity of anonymous posters.

### Voting System
Users can upvote or downvote posts. Each user can vote only once per post.

### Comments
Users can comment on posts. Comments can also be anonymous and reported.

## Moderation System

Moderators can:
- View all posts and comments, including anonymous authors' real identities
- Perform actions on users: warnings, suspensions, account deletions
- Review and resolve reports
- Access moderation dashboard with statistics

## Reporting System

Users can report posts or comments for violations:
- Spam
- Harassment
- Misinformation
- Inappropriate content
- Duplicates
- Other

Reports are reviewed by moderators who can take appropriate actions.

## Environment Variables

Create a `.env` file in the backend root with:

```
DATABASE_URL="postgresql://username:password@localhost:5432/perawave_db"
JWT_SECRET="your_jwt_secret_key"
PORT=5000
```

## Database Models

### User
- Basic user information, faculty, registration number
- Suspension and deletion tracking

### Moderator
- Separate authentication for moderators

### ForumPost
- Title, content, visibility settings
- Anonymous flag, upvotes, flagged status

### Comment
- Linked to posts, can be anonymous

### PostVote
- Tracks user votes on posts

### Report
- User-submitted reports on content

### ModerationAction
- Records moderator actions on users

### Notification
- System notifications for users

## Development Notes

- OTPs are currently stored in memory (for development only). In production, use a proper storage solution like Redis with expiration.
- Passwords are hashed using bcrypt with 10 salt rounds.
- The system uses Prisma for type-safe database operations.
- CORS is enabled to allow frontend connections.</content>
<parameter name="filePath">e:\2YP Project\Backend\PeraWaveBackEnd\README.md