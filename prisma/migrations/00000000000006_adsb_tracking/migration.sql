ALTER TABLE "aircraft" ADD COLUMN "icaoHex" TEXT;
ALTER TABLE "aircraft" ADD COLUMN "hexVerified" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "aircraft_icaoHex_key" ON "aircraft"("icaoHex");
