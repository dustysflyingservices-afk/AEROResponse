import { z } from "zod";
import { AIRCRAFT_CATEGORIES } from "@/lib/constants/aircraft-category";

const optionalPositiveInt = z
  .union([z.string().trim(), z.number()])
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    if (value === undefined || value === "") {
      return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
  });

export const aircraftSchema = z.object({
  nNumber: z
    .string()
    .trim()
    .min(1, "N-Number is required")
    .transform((value) => value.toUpperCase()),
  makeModel: z.string().trim().min(1, "Make/model is required"),
  homeBaseAirport: z.string().trim().optional().or(z.literal("")),
  category: z.enum([...AIRCRAFT_CATEGORIES] as [string, ...string[]]).default("OTHER"),
  usefulLoadLbs: optionalPositiveInt,
  rangeNm: optionalPositiveInt,
  minRunwayFt: optionalPositiveInt,
  pilotId: z.string().trim().min(1, "A pilot must be selected"),
});

export type AircraftInput = z.infer<typeof aircraftSchema>;
export type AircraftFormInput = z.input<typeof aircraftSchema>;
