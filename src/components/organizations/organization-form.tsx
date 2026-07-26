"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormError, FormInput, FormLabel, FormTextarea } from "@/components/ui/form-fields";
import { isNextRedirectError } from "@/lib/utils/errors";
import type { Organization } from "@prisma/client";

interface OrganizationFormProps {
  organization?: Organization;
  action: (formData: FormData) => Promise<void>;
}

export function OrganizationForm({
  organization,
  action,
}: OrganizationFormProps): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await action(new FormData(event.currentTarget));
    } catch (submitError) {
      if (isNextRedirectError(submitError)) {
        throw submitError;
      }
      setIsSubmitting(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong saving this organization."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <FormLabel htmlFor="name">Organization Name</FormLabel>
        <FormInput
          id="name"
          name="name"
          required
          defaultValue={organization?.name}
        />
      </div>

      <div>
        <FormLabel htmlFor="contactName">Mission Coordinator / Contact Name</FormLabel>
        <FormInput
          id="contactName"
          name="contactName"
          defaultValue={organization?.contactName ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="contactPhone">Contact Phone</FormLabel>
          <FormInput
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={organization?.contactPhone ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="contactEmail">Contact Email</FormLabel>
          <FormInput
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={organization?.contactEmail ?? ""}
          />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="notes">Notes</FormLabel>
        <FormTextarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={organization?.notes ?? ""}
        />
      </div>

      <FormError message={error ?? undefined} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Organization"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-silver-300 hover:bg-surface-raised"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
