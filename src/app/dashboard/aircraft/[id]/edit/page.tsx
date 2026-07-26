import { notFound } from "next/navigation";
import { getAircraft } from "@/lib/services/aircraft";
import { listPilotOptions } from "@/lib/services/pilots";
import { updateAircraftAction } from "@/app/dashboard/aircraft/actions";
import { AircraftForm } from "@/components/aircraft/aircraft-form";

export default async function EditAircraftPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const [aircraft, pilotOptions] = await Promise.all([
    getAircraft(params.id),
    listPilotOptions(),
  ]);

  if (!aircraft) {
    notFound();
  }

  const action = updateAircraftAction.bind(null, aircraft.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Edit Aircraft</h1>
      <div className="mt-6">
        <AircraftForm aircraft={aircraft} pilotOptions={pilotOptions} action={action} />
      </div>
    </div>
  );
}
