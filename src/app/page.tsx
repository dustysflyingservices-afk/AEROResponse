import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";

export default async function RootPage(): Promise<void> {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
