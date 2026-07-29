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
        className="text-sm font-medium text-red-500 hover:text-red-400"
      >
        Delete
      </button>
    </form>
  );
}
