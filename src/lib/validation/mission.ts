import { z } from "zod";
import { AIRCRAFT_CATEGORIES } from "@/lib/constants/aircraft-category";
import { MISSION_PRIORITIES, MISSION_STATUSES } from "@/lib/constants/mission";

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

const optionalDateTime = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? new Date(value) : undefined));

// Accepts destinations separated by commas or newlines and turns them into a
// clean string array, since the intake form allows multiple destinations.
const destinationList = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) =>
    (value ?? "")
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  );

export const missionSchema = z.object({
  // WHO
  pointOfContact: z.string().trim().optional().or(z.literal("")),
  missionCoordinator: z.string().trim().optional().or(z.literal("")),
  organizationId: z.string().trim().optional().or(z.literal("")),

  // WHAT
  missionDescription: z.string().trim().min(1, "Mission description is required"),
  cargoPassengers: z.string().trim().optional().or(z.literal("")),
  aircraftNeededNotes: z.string().trim().optional().or(z.literal("")),
  specialRequirements: z.string().trim().optional().or(z.literal("")),
  requiredCategory: z
    .enum([...AIRCRAFT_CATEGORIES, ""] as [string, ...string[]])
    .optional()
    .or(z.literal("")),
  minUsefulLoadLbs: optionalPositiveInt,
  minRangeNm: optionalPositiveInt,
  minRunwayFt: optionalPositiveInt,

  // WHEN
  launchWindow: z.string().trim().optional().or(z.literal("")),
  responseNeededBy: optionalDateTime,
  estimatedDuration: z.string().trim().optional().or(z.literal("")),

  // WHERE
  stagingAirport: z.string().trim().min(1, "Staging airport is required"),
  destinationAirports: destinationList,

  // WHY
  situationSummary: z.string().trim().optional().or(z.literal("")),
  priority: z.enum([...MISSION_PRIORITIES] as [string, ...string[]]).default("MEDIUM"),
  status: z.enum([...MISSION_STATUSES] as [string, ...string[]]).default("OPEN"),

  // Opt-in per mission - whether this mission's assigned aircraft show up
  // on the public live tracking map.
  trackingEnabled: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value === "true"),
});

export type MissionInput = z.infer<typeof missionSchema>;
export type MissionFormInput = z.input<typeof missionSchema>;
