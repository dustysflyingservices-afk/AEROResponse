import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required"),
  contactName: z.string().trim().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
