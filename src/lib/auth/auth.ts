import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDrizzle } from "@database/drizzle";
import { username } from "better-auth/plugins/username";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { ac, roles, checkPermission } from "./permissions";
import { validateUserInput } from "./validate-user";
import { smtp } from "@lib/smtp/smtp";
import { auditLog, profile, wallet, userRole } from "@database/schemas";
import { randomUUID } from "crypto";

// ==================== HELPERS ====================

function extractIP(ctx: any): string | null {
  return (
    ctx?.request?.headers?.get("x-real-ip") ||
    ctx?.request?.headers?.get("x-forwarded-for") ||
    ctx?.request?.headers?.get("cf-connecting-ip") ||
    null
  );
}

async function logAuthError(error: any, ctx: any, db: any) {
  if (error?.message?.toLowerCase().includes("invalid credentials")) {
    try {
      const ip = extractIP(ctx);
      const userAgent = ctx?.request?.headers?.get("user-agent");
      
      let email = "unknown";
      try {
        const body = await ctx?.request?.json?.();
        email = body?.email || "unknown";
      } catch {
        // Silent fail
      }

      await db.insert(auditLog).values({
        id: randomUUID(),
        action: "login_failed",
        userId: null,
        ip,
        userAgent,
        data: { email, error: error.message },
      });
    } catch (e) {
      console.error("Audit: login_failed failed", e);
    }
  }
}

// ==================== SHARED CONFIG ====================

