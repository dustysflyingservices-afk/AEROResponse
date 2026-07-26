import type { AircraftCategory } from "@prisma/client";

export const AIRCRAFT_CATEGORIES = [
  "SINGLE_ENGINE_PISTON",
  "MULTI_ENGINE_PISTON",
  "TURBOPROP",
  "JET",
  "HELICOPTER",
  "OTHER",
] as const;

export const AIRCRAFT_CATEGORY_LABELS: Record<AircraftCategory, string> = {
  SINGLE_ENGINE_PISTON: "Single-Engine Piston",
  MULTI_ENGINE_PISTON: "Multi-Engine Piston",
  TURBOPROP: "Turboprop",
  JET: "Jet",
  HELICOPTER: "Helicopter",
  OTHER: "Other",
};
