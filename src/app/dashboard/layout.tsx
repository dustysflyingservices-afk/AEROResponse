import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col">
        <Header userName={session.user.name ?? session.user.email ?? "Ops"} isAdmin={isAdmin} />
        <main className="flex-1 bg-surface p-6">{children}</main>
        <footer className="border-t border-surface-border px-6 py-3 text-center text-xs text-silver-500">
          Powered by AeroResponse
        </footer>
      </div>
    </div>
  );
}
