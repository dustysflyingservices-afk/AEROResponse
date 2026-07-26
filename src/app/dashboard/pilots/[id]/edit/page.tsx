import { notFound } from "next/navigation";
import { getPilot } from "@/lib/services/pilots";
import { updatePilotAction } from "@/app/dashboard/pilots/actions";
import { PilotForm } from "@/components/pilots/pilot-form";

export default async function EditPilotPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const pilot = await getPilot(params.id);

  if (!pilot) {
    notFound();
  }

  const action = updatePilotAction.bind(null, pilot.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Edit Pilot</h1>
      <div className="mt-6">
        <PilotForm pilot={pilot} action={action} />
      </div>
    </div>
  );
}
