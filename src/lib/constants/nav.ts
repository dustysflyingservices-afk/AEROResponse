export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/missions", label: "Missions" },
  { href: "/dashboard/organizations", label: "Organizations" },
  { href: "/dashboard/pilots", label: "Pilots" },
  { href: "/dashboard/aircraft", label: "Aircraft" },
] as const;

const ADMIN_NAV_ITEMS = [{ href: "/dashboard/users", label: "Users" }] as const;

export function getNavItems(
  isAdmin: boolean
): ReadonlyArray<{ href: string; label: string }> {
  return isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;
}
