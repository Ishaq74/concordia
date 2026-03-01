import { getAuth } from "@lib/auth/auth";

type AdminRoleValue = string | string[];

/**
 * Type-safe wrapper for the Better Auth admin API.
 * The admin() plugin is loaded conditionally, so TypeScript cannot infer
 * these methods statically. We define the shape we rely on and cast once.
 */
interface AdminApi {
  listUsers(opts: { headers: Headers; query?: Record<string, string | number | undefined> }): Promise<unknown>;
  createUser(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  setRole(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  banUser(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  unbanUser(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  listSessions(opts: { headers: Headers; body?: Record<string, unknown> }): Promise<unknown>;
  revokeSessions(opts: { headers: Headers; body?: Record<string, unknown> }): Promise<unknown>;
  setPassword(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  removeUser(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  impersonateUser(opts: { headers: Headers; body: Record<string, unknown> }): Promise<unknown>;
  stopImpersonating(opts: { headers: Headers; body?: Record<string, unknown> }): Promise<unknown>;
}

async function getAdminApi(): Promise<AdminApi> {
  const auth = await getAuth();
  return auth.api as unknown as AdminApi;
}

const resolveBanExpiresIn = (expires?: Date | string | null): number | undefined => {
  if (!expires) return undefined;
  const target = typeof expires === "string" ? new Date(expires) : new Date(expires);
  if (Number.isNaN(target.getTime())) return undefined;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return undefined;
  return Math.ceil(diffMs / 1000);
};

export async function listUsers(headers: Headers, query: Record<string, string | number | undefined> = {}) {
  const api = await getAdminApi();
  return api.listUsers({
    headers,
    query,
  });
}

export async function createUser(
  headers: Headers,
  params: {
    email: string;
    password: string;
    name?: string | null;
    role?: AdminRoleValue;
  },
) {
  const api = await getAdminApi();
  return api.createUser({
    headers,
    body: {
      email: params.email,
      password: params.password,
      ...(params.name ? { name: params.name } : {}),
      ...(params.role
        ? {
            role: params.role as unknown as "user" | "admin" | ("user" | "admin")[],
          }
        : {}),
    },
  });
}

export async function setUserRole(
  headers: Headers,
  params: {
    userId: string;
    role: string;
  },
) {
  const api = await getAdminApi();
  return api.setRole({
    headers,
    body: {
      userId: params.userId,
      // Better Auth's generated types only expose "user" | "admin"; we forward custom roles anyway.
      role: params.role as unknown as "user" | "admin" | ("user" | "admin")[],
    },
  });
}

export async function banUser(
  headers: Headers,
  params: {
    userId: string;
    reason?: string;
    banExpires?: Date | string | null;
  },
) {
  const banExpiresIn = resolveBanExpiresIn(params.banExpires);
  const api = await getAdminApi();
  return api.banUser({
    headers,
    body: {
      userId: params.userId,
      banReason: params.reason ?? "Décision administrative",
      ...(typeof banExpiresIn === "number" ? { banExpiresIn } : {}),
    },
  });
}

export async function unbanUser(headers: Headers, params: { userId: string }) {
  const api = await getAdminApi();
  return api.unbanUser({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function listUserSessions(headers: Headers, params: { userId: string }) {
  const api = await getAdminApi();
  return api.listSessions({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function revokeUserSessions(headers: Headers, params: { userId: string }) {
  const api = await getAdminApi();
  return api.revokeSessions({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function setUserPassword(
  headers: Headers,
  params: {
    userId: string;
    password: string;
  },
) {
  const api = await getAdminApi();
  return api.setPassword({
    headers,
    body: {
      userId: params.userId,
      password: params.password,
    },
  });
}

export async function removeUser(headers: Headers, params: { userId: string }) {
  const api = await getAdminApi();
  return api.removeUser({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function impersonateUser(headers: Headers, params: { userId: string }) {
  const api = await getAdminApi();
  return api.impersonateUser({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function stopImpersonating(headers: Headers) {
  const api = await getAdminApi();
  return api.stopImpersonating({
    headers,
    body: {},
  });
}
