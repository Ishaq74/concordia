import { getDrizzle } from "@database/drizzle";
import { userRole } from "@database/schemas";
import { eq } from "drizzle-orm";
import type { AppRole } from "./permissions";

/**
 * Resolve all application roles for a given user from the user_role table.
 * Returns at least ["citizen"] if the user exists.
 */
export async function getUserRoles(userId: string): Promise<AppRole[]> {
  const db = await getDrizzle();
  const rows = await db
    .select({ role: userRole.role })
    .from(userRole)
    .where(eq(userRole.userId, userId));

  if (rows.length === 0) {
    return ["citizen"];
  }

  return rows.map((r) => r.role as AppRole);
}

/**
 * Check if a user has a specific role.
 */
export async function userHasRole(
  userId: string,
  role: AppRole,
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

/**
 * Assign a role to a user. No-op if already assigned.
 */
export async function assignRole(
  userId: string,
  role: AppRole,
  grantedBy?: string,
): Promise<void> {
  const db = await getDrizzle();
  await db
    .insert(userRole)
    .values({
      id: crypto.randomUUID(),
      userId,
      role,
      grantedBy: grantedBy ?? null,
    })
    .onConflictDoNothing();
}

/**
 * Remove a role from a user.
 * Cannot remove the "citizen" role.
 */
export async function removeRole(
  userId: string,
  role: AppRole,
): Promise<void> {
  if (role === "citizen") {
    throw new Error("Cannot remove the citizen role");
  }

  const db = await getDrizzle();
  const { and } = await import("drizzle-orm");
  await db
    .delete(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.role, role)));
}
