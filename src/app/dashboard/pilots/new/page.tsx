import { PilotForm } from "@/components/pilots/pilot-form";
import { createPilotAction } from "@/app/dashboard/pilots/actions";

export default function NewPilotPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Add Pilot</h1>
      <div className="mt-6">
        <PilotForm action={createPilotAction} />
      </div>
    </div>
  );
}
