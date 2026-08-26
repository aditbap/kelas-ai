-- CreateEnum
CREATE TYPE "LessonKind" AS ENUM ('Objectives', 'Summary', 'Practice', 'Supplementary');

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressRecord" DROP CONSTRAINT "ProgressRecord_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressRecord" DROP CONSTRAINT "ProgressRecord_userId_fkey";

-- This migration moves Lesson/Assignment from Module directly to a new
-- ModuleSession grouping underneath it. There is no way to backfill a
-- sessionId for existing rows (no session existed before this migration), so
-- the handful of placeholder/seed rows in these tables are cleared here; the
-- real Module 1 & 2 content is (re)created by prisma/seed.ts immediately
-- after. Submission and Grade cascade-delete from Assignment automatically
-- via their existing ON DELETE CASCADE foreign keys.
DELETE FROM "Assignment";
DELETE FROM "Lesson";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "moduleId",
ADD COLUMN     "isAdvancedMaterial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "moduleId",
ADD COLUMN     "kind" "LessonKind" NOT NULL DEFAULT 'Supplementary',
ADD COLUMN     "sessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "prerequisiteModuleId" TEXT;

-- DropTable
DROP TABLE "ProgressRecord";

-- CreateTable
CREATE TABLE "ModuleSession" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lessonsCompletedCount" INTEGER NOT NULL DEFAULT 0,
    "assignmentStatus" "AssignmentStatus" NOT NULL DEFAULT 'NotStarted',
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleSession_moduleId_order_key" ON "ModuleSession"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SessionProgress_userId_sessionId_key" ON "SessionProgress"("userId", "sessionId");

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_prerequisiteModuleId_fkey" FOREIGN KEY ("prerequisiteModuleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleSession" ADD CONSTRAINT "ModuleSession_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ModuleSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ModuleSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionProgress" ADD CONSTRAINT "SessionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionProgress" ADD CONSTRAINT "SessionProgress_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ModuleSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
