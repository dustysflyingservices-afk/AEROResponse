import { z } from "zod";

export const pilotSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),

  street1: z.string().trim().optional().or(z.literal("")),
  street2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  zipCode: z.string().trim().optional().or(z.literal("")),

  picTotalTime: z.string().trim().optional().or(z.literal("")),
  airmenRatings: z.string().trim().optional().or(z.literal("")),
  motivation: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type PilotInput = z.infer<typeof pilotSchema>;
