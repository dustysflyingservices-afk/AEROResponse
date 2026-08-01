import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActivelyAssignedAircraftIds } from "@/lib/services/mission-assignments";

// This serves live, constantly-changing aircraft positions - it must never
// be statically generated/cached at build time (which would also fail the
// build if migrations haven't run against the build-time database yet).
export const dynamic = "force-dynamic";

interface AirplanesLiveAircraft {
  hex: string;
  r?: string;
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  gs?: number;
  track?: number;
}

// Deliberately minimal - no pilot name, email, or phone. This is served to
// an unauthenticated public endpoint (embedded on the public website), so
// it only ever includes what's safe for anyone to see.
export interface PublicAircraftPosition {
  nNumber: string | null;
  makeModel: string;
  hex: string;
  lat: number;
  lon: number;
  altitudeFt: number | null;
  groundSpeedKt: number | null;
  headingDeg: number | null;
}

function normalizeReg(reg: string): string {
  return reg.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function fetchAirplanesLive(path: string): Promise<AirplanesLiveAircraft[]> {
  const response = await fetch(`https://api.airplanes.live/v2/${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`airplanes.live responded with ${response.status}`);
  }
  const data = (await response.json()) as { ac?: AirplanesLiveAircraft[] };
  return data.ac ?? [];
}

export async function GET(): Promise<NextResponse> {
  const activeAircraftIds = await getActivelyAssignedAircraftIds();

  if (activeAircraftIds.length === 0) {
    return NextResponse.json({ positions: [] satisfies PublicAircraftPosition[] });
  }

  const aircraft = await prisma.aircraft.findMany({
    where: { id: { in: activeAircraftIds } },
    select: { id: true, nNumber: true, makeModel: true, icaoHex: true },
  });

  const byRegistration = aircraft.filter((a) => a.nNumber);
  const byHexOnly = aircraft.filter((a) => !a.nNumber && a.icaoHex);

  let liveAircraft: AirplanesLiveAircraft[] = [];
  try {
    const results = await Promise.all([
      byRegistration.length > 0
        ? fetchAirplanesLive(
            `reg/${byRegistration.map((a) => normalizeReg(a.nNumber as string)).join(",")}`
          )
        : Promise.resolve([]),
      byHexOnly.length > 0
        ? fetchAirplanesLive(`hex/${byHexOnly.map((a) => a.icaoHex).join(",")}`)
        : Promise.resolve([]),
    ]);
    liveAircraft = [...results[0], ...results[1]];
  } catch (error) {
    console.error("Public tracking: failed to fetch from airplanes.live", error);
    return NextResponse.json({ error: "Could not reach tracking service" }, { status: 502 });
  }

  const byReg = new Map(
    liveAircraft.filter((a) => a.r).map((a) => [normalizeReg(a.r as string), a])
  );
  const byHex = new Map(liveAircraft.map((a) => [a.hex.toLowerCase(), a]));

  const positions: PublicAircraftPosition[] = aircraft
    .map((a) => {
      const live = a.nNumber
        ? byReg.get(normalizeReg(a.nNumber))
        : a.icaoHex
          ? byHex.get(a.icaoHex.toLowerCase())
          : undefined;

      if (!live || live.lat === undefined || live.lon === undefined) {
        return null;
      }

      return {
        nNumber: a.nNumber,
        makeModel: a.makeModel,
        hex: live.hex,
        lat: live.lat,
        lon: live.lon,
        altitudeFt: typeof live.alt_baro === "number" ? live.alt_baro : null,
        groundSpeedKt: live.gs ?? null,
        headingDeg: live.track ?? null,
      };
    })
    .filter((position): position is PublicAircraftPosition => position !== null);

  return NextResponse.json(
    { positions },
    {
      headers: {
        // Allow this to be fetched from the public embed page even if it
        // ever ends up on a different origin.
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
