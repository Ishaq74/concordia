/**
 * Shared helpers for admin API routes.
 * Centralises guardAdmin, guardPermission, guardOrgOwnership,
 * json response builder, generateId and slugify
 * to avoid duplication across /api/admin/blog/*.ts and services/*.ts endpoints.
 */
import { isAdminUser } from "./permissions";
import {
  hasPermission,
  type AppPermission,
  type AppRole,
} from "@lib/auth/permissions";

/** Build a typed JSON Response. */
export function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Gate-check: returns a 401 if unauthenticated, 403 if not admin,
 * or `null` if the user IS an admin (caller should continue).
 */
export function guardAdmin(locals: App.Locals): Response | null {
  if (!locals.user) {
    return json(401, { error: "unauthorized" });
  }
  if (!isAdminUser(locals.user)) {
    return json(403, { error: "forbidden" });
  }
  return null;
}

/**
 * Extract the Concordia AppRole(s) from the user object.
 * Supports comma-separated strings and array fields.
 */
function extractAppRoles(user: unknown): AppRole[] {
  if (!user || typeof user !== "object") return [];
  const u = user as Record<string, unknown>;
  const raw = u.role ?? u.roles;
  if (!raw) return ["citizen"];
  const values = Array.isArray(raw) ? raw : String(raw).split(",").map((s) => s.trim());
  const validRoles = new Set<AppRole>([
    "citizen", "owner", "author", "mediator", "educator", "moderator", "admin",
  ]);
  const roles = values
    .map((v) => String(v).toLowerCase())
    .filter((v): v is AppRole => validRoles.has(v as AppRole));
  return roles.length > 0 ? roles : ["citizen"];
}

/**
 * Fine-grained RBAC guard.
 * Returns a 403 Response if the user lacks the required permission,
 * or `null` if the user has the permission (caller should continue).
 */
export function guardPermission(
  locals: App.Locals,
  permission: AppPermission,
): Response | null {
  const user = locals.user;
  if (!user) {
    return json(401, { error: "unauthorized" });
  }
  const roles = extractAppRoles(user);
  if (!hasPermission(roles, permission)) {
    return json(403, { error: "forbidden", requiredPermission: permission });
  }
  return null;
}

/**
 * Verify that the resource belongs to the user's active organization.
 * Returns a 403 Response if the resource's orgId doesn't match,
 * or `null` if it matches (caller should continue).
 * Admin users bypass this check.
 */
export function guardOrgOwnership(
  locals: App.Locals,
  resourceOrgId: string | null | undefined,
): Response | null {
  // Super-admins bypass org scoping
  if (isAdminUser(locals.user)) return null;
  // Resources without org scoping are accessible
  if (!resourceOrgId) return null;
  const activeOrgId = (locals as any).organizationId;
  if (!activeOrgId || activeOrgId !== resourceOrgId) {
    return json(403, { error: "forbidden", reason: "organization_mismatch" });
  }
  return null;
}

/** Generate a random UUID v4 (wraps crypto.randomUUID). */
export const generateId = (): string => crypto.randomUUID();

/**
 * Turn an arbitrary text into a URL-safe slug.
 * - lowercased
 * - NFD-normalised (removes diacritics)
 * - non-alphanum chars replaced by hyphens
 * - leading/trailing hyphens stripped
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
