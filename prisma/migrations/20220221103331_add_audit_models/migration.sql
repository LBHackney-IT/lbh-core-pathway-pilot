/*
  Warnings:

  - The required column `audit_id` was added to the `Comment_Audit` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `timestamp` on table `Comment_Audit` required. This step will fail if there are existing NULL values in that column.
  - The required column `audit_id` was added to the `NextStep_Audit` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `timestamp` on table `NextStep_Audit` required. This step will fail if there are existing NULL values in that column.
  - The required column `audit_id` was added to the `User_Audit` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `timestamp` on table `User_Audit` required. This step will fail if there are existing NULL values in that column.
  - The required column `audit_id` was added to the `Workflow_Audit` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `timestamp` on table `Workflow_Audit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comment_Audit"
    ADD COLUMN "audit_id" BIGSERIAL PRIMARY KEY,
    ALTER COLUMN "operation" SET DATA TYPE TEXT,
    ALTER COLUMN "timestamp" SET NOT NULL,
    ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NextStep_Audit"
    ADD COLUMN "audit_id" BIGSERIAL PRIMARY KEY,
    ALTER COLUMN "operation" SET DATA TYPE TEXT,
    ALTER COLUMN "timestamp" SET NOT NULL,
    ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User_Audit"
    ADD COLUMN "audit_id" BIGSERIAL PRIMARY KEY,
    ALTER COLUMN "operation" SET DATA TYPE TEXT,
    ALTER COLUMN "timestamp" SET NOT NULL,
    ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workflow_Audit"
    ADD COLUMN "audit_id" BIGSERIAL PRIMARY KEY,
    ALTER COLUMN "operation" SET DATA TYPE TEXT,
    ALTER COLUMN "timestamp" SET NOT NULL,
    ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3);
