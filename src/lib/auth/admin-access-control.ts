/**
 * Thin bridge between the Better Auth admin() plugin access‑control artefacts
 * and the rest of the Concordia admin panel code.
 *
 * The admin() plugin registers default `statements` and `roles` via
 * `better-auth/plugins/admin/access`.  This module keeps an in‑memory cache
 * so that the permission UI can read/reload them cheaply.
 */
import { defaultStatements, defaultRoles } from "better-auth/plugins/admin/access";

// ── Types ──────────────────────────────────────────────────────────────────

/** A statement matrix: resource key → list of allowed action strings. */
export type StatementShape = Record<string, readonly string[] | string[]>;

/** A single role definition as returned by better‑auth. */
export interface RoleArtifact {
  statements?: StatementShape;
  [key: string]: unknown;
}

export interface AdminAccessArtifacts {
  statements: StatementShape;
  roles: Record<string, RoleArtifact>;
}

// ── Cache ──────────────────────────────────────────────────────────────────

let _cache: AdminAccessArtifacts | null = null;

function buildFromDefaults(): AdminAccessArtifacts {
  return {
    statements: { ...(defaultStatements as unknown as StatementShape) },
    roles: Object.fromEntries(
      Object.entries(defaultRoles).map(([key, role]) => [
        key,
        { ...(role as RoleArtifact) },
      ]),
    ),
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Load (or return cached) admin access‑control statements and roles from
 * the Better Auth admin plugin.
 */
export async function loadAdminAccessArtifacts(): Promise<AdminAccessArtifacts> {
  if (_cache) return _cache;
  _cache = buildFromDefaults();
  return _cache;
}

/**
 * Return the current statement matrix.  Falls back to `defaultStatements`
 * if no dynamic artefacts have been loaded yet.
 */
export function getAdminStatements(): StatementShape {
  return _cache?.statements ?? (defaultStatements as unknown as StatementShape);
}

/**
 * Invalidate the in‑memory cache so the next call to
 * `loadAdminAccessArtifacts` re‑reads from the source of truth.
 *
 * Call this after persisting a role‑policy change so the UI reflects the
 * updated permission matrix.
 */
export async function reloadAdminAccessControl(): Promise<void> {
  _cache = null;
  // Re‑populate immediately so downstream consumers always see fresh data.
  await loadAdminAccessArtifacts();
}
