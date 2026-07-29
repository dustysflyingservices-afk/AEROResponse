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
import type { SafeUser } from "@/lib/services/users";

interface UserFormProps {
  user?: SafeUser;
  action: (formData: FormData) => Promise<void>;
}

export function UserForm({ user, action }: UserFormProps): JSX.Element {
  const router = useRouter();
  const isEditing = Boolean(user);
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
          : "Something went wrong saving this user."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormInput id="name" name="name" required defaultValue={user?.name} />
      </div>

      {isEditing ? (
        <div>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput id="email" value={user?.email} disabled />
          <p className="mt-1 text-xs text-silver-500">Email can&apos;t be changed.</p>
        </div>
      ) : (
        <div>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput id="email" name="email" type="email" required />
        </div>
      )}

      <div>
        <FormLabel htmlFor="password">
          {isEditing ? "New Password (leave blank to keep current)" : "Password"}
        </FormLabel>
        <FormInput
          id="password"
          name="password"
          type="password"
          required={!isEditing}
          minLength={8}
          placeholder={isEditing ? "••••••••" : undefined}
        />
        <p className="mt-1 text-xs text-silver-500">At least 8 characters.</p>
      </div>

      <div>
        <FormLabel htmlFor="role">Role</FormLabel>
        <FormSelect id="role" name="role" defaultValue={user?.role ?? "OPS"}>
          <option value="OPS">Ops</option>
          <option value="ADMIN">Admin</option>
        </FormSelect>
        <p className="mt-1 text-xs text-silver-500">
          Admins can manage users; Ops can use everything else.
        </p>
      </div>

      <FormError message={error ?? undefined} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save User"}
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
