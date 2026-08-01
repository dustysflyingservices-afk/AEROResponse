CREATE TABLE "mission_aircraft_assignments" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_aircraft_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mission_aircraft_assignments_missionId_aircraftId_key"
    ON "mission_aircraft_assignments"("missionId", "aircraftId");

ALTER TABLE "mission_aircraft_assignments"
    ADD CONSTRAINT "mission_aircraft_assignments_missionId_fkey"
    FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mission_aircraft_assignments"
    ADD CONSTRAINT "mission_aircraft_assignments_aircraftId_fkey"
    FOREIGN KEY ("aircraftId") REFERENCES "aircraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
