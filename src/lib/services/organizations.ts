import { prisma } from "@/lib/db/prisma";
import { organizationSchema, type OrganizationInput } from "@/lib/validation/organization";
import type { Organization } from "@prisma/client";

export async function listOrganizations(): Promise<Organization[]> {
  return prisma.organization.findMany({ orderBy: { name: "asc" } });
}

export async function getOrganization(id: string): Promise<Organization | null> {
  return prisma.organization.findUnique({ where: { id } });
}

function toNullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export async function createOrganization(
  input: OrganizationInput
): Promise<Organization> {
  const data = organizationSchema.parse(input);
  return prisma.organization.create({
    data: {
      name: data.name,
      contactName: toNullable(data.contactName),
      contactPhone: toNullable(data.contactPhone),
      contactEmail: toNullable(data.contactEmail),
      notes: toNullable(data.notes),
    },
  });
}

export async function updateOrganization(
  id: string,
  input: OrganizationInput
): Promise<Organization> {
  const data = organizationSchema.parse(input);
  return prisma.organization.update({
    where: { id },
    data: {
      name: data.name,
      contactName: toNullable(data.contactName),
      contactPhone: toNullable(data.contactPhone),
      contactEmail: toNullable(data.contactEmail),
      notes: toNullable(data.notes),
    },
  });
}

export async function deleteOrganization(id: string): Promise<void> {
  await prisma.organization.delete({ where: { id } });
}
