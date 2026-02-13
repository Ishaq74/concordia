
import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles,
    }),
  ],
  baseURL: typeof window !== "undefined" ? undefined : (import.meta as any).env?.BETTER_AUTH_URL || (process as any).env?.BETTER_AUTH_URL,
});

// Méthodes utilitaires pour l'organisation
export const sendVerificationEmail = async ({ email, callbackURL }: { email: string; callbackURL?: string }) => {
  const res = await fetch("/api/auth-client/verification", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, callbackURL }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || "Failed to send verification email");
  }
  return await res.json().catch(() => ({}));
};

export const sendForgotPasswordEmail = async ({ email, callbackURL }: { email: string; callbackURL?: string }) => {
  const res = await fetch("/api/auth-client/forgot-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, callbackURL }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || "Failed to send reset email");
  }
  return await res.json().catch(() => ({}));
};

export default authClient;
