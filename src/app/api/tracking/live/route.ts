import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { listTrackableAircraft } from "@/lib/services/aircraft";
import type { AircraftWithPilot } from "@/lib/services/aircraft";

interface AirplanesLiveAircraft {
  hex: string;
  r?: string; // registration, e.g. "N12345" - present when known
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  gs?: number;
  track?: number;
}

export interface LiveAircraftPosition {
  aircraftId: string;
  nNumber: string | null;
  makeModel: string;
  pilotName: string;
  hex: string;
  lat: number;
  lon: number;
  altitudeFt: number | null;
  groundSpeedKt: number | null;
  headingDeg: number | null;
  flight: string | null;
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
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trackable = await listTrackableAircraft();
  if (trackable.length === 0) {
    return NextResponse.json({ positions: [] satisfies LiveAircraftPosition[] });
  }

  // Primary path: track by N-Number/registration directly - airplanes.live
  // resolves this against their own aircraft database, so there's no
  // conversion step on our end that could silently point at the wrong hex.
  const byRegistration = trackable.filter(
    (aircraft): aircraft is AircraftWithPilot & { nNumber: string } =>
      Boolean(aircraft.nNumber)
  );
  // Fallback: aircraft with no N-Number on file but a manually-entered hex
  // (e.g. a foreign registration, or a case where registration lookup
  // wasn't finding the aircraft).
  const byHexOnly = trackable.filter(
    (aircraft) => !aircraft.nNumber && aircraft.icaoHex
  );

  let liveAircraft: AirplanesLiveAircraft[] = [];
  try {
    const results = await Promise.all([
      byRegistration.length > 0
        ? fetchAirplanesLive(
            `reg/${byRegistration.map((a) => normalizeReg(a.nNumber)).join(",")}`
          )
        : Promise.resolve([]),
      byHexOnly.length > 0
        ? fetchAirplanesLive(
            `hex/${byHexOnly.map((a) => a.icaoHex).join(",")}`
          )
        : Promise.resolve([]),
    ]);
    liveAircraft = [...results[0], ...results[1]];
  } catch (error) {
    console.error("Live tracking: failed to fetch from airplanes.live", error);
    return NextResponse.json({ error: "Could not reach tracking service" }, { status: 502 });
  }

  const byReg = new Map(
    liveAircraft.filter((a) => a.r).map((a) => [normalizeReg(a.r as string), a])
  );
  const byHex = new Map(liveAircraft.map((a) => [a.hex.toLowerCase(), a]));

  const positions: LiveAircraftPosition[] = trackable
    .map((aircraft) => {
      const live = aircraft.nNumber
        ? byReg.get(normalizeReg(aircraft.nNumber))
        : aircraft.icaoHex
          ? byHex.get(aircraft.icaoHex.toLowerCase())
          : undefined;

      if (!live || live.lat === undefined || live.lon === undefined) {
        return null;
      }

      return {
        aircraftId: aircraft.id,
        nNumber: aircraft.nNumber,
        makeModel: aircraft.makeModel,
        pilotName: `${aircraft.pilot.firstName} ${aircraft.pilot.lastName}`.trim(),
        hex: live.hex,
        lat: live.lat,
        lon: live.lon,
        altitudeFt: typeof live.alt_baro === "number" ? live.alt_baro : null,
        groundSpeedKt: live.gs ?? null,
        headingDeg: live.track ?? null,
        flight: live.flight?.trim() || null,
      };
    })
    .filter((position): position is LiveAircraftPosition => position !== null);

  return NextResponse.json({ positions });
}
