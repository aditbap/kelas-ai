-- One submission per (assignment, user): resubmitting overwrites the same row.
CREATE UNIQUE INDEX "Submission_assignmentId_userId_key" ON "Submission"("assignmentId", "userId");
