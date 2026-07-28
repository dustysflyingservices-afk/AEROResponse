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
import {
  AIRCRAFT_CATEGORIES,
  AIRCRAFT_CATEGORY_LABELS,
} from "@/lib/constants/aircraft-category";
import { isNextRedirectError } from "@/lib/utils/errors";
import type { Aircraft } from "@prisma/client";
import type { PilotWithAircraft } from "@/lib/services/pilots";

interface PilotFormProps {
  pilot?: PilotWithAircraft;
  action: (formData: FormData) => Promise<void>;
}

interface AircraftRowState {
  key: string;
  id?: string;
  nNumber: string;
  makeModel: string;
  homeBaseAirport: string;
  category: string;
  usefulLoadLbs: string;
  rangeNm: string;
  minRunwayFt: string;
}

function emptyRow(): AircraftRowState {
  return {
    key: `new-${Math.random().toString(36).slice(2)}`,
    nNumber: "",
    makeModel: "",
    homeBaseAirport: "",
    category: "OTHER",
    usefulLoadLbs: "",
    rangeNm: "",
    minRunwayFt: "",
  };
}

function rowFromAircraft(aircraft: Aircraft): AircraftRowState {
  return {
    key: aircraft.id,
    id: aircraft.id,
    nNumber: aircraft.nNumber ?? "",
    makeModel: aircraft.makeModel,
    homeBaseAirport: aircraft.homeBaseAirport ?? "",
    category: aircraft.category,
    usefulLoadLbs: aircraft.usefulLoadLbs?.toString() ?? "",
    rangeNm: aircraft.rangeNm?.toString() ?? "",
    minRunwayFt: aircraft.minRunwayFt?.toString() ?? "",
  };
}

function SectionHeading({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-500">
      {children}
    </h2>
  );
}

