import { OrganizationForm } from "@/components/organizations/organization-form";
import { createOrganizationAction } from "@/app/dashboard/organizations/actions";

export default function NewOrganizationPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-silver-100">Add Organization</h1>
      <div className="mt-6">
        <OrganizationForm action={createOrganizationAction} />
      </div>
    </div>
  );
}
