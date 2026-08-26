-- Move from per-cohort paid enrollment to a single, global All-Access
-- package: one Payment per Student (no longer tied to a Cohort), and
-- Module.isPublished replaces per-cohort ModuleCohortPublication rows.

-- Dedupe existing Payment rows down to one per student (keeps the earliest)
-- so the new unique(studentId) index below can be created.
DELETE FROM "Payment" p
USING "Payment" p2
WHERE p."studentId" = p2."studentId"
  AND p."createdAt" > p2."createdAt";

-- DropForeignKey
ALTER TABLE "ModuleCohortPublication" DROP CONSTRAINT "ModuleCohortPublication_cohortId_fkey";

-- DropForeignKey
ALTER TABLE "ModuleCohortPublication" DROP CONSTRAINT "ModuleCohortPublication_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_cohortId_fkey";

-- DropIndex
DROP INDEX "Payment_studentId_cohortId_key";

-- AlterTable
ALTER TABLE "Cohort" DROP COLUMN "priceAmount";

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "cohortId";

-- DropTable
DROP TABLE "ModuleCohortPublication";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_studentId_key" ON "Payment"("studentId");
