"use client";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
}

export function DeleteButton({ action, confirmMessage }: DeleteButtonProps): JSX.Element {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-brand-400 hover:text-brand-500"
      >
        Delete
      </button>
    </form>
  );
}
