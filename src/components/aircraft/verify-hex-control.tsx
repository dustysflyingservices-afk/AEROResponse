"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface VerifyHexControlProps {
  aircraftId: string;
  currentHex: string | null;
  isVerified: boolean;
  action: (formData: FormData) => Promise<void>;
}

export function VerifyHexControl({
  aircraftId,
  currentHex,
  isVerified,
  action,
}: VerifyHexControlProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await action(new FormData(event.currentTarget));
      setIsEditing(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save hex.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isVerified && !isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-brand-700 bg-brand-900 px-2 py-0.5 text-xs font-medium text-brand-400">
          Tracking &middot; {currentHex}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs font-medium text-silver-500 hover:text-silver-300"
        >
          Change
        </button>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-xs font-medium text-brand-400 hover:text-brand-500"
      >
        + Add ICAO Hex
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1" data-aircraft={aircraftId}>
      <input
        name="icaoHex"
        placeholder="A1B2C3"
        maxLength={6}
        defaultValue={currentHex ?? ""}
        className="w-20 rounded border border-surface-border bg-surface px-2 py-1 text-xs uppercase text-silver-100 focus:border-brand-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {isSubmitting ? "..." : "Verify"}
      </button>
      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="text-xs text-silver-500 hover:text-silver-300"
      >
        Cancel
      </button>
      {error ? <span className="text-xs text-brand-400">{error}</span> : null}
    </form>
  );
}
