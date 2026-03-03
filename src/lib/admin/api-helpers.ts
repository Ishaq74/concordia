/**
 * Shared helpers for admin API routes.
 * Centralises guardAdmin, json response builder, generateId and slugify
 * to avoid duplication across /api/admin/blog/*.ts endpoints.
 */
import { isAdminUser } from "./permissions";

/** Build a typed JSON Response. */
export function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Gate-check: returns a 403 Response if the current user is not an admin,
 * or `null` if the user IS an admin (caller should continue).
 */
export function guardAdmin(locals: App.Locals): Response | null {
  if (!isAdminUser(locals.user)) {
    return json(403, { error: "forbidden" });
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
