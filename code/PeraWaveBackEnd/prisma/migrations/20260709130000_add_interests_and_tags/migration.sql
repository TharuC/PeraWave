-- Add interests array to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add tags array to ForumPost table
ALTER TABLE "ForumPost" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
