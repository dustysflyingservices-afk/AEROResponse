import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClassName =
  "mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-silver-100 placeholder:text-silver-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function FormLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-silver-300">
      {children}
    </label>
  );
}

export function FormInput(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return <input {...props} className={fieldClassName} />;
}

export function FormSelect(props: SelectHTMLAttributes<HTMLSelectElement>): JSX.Element {
  return <select {...props} className={fieldClassName} />;
}

export function FormTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
): JSX.Element {
  return <textarea {...props} className={fieldClassName} />;
}

export function FormError({ message }: { message?: string }): JSX.Element | null {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-1 text-xs text-brand-400" role="alert">
      {message}
    </p>
  );
}
