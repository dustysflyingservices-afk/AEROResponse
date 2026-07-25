import { SignOutButton } from "@/components/layout/sign-out-button";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps): JSX.Element {
  return (
    <header className="flex items-center justify-between border-b border-surface-border bg-surface-raised px-6 py-3">
      <p className="text-sm text-silver-400">
        Signed in as <span className="font-medium text-silver-100">{userName}</span>
      </p>
      <SignOutButton />
    </header>
  );
}
