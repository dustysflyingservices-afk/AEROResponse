import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function getCurrentSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}
