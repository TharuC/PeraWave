-- AlterTable: Add isFlagged column to ForumPost
ALTER TABLE "ForumPost" ADD COLUMN "isFlagged" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add isFlagged column to Comment
ALTER TABLE "Comment" ADD COLUMN "isFlagged" BOOLEAN NOT NULL DEFAULT false;
