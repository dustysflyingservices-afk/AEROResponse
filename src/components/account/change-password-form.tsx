"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { FormError, FormInput, FormLabel } from "@/components/ui/form-fields";
import { isNextRedirectError } from "@/lib/utils/errors";

interface ChangePasswordFormProps {
  action: (formData: FormData) => Promise<void>;
}

export function ChangePasswordForm({ action }: ChangePasswordFormProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await action(new FormData(event.currentTarget));
      setSuccess(true);
      event.currentTarget.reset();
    } catch (submitError) {
      if (isNextRedirectError(submitError)) {
        throw submitError;
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong changing your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
        <FormInput
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
        />
      </div>

      <div>
        <FormLabel htmlFor="newPassword">New Password</FormLabel>
        <FormInput
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
        />
        <p className="mt-1 text-xs text-silver-500">At least 8 characters.</p>
      </div>

      <div>
        <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
        />
      </div>

      <FormError message={error ?? undefined} />

      {success ? (
        <p className="text-sm text-green-500" role="status">
          Password updated.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
