import { SignOutButton } from "@/components/layout/sign-out-button";
import { MobileNav } from "@/components/layout/mobile-nav";

interface HeaderProps {
  userName: string;
  isAdmin: boolean;
}

export function Header({ userName, isAdmin }: HeaderProps): JSX.Element {
  return (
    <header className="relative flex items-center justify-between border-b border-surface-border bg-surface-raised px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav isAdmin={isAdmin} />
        <p className="text-sm text-silver-400">
          <span className="hidden sm:inline">Signed in as </span>
          <span className="font-medium text-silver-100">{userName}</span>
        </p>
      </div>
      <SignOutButton />
    </header>
  );
}