export function PilotForm({ pilot, action }: PilotFormProps): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aircraftRows, setAircraftRows] = useState<AircraftRowState[]>(() =>
    pilot && pilot.aircraft.length > 0 ? pilot.aircraft.map(rowFromAircraft) : [emptyRow()]
  );

  function updateRow(key: string, patch: Partial<AircraftRowState>): void {
    setAircraftRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  }

  function addRow(): void {
    setAircraftRows((rows) => [...rows, emptyRow()]);
  }

  function removeRow(key: string): void {
    setAircraftRows((rows) => (rows.length > 1 ? rows.filter((row) => row.key !== key) : rows));
  }

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
          : "Something went wrong saving this pilot."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <SectionHeading>Pilot Info</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <FormInput
              id="firstName"
              name="firstName"
              required
              defaultValue={pilot?.firstName}
            />
          </div>
          <div>
            <FormLabel htmlFor="lastName">Last Name</FormLabel>
            <FormInput id="lastName" name="lastName" required defaultValue={pilot?.lastName} />
          </div>
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
      </section>

      <section className="space-y-4">
        <SectionHeading>Address</SectionHeading>
        <div>
          <FormLabel htmlFor="street1">Street Address</FormLabel>
          <FormInput id="street1" name="street1" defaultValue={pilot?.street1 ?? ""} />
        </div>
        <div>
          <FormLabel htmlFor="street2">Street Address Line 2</FormLabel>
          <FormInput id="street2" name="street2" defaultValue={pilot?.street2 ?? ""} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FormLabel htmlFor="city">City</FormLabel>
            <FormInput id="city" name="city" defaultValue={pilot?.city ?? ""} />
          </div>
          <div>
            <FormLabel htmlFor="state">State</FormLabel>
            <FormInput id="state" name="state" defaultValue={pilot?.state ?? ""} />
          </div>
          <div>
            <FormLabel htmlFor="zipCode">Zip Code</FormLabel>
            <FormInput id="zipCode" name="zipCode" defaultValue={pilot?.zipCode ?? ""} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Experience</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="picTotalTime">PIC Total Time</FormLabel>
            <FormInput
              id="picTotalTime"
              name="picTotalTime"
              placeholder="e.g. 1,200 hours"
              defaultValue={pilot?.picTotalTime ?? ""}
            />
          </div>
          <div>
            <FormLabel htmlFor="airmenRatings">Airmen Ratings</FormLabel>
            <FormInput
              id="airmenRatings"
              name="airmenRatings"
              placeholder="e.g. CFI, Instrument, Multi-Engine"
              defaultValue={pilot?.airmenRatings ?? ""}
            />
          </div>
        </div>
        <div>
          <FormLabel htmlFor="motivation">
            What motivates you to volunteer with our organization?
          </FormLabel>
          <FormTextarea
            id="motivation"
            name="motivation"
            rows={3}
            defaultValue={pilot?.motivation ?? ""}
          />
        </div>
        <div>
          <FormLabel htmlFor="notes">Internal Notes</FormLabel>
          <FormTextarea id="notes" name="notes" rows={2} defaultValue={pilot?.notes ?? ""} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Aircraft</SectionHeading>
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium text-brand-400 hover:text-brand-500"
          >
            + Add Another Aircraft
          </button>
        </div>

        {aircraftRows.map((row, index) => (
          <div
            key={row.key}
            className="rounded-md border border-surface-border bg-surface-raised p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-silver-500">
                Aircraft {index + 1}
              </p>
              {aircraftRows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="text-xs font-medium text-brand-400 hover:text-brand-500"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <input type="hidden" name="aircraftId[]" value={row.id ?? ""} />

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormLabel htmlFor={`makeModel-${row.key}`}>Aircraft Type</FormLabel>
                <FormInput
                  id={`makeModel-${row.key}`}
                  name="makeModel[]"
                  placeholder="e.g. Cessna 182"
                  value={row.makeModel}
                  onChange={(event) => updateRow(row.key, { makeModel: event.target.value })}
                />
              </div>
              <div>
                <FormLabel htmlFor={`nNumber-${row.key}`}>N-Number (optional)</FormLabel>
                <FormInput
                  id={`nNumber-${row.key}`}
                  name="nNumber[]"
                  placeholder="N12345"
                  value={row.nNumber}
                  onChange={(event) => updateRow(row.key, { nNumber: event.target.value })}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormLabel htmlFor={`homeBaseAirport-${row.key}`}>Home Base Airport</FormLabel>
                <FormInput
                  id={`homeBaseAirport-${row.key}`}
                  name="homeBaseAirport[]"
                  placeholder="KAPA"
                  value={row.homeBaseAirport}
                  onChange={(event) =>
                    updateRow(row.key, { homeBaseAirport: event.target.value })
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor={`category-${row.key}`}>Category</FormLabel>
                <FormSelect
                  id={`category-${row.key}`}
                  name="category[]"
                  value={row.category}
                  onChange={(event) => updateRow(row.key, { category: event.target.value })}
                >
                  {AIRCRAFT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {AIRCRAFT_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>

            <p className="mt-3 text-xs text-silver-500">
              Optional - used by the mission matching engine
            </p>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <FormLabel htmlFor={`usefulLoadLbs-${row.key}`}>Useful Load (lbs)</FormLabel>
                <FormInput
                  id={`usefulLoadLbs-${row.key}`}
                  name="usefulLoadLbs[]"
                  type="number"
                  min={0}
                  value={row.usefulLoadLbs}
                  onChange={(event) =>
                    updateRow(row.key, { usefulLoadLbs: event.target.value })
                  }
                />
              </div>
              <div>
                <FormLabel htmlFor={`rangeNm-${row.key}`}>Range (nm)</FormLabel>
                <FormInput
                  id={`rangeNm-${row.key}`}
                  name="rangeNm[]"
                  type="number"
                  min={0}
                  value={row.rangeNm}
                  onChange={(event) => updateRow(row.key, { rangeNm: event.target.value })}
                />
              </div>
              <div>
                <FormLabel htmlFor={`minRunwayFt-${row.key}`}>Min Runway (ft)</FormLabel>
                <FormInput
                  id={`minRunwayFt-${row.key}`}
                  name="minRunwayFt[]"
                  type="number"
                  min={0}
                  value={row.minRunwayFt}
                  onChange={(event) =>
                    updateRow(row.key, { minRunwayFt: event.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </section>

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
