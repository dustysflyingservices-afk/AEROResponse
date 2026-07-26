import { notFound } from "next/navigation";
import { getMission } from "@/lib/services/missions";
import { listOrganizations } from "@/lib/services/organizations";
import { updateMissionAction } from "@/app/dashboard/missions/actions";
import { MissionForm } from "@/components/missions/mission-form";

export default async function EditMissionPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const [mission, organizations] = await Promise.all([
    getMission(params.id),
    listOrganizations(),
  ]);

  if (!mission) {
    notFound();
  }

  const action = updateMissionAction.bind(null, mission.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Edit Mission</h1>
      <div className="mt-6">
        <MissionForm mission={mission} organizationOptions={organizations} action={action} />
      </div>
    </div>
  );
}
