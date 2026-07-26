import Link from "next/link";
import { AircraftForm } from "@/components/aircraft/aircraft-form";
import { createAircraftAction } from "@/app/dashboard/aircraft/actions";
import { listPilotOptions } from "@/lib/services/pilots";

export default async function NewAircraftPage(): Promise<JSX.Element> {
  const pilotOptions = await listPilotOptions();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Add Aircraft</h1>
      <div className="mt-6">
        {pilotOptions.length === 0 ? (
          <p className="text-sm text-silver-400">
            You need at least one pilot before adding aircraft.{" "}
            <Link href="/dashboard/pilots/new" className="text-brand-400 hover:text-brand-500">
              Add a pilot first
            </Link>
            .
          </p>
        ) : (
          <AircraftForm pilotOptions={pilotOptions} action={createAircraftAction} />
        )}
      </div>
    </div>
  );
}
