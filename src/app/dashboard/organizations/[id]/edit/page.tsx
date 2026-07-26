import { notFound } from "next/navigation";
import { getOrganization } from "@/lib/services/organizations";
import { updateOrganizationAction } from "@/app/dashboard/organizations/actions";
import { OrganizationForm } from "@/components/organizations/organization-form";

export default async function EditOrganizationPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const organization = await getOrganization(params.id);

  if (!organization) {
    notFound();
  }

  const action = updateOrganizationAction.bind(null, organization.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Edit Organization</h1>
      <div className="mt-6">
        <OrganizationForm organization={organization} action={action} />
      </div>
    </div>
  );
}
