import { z } from "zod";
import { AIRCRAFT_CATEGORIES } from "@/lib/constants/aircraft-category";

const optionalPositiveInt = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => {
    if (!value) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
  });

export const aircraftRowSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  nNumber: z.string().trim().optional().or(z.literal("")),
  makeModel: z.string().trim().optional().or(z.literal("")),
  homeBaseAirport: z.string().trim().optional().or(z.literal("")),
  category: z.enum([...AIRCRAFT_CATEGORIES] as [string, ...string[]]).default("OTHER"),
  usefulLoadLbs: optionalPositiveInt,
  rangeNm: optionalPositiveInt,
  minRunwayFt: optionalPositiveInt,
});

export type AircraftRowInput = z.infer<typeof aircraftRowSchema>;
export type AircraftRowFormInput = z.input<typeof aircraftRowSchema>;
