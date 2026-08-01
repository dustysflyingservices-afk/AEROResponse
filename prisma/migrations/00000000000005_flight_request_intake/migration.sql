-- AlterEnum: add a status for raw public-submitted requests awaiting Ops review
ALTER TYPE "MissionStatus" ADD VALUE 'NEEDS_REVIEW';

-- AlterTable: staging airport isn't known until Ops reviews a public flight
-- request, so it can no longer be required at the database level.
ALTER TABLE "missions" ALTER COLUMN "stagingAirport" DROP NOT NULL;
