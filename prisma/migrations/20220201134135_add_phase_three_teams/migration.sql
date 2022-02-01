-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Team" ADD VALUE 'IntegratedLearningDisabilityService';
ALTER TYPE "Team" ADD VALUE 'BenefitsAndHousingNeeds';
ALTER TYPE "Team" ADD VALUE 'Safeguarding';
ALTER TYPE "Team" ADD VALUE 'IntegratedDischargeService';
ALTER TYPE "Team" ADD VALUE 'MentalHealthCareForOlderPeople';