const sharedConfig = {
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async signUpValidator({ email, password, username, name }: {
      email?: string;
      password?: string;
      username?: string;
      name?: string;
    }) {
      validateUserInput({ email, password, username, name });
    },
    async sendResetPassword({ user, url, token }: any) {
      if (process.env.SMTP_MOCK === '1' || process.env.NODE_ENV === 'test') {
        console.log('[MOCK SMTP] Password reset', { to: user.email, url, token });
        return;
      }
      await smtp.send({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${url}`,
      });
    },
  },

  emailVerification: {
    async sendVerificationEmail({ user, url, token }: any) {
      if (process.env.SMTP_MOCK === '1' || process.env.NODE_ENV === 'test') {
        console.log('[MOCK SMTP] Email verification', { to: user.email, url, token });
        return;
      }
      await smtp.send({
        to: user.email,
        subject: "Vérifiez votre adresse email",
        text: `Cliquez sur le lien suivant pour vérifier votre adresse email : ${url}`,
      });
    },
    sendOnSignUp: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      strategy: "compact" as const,
      maxAge: 60 * 5,
    },
    freshAge: 60 * 10,
    absoluteTimeout: 60 * 60 * 24 * 7,
  },

  rateLimit: {
    enabled: true,
    storage: "database" as const,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    windows: [
      {
        key: "global_ip",
        max: 100,
        window: 60 * 1000,
      },
      {
        key: "sign_in",
        max: 5,
        window: 15 * 60 * 1000,
      },
      {
        key: "sign_up",
        max: 10,
        window: 60 * 60 * 1000,
      },
    ],
  },

  telemetry: {
    enabled: false,
    debug: false,
  },
} as const;

// ==================== API INSTANCE (ASYNC) ====================

export async function getAuth() {
  const db = await getDrizzle();

  const instance = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    ...sharedConfig,

    plugins: [
      username(),
      organization({
        ac,
        roles,
        allowUserToCreateOrganization: async () => true,
        async sendInvitationEmail(data: any) {
          if (process.env.SMTP_MOCK === '1' || process.env.NODE_ENV === 'test') {
            console.log('[MOCK SMTP] Invite', { to: data.email, orgId: data.organization.id });
            return;
          }
          await smtp.send({
            to: data.email,
            subject: `Invitation à rejoindre ${data.organization.name}`,
            text: `Cliquez ici pour rejoindre : ${process.env.BETTER_AUTH_URL}/invite/${data.id}`,
          });
        },
      }),
      admin(),
    ],

    advanced: {
      useSecureCookies: true,
      disableOriginCheck: false,
      trustedOrigins: [process.env.BETTER_AUTH_URL!],
      cookiePrefix: "astro_",
      crossSubDomainCookies: { enabled: false },
      ipAddress: {
        ipAddressHeaders: ["x-real-ip", "x-forwarded-for", "cf-connecting-ip"],
        disableIpTracking: false,
      },
      onError: async (error: any, ctx: any) => {
        await logAuthError(error, ctx, db);
        console.error("Better Auth Error:", error.message);
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user: any) => {
            try {
              const derivedUsername = user.username || user.email.split("@")[0].replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 30);

              await Promise.all([
                db.insert(profile).values({
                  id: randomUUID(),
                  userId: user.id,
                  username: derivedUsername,
                  fullName: user.name || null,
                  preferredLanguage: "fr",
                }),
                db.insert(wallet).values({
                  id: randomUUID(),
                  userId: user.id,
                  balance: "0.00",
                  currency: "EUR",
                }),
                db.insert(userRole).values({
                  id: randomUUID(),
                  userId: user.id,
                  role: "citizen",
                  grantedBy: null,
                }),
                db.insert(auditLog).values({
                  id: randomUUID(),
                  action: "signup",
                  userId: user.id,
                  data: { email: user.email, username: derivedUsername },
                }),
              ]);
            } catch (e) {
              console.error("Post-signup hook failed", e);
            }
          },
        },
      },
      session: {
        create: {
          after: async (session: any, ctx: any) => {
            try {
              const ip = extractIP(ctx);
              const userAgent = ctx?.request?.headers?.get("user-agent");
              
              await db.insert(auditLog).values({
                id: randomUUID(),
                action: "login_success",
                userId: session.userId,
                ip,
                userAgent,
                data: { sessionId: session.id },
              });
            } catch (e) {
              console.error("Audit: login_success failed", e);
            }
          },
        },
      },
    },
  });

  (instance as any).organizationApi = {
    create: (payload: any) => (instance.api as any)["organization/create"](payload),
    setActive: (payload: any) => (instance.api as any)["organization/set-active"](payload),
    update: (payload: any) => (instance.api as any)["organization/update"](payload),
    delete: (payload: any) => (instance.api as any)["organization/delete"](payload),
    inviteMember: (payload: any) => (instance.api as any)["organization/invite-member"](payload),
    updateMemberRole: (payload: any) => (instance.api as any)["organization/update-member-role"](payload),
    removeMember: (payload: any) => (instance.api as any)["organization/remove-member"](payload),
    leave: (payload: any) => (instance.api as any)["organization/leave"](payload),
    list: (payload: any) => (instance.api as any)["organization/list"](payload),
    getFull: (payload: any) => (instance.api as any)["organization/get-full-organization"](payload),
    listMembers: (payload: any) => (instance.api as any)["organization/list-members"](payload),
    listUserInvitations: (payload: any) => (instance.api as any)["organization/list-user-invitations"](payload),
  };

  (instance as any).checkPermission = checkPermission;

  return instance;
}

// ==================== CLI INSTANCE (SYNC) ====================

import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "@database/schemas";
import { drizzleAdapter as drizzleAdapterSync } from "better-auth/adapters/drizzle";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  (process.env.USE_PROD_DB === "true"
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_LOCAL);

let auth: ReturnType<typeof betterAuth> | null = null;

if (DATABASE_URL) {
  const client = new Client({ connectionString: DATABASE_URL });
  const db = drizzle(client, { schema });

  auth = betterAuth({
    database: drizzleAdapterSync(db, { provider: "pg" }),
    ...sharedConfig,

    plugins: [
      username(),
      organization({
        ac,
        roles,
        allowUserToCreateOrganization: async () => true,
        async sendInvitationEmail(data: any) {
          if (process.env.SMTP_MOCK === '1' || process.env.NODE_ENV === 'test') {
            console.log('[MOCK SMTP] Invite', { to: data.email, orgId: data.organization.id });
            return;
          }
          await smtp.send({
            to: data.email,
            subject: `Invitation à rejoindre ${data.organization.name}`,
            text: `Cliquez ici pour rejoindre : ${process.env.BETTER_AUTH_URL}/invite/${data.id}`,
          });
        },
      }),
      admin(),
    ],

    advanced: {
      useSecureCookies: true,
      disableCSRFCheck: false,
      disableOriginCheck: false,
      trustedOrigins: [process.env.BETTER_AUTH_URL!],
      cookiePrefix: "astro_",
      crossSubDomainCookies: { enabled: false },
      ipAddress: {
        ipAddressHeaders: ["x-real-ip", "x-forwarded-for", "cf-connecting-ip"],
        disableIpTracking: false,
      },
      onError: (error: any, _ctx: any) => {
        console.error("Better Auth Error:", error.message);
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (user: any) => {
            try {
              const derivedUsername = user.username || user.email.split("@")[0].replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 30);

              await Promise.all([
                db.insert(profile).values({
                  id: randomUUID(),
                  userId: user.id,
                  username: derivedUsername,
                  fullName: user.name || null,
                  preferredLanguage: "fr",
                }),
                db.insert(wallet).values({
                  id: randomUUID(),
                  userId: user.id,
                  balance: "0.00",
                  currency: "EUR",
                }),
                db.insert(userRole).values({
                  id: randomUUID(),
                  userId: user.id,
                  role: "citizen",
                  grantedBy: null,
                }),
              ]);
            } catch (e) {
              console.error("CLI post-signup hook failed", e);
            }
          },
        },
      },
      session: {
        create: {
          after: async (_session: any) => {
            // CLI doesn't need audit logging
          },
        },
      },
    },
  });

  (auth as any).checkPermission = checkPermission;
}

export { auth };
export default auth;