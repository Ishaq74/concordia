import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDrizzle } from "@database/drizzle";
import { username } from "better-auth/plugins/username";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins";
import { ac, roles, checkPermission } from "./permissions";
import { validateUserInput } from "./validate-user";
import { smtp } from "@lib/smtp/smtp";
import { auditLog } from "@database/schemas";
import { randomUUID } from "crypto";
import { eq, gte, and, sql } from "drizzle-orm";

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
  // always treat any authentication error as a login failure for audit logs
  try {
    const ip = extractIP(ctx);
    const userAgent = ctx?.request?.headers?.get("user-agent");
    let email = "unknown";
    try {
      const body = await ctx?.request?.json?.();
      email = body?.email || "unknown";
    } catch {
      // silent if body parsing fails
    }

    await db.insert(auditLog).values({
      id: randomUUID(),
      action: "login_failed",
      userId: null,
      targetId: email,
      ip,
      userAgent,
      data: { email, error: error.message },
    });
  } catch (e) {
    console.error("Audit: login_failed failed", e);
  }
}

// shared configuration used by both async and CLI instances
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
      try {
        await smtp.send({
          to: user.email,
          subject: "Password reset - Réinitialisation de votre mot de passe",
          text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${url}`,
          html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p><p><a href="${url}">${url}</a></p>`,
        });
      } catch (e) {
        console.error('SMTP error (reset password):', e);
      }
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url, token }: any) {
      try {
        await smtp.send({
          to: user.email,
          subject: "verify your email address - Vérifiez votre adresse email",
          text: `Cliquez sur le lien suivant pour vérifier votre adresse email : ${url}`,
          html: `<p>Cliquez sur le lien suivant pour vérifier votre adresse email :</p><p><a href="${url}">${url}</a></p>`,
        });
      } catch (e) {
        console.error('SMTP error (verification):', e);
      }
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

// global blacklist used to invalidate bearer tokens after sign-out. The
// set lives at module scope so it survives repeated calls to `getAuth()` in
// tests where a fresh instance is constructed each time.
const invalidatedTokens = new Set<string>();

// in-memory rate-limit map shared across all auth instances. Keys are
// lowercase email addresses. Values track count/windows for tests.
const emailFailureMap: Map<string, { count: number; first: number }> = new Map();

export async function getAuth() {
  const db = await getDrizzle();

  const instance = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    ...sharedConfig,

    plugins: [
      username(),
      ...(process.env.NODE_ENV === 'test'
        ? []
        : [
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
          ]),
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

              const postSignupTasks: Array<() => Promise<void>> = []
          try {
            if ((db as any).profile) {
              postSignupTasks.push(async () => {
                try {
                  await (db as any).profile.insert({
                    id: randomUUID(),
                    userId: user.id,
                    username: derivedUsername,
                    fullName: user.name || null,
                    preferredLanguage: "fr",
                  })
                } catch (err) {
                  console.error('post-signup: profile insert failed', err)
                }
              })
            }

            if ((db as any).wallet) {
              postSignupTasks.push(async () => {
                try {
                  await (db as any).wallet.insert({
                    id: randomUUID(),
                    userId: user.id,
                    balance: "0.00",
                    currency: "EUR",
                  })
                } catch (err) {
                  console.error('post-signup: wallet insert failed', err)
                }
              })
            }

            if ((db as any).userRole) {
              postSignupTasks.push(async () => {
                try {
                  await (db as any).userRole.insert({
                    id: randomUUID(),
                    userId: user.id,
                    role: "citizen",
                    grantedBy: null,
                  })
                } catch (err) {
                  console.error('post-signup: userRole insert failed', err)
                }
              })
            }

            // auditLog is required — always push
            postSignupTasks.push(async () => {
              try {
                await db.insert(auditLog).values({
                  id: randomUUID(),
                  action: "signup",
                  userId: user.id,
                  data: { email: user.email, username: derivedUsername },
                })
              } catch (err) {
                console.error('post-signup: auditLog insert failed', err)
              }
            })

            await Promise.all(postSignupTasks.map((fn) => fn()))
          } catch (e) {
            console.error('Post-signup hook failed', e)
          }
            } catch (e) {
              console.error("Post-signup hook failed", e);
            }
          },
        },
      },
      session: {
        create: {
          before: async (sessionObj: any) => {
            // ensure userId references actual user; pg-mem join bug may supply
            // account.id instead of user.id when the adapter joins tables.
            const { user } = await import('@database/schemas/auth-schema');
            const { account } = await import('@database/schemas/auth-schema');
            const existing = await db.select().from(user).where(eq(user.id, sessionObj.userId));
            if (existing.length === 0) {
              // attempt to resolve via account table
              const acc = await db.select().from(account).where(eq(account.id, sessionObj.userId));
              if (acc.length === 1) {
                sessionObj.userId = acc[0].userId;
              }
            }
            return sessionObj;
          },
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

  // helper object that exposes a simpler helper API on the auth instance.
  // the underlying Better Auth library does not use the same names that we
  // originally assumed when writing this wrapper. the server-side methods are
  // available directly on `instance.api` (e.g. `listOrganizations`) rather than
  // as strings like "organization/list". failing to map correctly produced the
  // runtime error the user reported in the browser logs.
  (instance as any).organizationApi = {
    create: (payload: any) => (instance.api as any).createOrganization(payload),
    setActive: (payload: any) => (instance.api as any).setActiveOrganization(payload),
    update: (payload: any) => (instance.api as any).updateOrganization(payload),
    delete: (payload: any) => (instance.api as any).deleteOrganization(payload),
    // the organization plugin exposes invitations via `createInvitation` on the
    // server; the client wrapper calls it `inviteMember` so we keep that name
    // here for consistency with the page logic.
    inviteMember: (payload: any) => (instance.api as any).createInvitation(payload),
    updateMemberRole: (payload: any) => (instance.api as any).updateMemberRole(payload),
    removeMember: (payload: any) => (instance.api as any).removeMember(payload),
    leave: (payload: any) => (instance.api as any).leaveOrganization(payload),
    list: (payload: any) => (instance.api as any).listOrganizations(payload),
    getFull: (payload: any) => (instance.api as any).getFullOrganization(payload),
    listMembers: (payload: any) => (instance.api as any).listMembers(payload),
    listUserInvitations: (payload: any) => (instance.api as any).listUserInvitations(payload),
  };

  (instance as any).checkPermission = checkPermission;

  // wrap signOut + getSession to support logout invalidation for bearer tokens
  const origSignOut = (instance.api as any).signOut;
  (instance.api as any).signOut = async (opts: any) => {
    const hdr = opts?.headers?.authorization;
    if (hdr && hdr.startsWith('Bearer ')) {
      invalidatedTokens.add(hdr.slice(7));
    }
    return await origSignOut(opts);
  };

  const origGetSession = (instance.api as any).getSession;
  (instance.api as any).getSession = async (opts: any) => {
    const hdr = opts?.headers?.authorization;
    if (hdr && hdr.startsWith('Bearer ')) {
      const tok = hdr.slice(7);
      if (invalidatedTokens.has(tok)) {
        const err: any = new Error('Session invalidated');
        err.status = 'UNAUTHORIZED';
        throw err;
      }
    }
    return await origGetSession(opts);
  };

  // Backwards-compat alias for tests and older callers
  (instance.api as any).forgotPassword = (payload: any) => (instance.api as any).requestPasswordReset(payload);
  // note: resetPassword endpoint already exists on Better Auth, no alias required
  // Ensure failed email sign-ins are audited — some Better‑Auth code paths
  // may throw without invoking the global onError handler when called
  // programmatically in tests. Wrap the endpoint to guarantee audit logging.
  const origSignInEmail = (instance.api as any).signInEmail;
  (instance.api as any).signInEmail = async (opts: any) => {
    const email: string | undefined = opts?.body?.email;

    // simple in-memory rate-limit; applies even for programmatic calls
    if (email) {
      const signinWindow = (sharedConfig as any).rateLimit.windows.find((w: any) => w.key === 'sign_in');
      const max = signinWindow?.max ?? 5;
      const windowMs = signinWindow?.window ?? 15 * 60 * 1000;
      const key = email.toLowerCase();
      const now = Date.now();
      let entry = emailFailureMap.get(key) || { count: 0, first: now };
      if (now - entry.first > windowMs) {
        entry = { count: 0, first: now };
      }
      if (entry.count >= max) {
        const err: any = new Error('Too many login attempts');
        err.status = 'TOO_MANY_REQUESTS';
        throw err;
      }
      emailFailureMap.set(key, entry);
    }

    // existing logic continues below

    try {
      const result = await origSignInEmail(opts);
      // login succeeded: reset failure counter for this email
      if (email) {
        emailFailureMap.delete(email.toLowerCase());
      }
      return result;
    } catch (err: any) {
      // Provide a minimal ctx so logAuthError can extract the email
      const ctx: { request: { json: () => Promise<any>; headers?: { get: (h: string) => string | null } } } = {
        request: {
          json: async () => opts?.body || {},
          headers: {
            get: (_: string) => null,
          },
        },
      };
      try {
        // update failure map on incorrect credentials
        if (email) {
          const key = email.toLowerCase();
          const entry = emailFailureMap.get(key) || { count: 0, first: Date.now() };
          entry.count += 1;
          emailFailureMap.set(key, entry);
        }

        await db.insert(auditLog).values({
          id: randomUUID(),
          action: 'login_failed',
          userId: null,
          ip: extractIP(ctx),
          userAgent: ctx.request.headers?.get ? ctx.request.headers.get('user-agent') : undefined,
          data: { email, error: err?.message },
        });
      } catch (e) {
        console.warn('Failed to write manual login_failed audit', e);
      }
      try {
        await logAuthError(err, ctx, db);
      } catch (e) {
        /* swallow audit errors */
      }
      throw err;
    }
  };

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
      ...(process.env.NODE_ENV === 'test'
        ? []
        : [
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
          ]),
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

            const postSignupTasks: Array<() => Promise<void>> = []
            try {
              if ((db as any).profile) {
                postSignupTasks.push(async () => {
                  try {
                    await (db as any).profile.insert({
                      id: randomUUID(),
                      userId: user.id,
                      username: derivedUsername,
                      fullName: user.name || null,
                      preferredLanguage: "fr",
                    })
                  } catch (err) {
                    console.error('CLI post-signup: profile insert failed', err)
                  }
                })
              }

              if ((db as any).wallet) {
                postSignupTasks.push(async () => {
                  try {
                    await (db as any).wallet.insert({
                      id: randomUUID(),
                      userId: user.id,
                      balance: "0.00",
                      currency: "EUR",
                    })
                  } catch (err) {
                    console.error('CLI post-signup: wallet insert failed', err)
                  }
                })
              }

              if ((db as any).userRole) {
                postSignupTasks.push(async () => {
                  try {
                    await (db as any).userRole.insert({
                      id: randomUUID(),
                      userId: user.id,
                      role: "citizen",
                      grantedBy: null,
                    })
                  } catch (err) {
                    console.error('CLI post-signup: userRole insert failed', err)
                  }
                })
              }

              await Promise.all(postSignupTasks.map((fn) => fn()))
            } catch (e) {
              console.error('CLI post-signup hook failed', e)
            }
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

  // Backwards-compat aliases for CLI sync instance
  if (auth && (auth as any).api) {
    (auth!.api as any).forgotPassword = (payload: any) => (auth!.api as any).requestPasswordReset(payload);
  }
}

export { auth };
export default auth;