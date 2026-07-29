import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/validation/user";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validation/account";
import type { User } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsers(): Promise<SafeUser[]> {
  return prisma.user.findMany({
    select: SAFE_SELECT,
    orderBy: { name: "asc" },
  });
}

export async function getUser(id: string): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: SAFE_SELECT,
  });
}

async function countAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: "ADMIN" } });
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const data = createUserSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("A user with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    },
    select: SAFE_SELECT,
  });
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<SafeUser> {
  const data = updateUserSchema.parse(input);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "ADMIN" && data.role !== "ADMIN") {
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      throw new Error(
        "Can't remove admin access from the last remaining admin account."
      );
    }
  }

  const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : undefined;

  return prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: SAFE_SELECT,
  });
}

export async function deleteUser(id: string): Promise<void> {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return;
  }

  if (target.role === "ADMIN") {
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      throw new Error("Can't delete the last remaining admin account.");
    }
  }

  await prisma.user.delete({ where: { id } });
}

/**
 * Self-service password change for the currently logged-in user. Requires
 * the correct current password before allowing a change, so a hijacked or
 * left-open session can't be used to lock the real owner out.
 */
export async function changeOwnPassword(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const data = changePasswordSchema.parse(input);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found.");
  }

  const isCurrentPasswordCorrect = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash
  );
  if (!isCurrentPasswordCorrect) {
    throw new Error("Current password is incorrect.");
  }

  const passwordHash = await bcrypt.hash(data.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
