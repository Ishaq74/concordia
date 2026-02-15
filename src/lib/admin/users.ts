import { auth } from "@lib/auth/auth";

type AdminRoleValue = string | string[];

const resolveBanExpiresIn = (expires?: Date | string | null): number | undefined => {
  if (!expires) return undefined;
  const target = typeof expires === "string" ? new Date(expires) : new Date(expires);
  if (Number.isNaN(target.getTime())) return undefined;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return undefined;
  return Math.ceil(diffMs / 1000);
};

export async function listUsers(headers: Headers, query: Record<string, string | number | undefined> = {}) {
  return auth.api.listUsers({
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
  return auth.api.createUser({
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
  return auth.api.setRole({
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
  return auth.api.banUser({
    headers,
    body: {
      userId: params.userId,
      banReason: params.reason ?? "Décision administrative",
      ...(typeof banExpiresIn === "number" ? { banExpiresIn } : {}),
    },
  });
}

export async function unbanUser(headers: Headers, params: { userId: string }) {
  return auth.api.unbanUser({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function listUserSessions(headers: Headers, params: { userId: string }) {
  return auth.api.listUserSessions({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function revokeUserSessions(headers: Headers, params: { userId: string }) {
  return auth.api.revokeUserSessions({
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
  return auth.api.setUserPassword({
    headers,
    body: {
      userId: params.userId,
      password: params.password,
    },
  });
}

export async function removeUser(headers: Headers, params: { userId: string }) {
  return auth.api.removeUser({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function impersonateUser(headers: Headers, params: { userId: string }) {
  return auth.api.impersonateUser({
    headers,
    body: {
      userId: params.userId,
    },
  });
}

export async function stopImpersonating(headers: Headers) {
  return auth.api.stopImpersonating({
    headers,
    body: {},
  });
}
