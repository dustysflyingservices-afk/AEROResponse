import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/organizations", label: "Organizations" },
  { href: "/dashboard/pilots", label: "Pilots" },
  { href: "/dashboard/aircraft", label: "Aircraft" },
] as const;

export function Sidebar(): JSX.Element {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-surface-border bg-surface-raised md:block">
      <div className="flex items-center gap-2 px-4 py-4">
        <Image
          src="/logo.jpg"
          alt="AeroResponse"
          width={36}
          height={36}
          className="rounded"
        />
        <div>
          <p className="text-sm font-semibold text-silver-100">AeroResponse</p>
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
