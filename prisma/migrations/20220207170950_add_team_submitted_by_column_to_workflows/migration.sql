-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "teamSubmittedBy" "Team";

UPDATE "Workflow"
SET "teamSubmittedBy" = (SELECT U.team from "User" U WHERE U.email = "submittedBy")
WHERE type != 'Historic';