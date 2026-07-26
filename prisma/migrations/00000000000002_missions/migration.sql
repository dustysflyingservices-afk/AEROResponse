-- CreateEnum
CREATE TYPE "MissionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "pointOfContact" TEXT,
    "missionCoordinator" TEXT,
    "organizationId" TEXT,
    "missionDescription" TEXT NOT NULL,
    "cargoPassengers" TEXT,
    "aircraftNeededNotes" TEXT,
    "specialRequirements" TEXT,
    "requiredCategory" "AircraftCategory",
    "minUsefulLoadLbs" INTEGER,
    "minRangeNm" INTEGER,
    "minRunwayFt" INTEGER,
    "launchWindow" TEXT,
    "responseNeededBy" TIMESTAMP(3),
    "estimatedDuration" TEXT,
    "stagingAirport" TEXT NOT NULL,
    "destinationAirports" TEXT[],
    "situationSummary" TEXT,
    "priority" "MissionPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "MissionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE INDEX "missions_organizationId_idx" ON "missions"("organizationId");

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
