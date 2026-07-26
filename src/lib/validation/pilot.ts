import { z } from "zod";

export const pilotSchema = z.object({
  name: z.string().trim().min(1, "Pilot name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type PilotInput = z.infer<typeof pilotSchema>;
