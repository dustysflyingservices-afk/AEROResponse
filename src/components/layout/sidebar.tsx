import Image from "next/image";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants/nav";

export function Sidebar(): JSX.Element {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-surface-border bg-surface-raised md:block">
      <div className="px-4 py-4">
        <div className="rounded-lg bg-[#ebf5ff] p-3">
          <Image
            src="/logo.png"
            alt="Props for a Purpose"
            width={160}
            height={128}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
      <nav className="px-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm font-medium text-silver-300 hover:bg-surface hover:text-silver-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
