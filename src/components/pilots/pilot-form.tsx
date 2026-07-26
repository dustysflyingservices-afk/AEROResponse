"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormError, FormInput, FormLabel, FormTextarea } from "@/components/ui/form-fields";
import type { Pilot } from "@prisma/client";

interface PilotFormProps {
  pilot?: Pilot;
  action: (formData: FormData) => Promise<void>;
}

export function PilotForm({ pilot, action }: PilotFormProps): JSX.Element {
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
      setIsSubmitting(false);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong saving this pilot."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <FormLabel htmlFor="name">Pilot Name</FormLabel>
        <FormInput id="name" name="name" required defaultValue={pilot?.name} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            name="email"
            type="email"
            defaultValue={pilot?.email ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="phone">Phone Number</FormLabel>
          <FormInput
            id="phone"
            name="phone"
            type="tel"
            defaultValue={pilot?.phone ?? ""}
          />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="qualifications">Qualifications / Ratings</FormLabel>
        <FormInput
          id="qualifications"
          name="qualifications"
          placeholder="e.g. CFI, Instrument, Multi-Engine, Mountain Flying"
          defaultValue={pilot?.qualifications ?? ""}
        />
      </div>

      <div>
        <FormLabel htmlFor="notes">Notes</FormLabel>
        <FormTextarea id="notes" name="notes" rows={3} defaultValue={pilot?.notes ?? ""} />
      </div>

      <FormError message={error ?? undefined} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Pilot"}
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
