"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FormError,
  FormInput,
  FormLabel,
  FormSelect,
} from "@/components/ui/form-fields";
import { isNextRedirectError } from "@/lib/utils/errors";
import {
  AIRCRAFT_CATEGORIES,
  AIRCRAFT_CATEGORY_LABELS,
} from "@/lib/constants/aircraft-category";
import type { Aircraft } from "@prisma/client";

interface AircraftFormProps {
  aircraft?: Aircraft;
  pilotOptions: Array<{ id: string; name: string }>;
  action: (formData: FormData) => Promise<void>;
}

export function AircraftForm({
  aircraft,
  pilotOptions,
  action,
}: AircraftFormProps): JSX.Element {
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
          : "Something went wrong saving this aircraft."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="nNumber">N-Number</FormLabel>
          <FormInput
            id="nNumber"
            name="nNumber"
            required
            placeholder="N12345"
            defaultValue={aircraft?.nNumber}
          />
        </div>
        <div>
          <FormLabel htmlFor="makeModel">Make / Model</FormLabel>
          <FormInput
            id="makeModel"
            name="makeModel"
            required
            placeholder="Cessna 182"
            defaultValue={aircraft?.makeModel}
          />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="pilotId">Pilot (Owner)</FormLabel>
        <FormSelect id="pilotId" name="pilotId" required defaultValue={aircraft?.pilotId ?? ""}>
          <option value="" disabled>
            Select a pilot
          </option>
          {pilotOptions.map((pilot) => (
            <option key={pilot.id} value={pilot.id}>
              {pilot.name}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="homeBaseAirport">Home Base Airport</FormLabel>
          <FormInput
            id="homeBaseAirport"
            name="homeBaseAirport"
            placeholder="KAPA"
            defaultValue={aircraft?.homeBaseAirport ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="category">Category</FormLabel>
          <FormSelect
            id="category"
            name="category"
            defaultValue={aircraft?.category ?? "OTHER"}
          >
            {AIRCRAFT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {AIRCRAFT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FormLabel htmlFor="usefulLoadLbs">Useful Load (lbs)</FormLabel>
          <FormInput
            id="usefulLoadLbs"
            name="usefulLoadLbs"
            type="number"
            min={0}
            defaultValue={aircraft?.usefulLoadLbs ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="rangeNm">Range (nm)</FormLabel>
          <FormInput
            id="rangeNm"
            name="rangeNm"
            type="number"
            min={0}
            defaultValue={aircraft?.rangeNm ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="minRunwayFt">Min Runway (ft)</FormLabel>
          <FormInput
            id="minRunwayFt"
            name="minRunwayFt"
            type="number"
            min={0}
            defaultValue={aircraft?.minRunwayFt ?? ""}
          />
        </div>
      </div>

      <FormError message={error ?? undefined} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Aircraft"}
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
