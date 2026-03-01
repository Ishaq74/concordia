import { getDrizzle } from "@database/drizzle";
import { user } from "@database/schemas";
import { eq } from "drizzle-orm";
import type { AppRole } from "./permissions";

/**
 * Resolve the application role for a given user from Better Auth's user table.
 * Returns at least ["citizen"] if the user has no explicit role.
 */
export async function getUserRoles(userId: string): Promise<AppRole[]> {
  const db = await getDrizzle();
  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));

  if (rows.length === 0 || !rows[0].role) {
    return ["citizen"];
  }

  return [rows[0].role as AppRole];
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
 * Assign a role to a user via Better Auth's user.role field.
 */
export async function assignRole(
  userId: string,
  role: AppRole,
  _grantedBy?: string,
): Promise<void> {
  const db = await getDrizzle();
  await db
    .update(user)
    .set({ role })
    .where(eq(user.id, userId));
}

/**
 * Remove a role from a user (reset to null).
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
  // Only clear the role if it matches the current one
  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));

  if (rows.length > 0 && rows[0].role === role) {
    await db
      .update(user)
      .set({ role: null })
      .where(eq(user.id, userId));
  }
}
