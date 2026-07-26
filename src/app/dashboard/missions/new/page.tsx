import { MissionForm } from "@/components/missions/mission-form";
import { createMissionAction } from "@/app/dashboard/missions/actions";
import { listOrganizationOptions } from "@/lib/services/organizations";

export default async function NewMissionPage(): Promise<JSX.Element> {
  const organizations = await listOrganizationOptions();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">New Mission</h1>
      <div className="mt-6">
        <MissionForm organizationOptions={organizations} action={createMissionAction} />
      </div>
    </div>
  );
}
