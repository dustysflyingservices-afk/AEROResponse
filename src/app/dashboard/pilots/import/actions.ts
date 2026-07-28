"use server";

import { revalidatePath } from "next/cache";
import { importPilotRoster, type ImportSummary, type RosterRow } from "@/lib/services/pilot-import";

export async function importPilotRosterAction(rows: RosterRow[]): Promise<ImportSummary> {
  const summary = await importPilotRoster(rows);
  revalidatePath("/dashboard/pilots");
  return summary;
}
