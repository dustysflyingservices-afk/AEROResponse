import { prisma } from "@/lib/db/prisma";
import { pilotSchema, type PilotInput } from "@/lib/validation/pilot";
import type { Aircraft, Pilot } from "@prisma/client";

export type PilotWithAircraft = Pilot & { aircraft: Aircraft[] };

export async function listPilots(): Promise<PilotWithAircraft[]> {
  return prisma.pilot.findMany({
    orderBy: { name: "asc" },
    include: { aircraft: { orderBy: { nNumber: "asc" } } },
  });
}

export async function getPilot(id: string): Promise<PilotWithAircraft | null> {
  return prisma.pilot.findUnique({
    where: { id },
    include: { aircraft: { orderBy: { nNumber: "asc" } } },
  });
}

export async function listPilotOptions(): Promise<Array<{ id: string; name: string }>> {
  return prisma.pilot.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function createPilot(input: PilotInput): Promise<Pilot> {
  const data = pilotSchema.parse(input);
  return prisma.pilot.create({
    data: {
      name: data.name,
      email: toNullable(data.email)?.toLowerCase() ?? null,
      phone: toNullable(data.phone),
      qualifications: toNullable(data.qualifications),
      notes: toNullable(data.notes),
    },
  });
}

export async function updatePilot(id: string, input: PilotInput): Promise<Pilot> {
  const data = pilotSchema.parse(input);
  return prisma.pilot.update({
    where: { id },
    data: {
      name: data.name,
      email: toNullable(data.email)?.toLowerCase() ?? null,
      phone: toNullable(data.phone),
      qualifications: toNullable(data.qualifications),
      notes: toNullable(data.notes),
    },
  });
}

export async function deletePilot(id: string): Promise<void> {
  await prisma.pilot.delete({ where: { id } });
}
