-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN
    "resident" JSONB NOT NULL DEFAULT E'{}';
