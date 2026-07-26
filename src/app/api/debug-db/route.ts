import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// TEMPORARY diagnostic route. Delete this file once login works.
// Visit /api/debug-db directly in the browser to see the real connection error.
export async function GET(): Promise<NextResponse> {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { email: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      status: "connected",
      userCount,
      users,
      databaseUrlPrefix: process.env.DATABASE_URL?.slice(0, 30) ?? "MISSING",
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      nextAuthUrl: process.env.NEXTAUTH_URL ?? "MISSING",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        databaseUrlPrefix: process.env.DATABASE_URL?.slice(0, 30) ?? "MISSING",
        hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
        nextAuthUrl: process.env.NEXTAUTH_URL ?? "MISSING",
      },
      { status: 500 }
    );
  }
}
