-- CreateEnum
CREATE TYPE "AircraftCategory" AS ENUM ('SINGLE_ENGINE_PISTON', 'MULTI_ENGINE_PISTON', 'TURBOPROP', 'JET', 'HELICOPTER', 'OTHER');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pilots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aircraft" (
    "id" TEXT NOT NULL,
    "nNumber" TEXT NOT NULL,
    "makeModel" TEXT NOT NULL,
    "homeBaseAirport" TEXT,
    "category" "AircraftCategory" NOT NULL DEFAULT 'OTHER',
    "usefulLoadLbs" INTEGER,
    "rangeNm" INTEGER,
    "minRunwayFt" INTEGER,
    "pilotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pilots_email_key" ON "pilots"("email");

-- CreateIndex
CREATE UNIQUE INDEX "aircraft_nNumber_key" ON "aircraft"("nNumber");

-- CreateIndex
CREATE INDEX "aircraft_pilotId_idx" ON "aircraft"("pilotId");

-- AddForeignKey
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "pilots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
