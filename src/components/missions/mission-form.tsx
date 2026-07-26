"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FormError,
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
} from "@/components/ui/form-fields";
import { isNextRedirectError } from "@/lib/utils/errors";
import {
  AIRCRAFT_CATEGORIES,
  AIRCRAFT_CATEGORY_LABELS,
} from "@/lib/constants/aircraft-category";
import {
  MISSION_PRIORITIES,
  MISSION_PRIORITY_LABELS,
  MISSION_STATUSES,
  MISSION_STATUS_LABELS,
} from "@/lib/constants/mission";
import type { Mission } from "@prisma/client";

interface MissionFormProps {
  mission?: Mission;
  organizationOptions: Array<{ id: string; name: string }>;
  action: (formData: FormData) => Promise<void>;
}

function toDateTimeLocalValue(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-500">
      {children}
    </h2>
  );
}

export function MissionForm({
  mission,
  organizationOptions,
  action,
}: MissionFormProps): JSX.Element {
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
          : "Something went wrong saving this mission."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <SectionHeading>Who</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="pointOfContact">Point of Contact</FormLabel>
            <FormInput
              id="pointOfContact"
              name="pointOfContact"
              defaultValue={mission?.pointOfContact ?? ""}
            />
          </div>
          <div>
            <FormLabel htmlFor="missionCoordinator">Mission Coordinator</FormLabel>
            <FormInput
              id="missionCoordinator"
              name="missionCoordinator"
              defaultValue={mission?.missionCoordinator ?? ""}
            />
          </div>
        </div>
        <div>
          <FormLabel htmlFor="organizationId">Requesting Agency</FormLabel>
          <FormSelect
            id="organizationId"
            name="organizationId"
            defaultValue={mission?.organizationId ?? ""}
          >
            <option value="">No organization on file</option>
            {organizationOptions.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </FormSelect>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>What</SectionHeading>
        <div>
          <FormLabel htmlFor="missionDescription">Mission</FormLabel>
          <FormTextarea
            id="missionDescription"
            name="missionDescription"
            required
            rows={2}
            defaultValue={mission?.missionDescription}
          />
        </div>
        <div>
          <FormLabel htmlFor="cargoPassengers">Cargo / Passengers</FormLabel>
          <FormTextarea
            id="cargoPassengers"
            name="cargoPassengers"
            rows={2}
            defaultValue={mission?.cargoPassengers ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="aircraftNeededNotes">Aircraft Needed (notes)</FormLabel>
          <FormTextarea
            id="aircraftNeededNotes"
            name="aircraftNeededNotes"
            rows={2}
            defaultValue={mission?.aircraftNeededNotes ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="specialRequirements">Special Requirements</FormLabel>
          <FormTextarea
            id="specialRequirements"
            name="specialRequirements"
            rows={2}
            defaultValue={mission?.specialRequirements ?? ""}
          />
        </div>

        <div className="rounded-md border border-surface-border bg-surface-raised p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
            Structured filters for aircraft matching (optional, used by the matching
            engine)
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <FormLabel htmlFor="requiredCategory">Aircraft Category</FormLabel>
              <FormSelect
                id="requiredCategory"
                name="requiredCategory"
                defaultValue={mission?.requiredCategory ?? ""}
              >
                <option value="">Any</option>
                {AIRCRAFT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {AIRCRAFT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div>
              <FormLabel htmlFor="minUsefulLoadLbs">Min Useful Load (lbs)</FormLabel>
              <FormInput
                id="minUsefulLoadLbs"
                name="minUsefulLoadLbs"
                type="number"
                min={0}
                defaultValue={mission?.minUsefulLoadLbs ?? ""}
              />
            </div>
            <div>
              <FormLabel htmlFor="minRangeNm">Min Range (nm)</FormLabel>
              <FormInput
                id="minRangeNm"
                name="minRangeNm"
                type="number"
                min={0}
                defaultValue={mission?.minRangeNm ?? ""}
              />
            </div>
            <div>
              <FormLabel htmlFor="minRunwayFt">Runway Available at Staging (ft)</FormLabel>
              <FormInput
                id="minRunwayFt"
                name="minRunwayFt"
                type="number"
                min={0}
                defaultValue={mission?.minRunwayFt ?? ""}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>When</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="launchWindow">Launch Window</FormLabel>
            <FormInput
              id="launchWindow"
              name="launchWindow"
              placeholder="e.g. Tomorrow, 0800-1000 local"
              defaultValue={mission?.launchWindow ?? ""}
            />
          </div>
          <div>
            <FormLabel htmlFor="responseNeededBy">Response Needed By</FormLabel>
            <FormInput
              id="responseNeededBy"
              name="responseNeededBy"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue(mission?.responseNeededBy ?? null)}
            />
          </div>
        </div>
        <div>
          <FormLabel htmlFor="estimatedDuration">Estimated Mission Duration</FormLabel>
          <FormInput
            id="estimatedDuration"
            name="estimatedDuration"
            placeholder="e.g. 4 hours round trip"
            defaultValue={mission?.estimatedDuration ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Where</SectionHeading>
        <div>
          <FormLabel htmlFor="stagingAirport">Staging Airport</FormLabel>
          <FormInput
            id="stagingAirport"
            name="stagingAirport"
            required
            placeholder="KAPA"
            defaultValue={mission?.stagingAirport}
          />
        </div>
        <div>
          <FormLabel htmlFor="destinationAirports">Destination Airport(s)</FormLabel>
          <FormTextarea
            id="destinationAirports"
            name="destinationAirports"
            rows={2}
            placeholder="Separate multiple airports with commas or new lines"
            defaultValue={mission?.destinationAirports.join(", ") ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Why</SectionHeading>
        <div>
          <FormLabel htmlFor="situationSummary">Situation Summary</FormLabel>
          <FormTextarea
            id="situationSummary"
            name="situationSummary"
            rows={3}
            defaultValue={mission?.situationSummary ?? ""}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="priority">Mission Priority</FormLabel>
            <FormSelect
              id="priority"
              name="priority"
              defaultValue={mission?.priority ?? "MEDIUM"}
            >
              {MISSION_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {MISSION_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel htmlFor="status">Status</FormLabel>
            <FormSelect id="status" name="status" defaultValue={mission?.status ?? "OPEN"}>
              {MISSION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {MISSION_STATUS_LABELS[status]}
                </option>
              ))}
            </FormSelect>
          </div>
        </div>
      </section>

      <FormError message={error ?? undefined} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Mission"}
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
