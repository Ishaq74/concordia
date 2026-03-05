import { defineMiddleware, sequence } from "astro:middleware";
import { getAuth } from "@lib/auth/auth";
import {
  getCanonicalPath,
  getLocalizedUrl,
  getSupportedLocales,
} from "@lib/i18n/route-helpers";

// ==================== SECURITY HEADERS ====================

const securityHeaders = defineMiddleware(async (_context, next) => {
  const response = await next();

  // CSP — restrictif mais permet les polices auto-hébergées et les inline scripts Astro
  // Exception in dev/localhost so VS Code Simple Browser and other dev tools can embed pages
  const isLocalDev = (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') ||
    _context.url.hostname === 'localhost' ||
    _context.url.hostname === '127.0.0.1' ||
    _context.url.hostname === '::1';

  const frameAncestors = isLocalDev ? "frame-ancestors 'self'" : "frame-ancestors 'none'";

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self'",
      frameAncestors,
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  // Don't set X-Frame-Options to DENY for local dev to allow embedding in VS Code Simple Browser
  if (!isLocalDev) response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
});

// ==================== AUTH SESSION ====================

const authSession = defineMiddleware(async (context, next) => {
  // Initialisation par défaut — toujours définie même si pas authentifié
  context.locals.user = null;
  context.locals.session = null;

  // Ne pas résoudre la session pour les assets statiques
  const pathname = context.url.pathname;
  if (
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".woff")
  ) {
    return next();
  }

  try {
    const auth = await getAuth();
    const sessionResult = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (sessionResult) {
      context.locals.user = sessionResult.user;
      context.locals.session = sessionResult.session;
      // Extract active organization ID from session for org-scoping
      let orgId = (sessionResult.session as any)?.activeOrganizationId ?? null;

      // Auto-resolve: if no active org is set, try multiple fallbacks
      if (!orgId && sessionResult.user?.id) {
        try {
          const { getDrizzle } = await import("@database/drizzle");
          const { member } = await import("@database/schemas/auth-schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDrizzle();

          // Fallback 1: user's first membership in the auth member table
          const [firstMembership] = await db
            .select({ organizationId: member.organizationId })
            .from(member)
            .where(eq(member.userId, sessionResult.user.id))
            .limit(1);
          if (firstMembership) {
            orgId = firstMembership.organizationId;
          }

          // Fallback 2: for admin users, use first blogOrganizations entry
          // (covers case where auth org/member tables are empty but blogOrganizations has data)
          if (!orgId) {
            const userRole = (sessionResult.user as any)?.role ?? "";
            // Accept 'admin' as global admin for RBAC test
            const isAdmin = typeof userRole === "string" && (userRole.toLowerCase().includes("admin") || userRole === "admin");
            if (isAdmin) {
              const { blogOrganizations } = await import("@database/schemas");
              const [firstOrg] = await db
                .select({ id: blogOrganizations.id })
                .from(blogOrganizations)
                .limit(1);
              if (firstOrg) {
                orgId = firstOrg.id;
              }
            }
          }
        } catch {
          // Fallback silently — orgId stays null
        }
      }

      context.locals.organizationId = orgId;
    }
  } catch {
    // Échec silencieux — l'utilisateur reste null
    // Le auth catch-all gère ses propres erreurs
  }

  return next();
});

// ==================== CSRF PROTECTION ====================

const csrfProtection = defineMiddleware(async (context, next) => {
  const method = context.request.method;

  // GET, HEAD, OPTIONS ne modifient pas l'état — pas de CSRF check
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  // Les API auth de Better Auth gèrent leur propre CSRF
  if (context.url.pathname.startsWith("/api/auth/")) {
    return next();
  }

  // Toute requête mutative vers /api/ doit venir du même origin
  if (context.url.pathname.startsWith("/api/")) {
    const origin = context.request.headers.get("origin");
    const host = context.request.headers.get("host");

    if (!origin || !host) {
      return new Response(JSON.stringify({ error: "CSRF: missing origin or host" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return new Response(JSON.stringify({ error: "CSRF: origin mismatch" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "CSRF: invalid origin" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return next();
});

// ==================== LOCALE REDIRECT + SLUG REWRITE ====================

// Build a locale-prefix regex dynamically from the single source of truth
const localePrefixRegex = new RegExp(
  `^\\/(${getSupportedLocales().join("|")})(\\/.*)$`,
);

const localeRedirect = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Skip API routes and static assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/fonts/")
  ) {
    return next();
  }

  // Root "/" → /fr/
  if (pathname === "/") {
    return context.redirect("/fr/", 302);
  }

  // Match /{locale}/...
  const match = pathname.match(localePrefixRegex);
  if (!match) {
    // No valid locale prefix — let Astro handle (will 404 or match other routes)
    return next();
  }

  const lang = match[1]; // "fr", "en", etc.
  const restWithSlash = match[2]; // "/a-propos", "/auth/connexion", etc.
  const rest = restWithSlash.replace(/^\//, "").replace(/\/$/, ""); // strip leading/trailing /

  if (!rest) {
    // It's just /{lang}/ — no rewrite needed
    return next();
  }

  // Check if the localized slug needs rewriting to its canonical form
  const canonical = getCanonicalPath(lang, rest);
  if (canonical) {
    // Rewrite the URL so Astro routes to the canonical [lang]/... file
    // The visible URL stays the same (e.g. /fr/a-propos)
    const newUrl = new URL(context.url);
    const trailingSlash = pathname.endsWith("/") ? "/" : "";
    newUrl.pathname = `/${lang}/${canonical}${trailingSlash}`;
    return context.rewrite(new Request(newUrl, context.request));
  }

  return next();
});

// ==================== PROTECTED ROUTES ====================

const protectedRoutes = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Extract locale from first URL segment
  const localeMatch = pathname.match(localePrefixRegex);
  if (!localeMatch) return next(); // Not a locale-prefixed route

  const locale = localeMatch[1];
  const rest = localeMatch[2].replace(/^\//, "").replace(/\/$/, "");

  // Resolve to canonical path (handles localized slugs like "profil" → "profile")
  const canonical = getCanonicalPath(locale, rest) ?? rest;

  // Canonical protected route prefixes
  const protectedPrefixes = [
    "admin",
    "profile",
    "auth/profile",
  ];

  const isProtected = protectedPrefixes.some(
    (prefix) => canonical === prefix || canonical.startsWith(prefix + "/"),
  );

  if (isProtected && !context.locals.user) {
    const signInPath = getLocalizedUrl(locale, "auth/sign-in");
    const returnUrl = encodeURIComponent(pathname);
    return context.redirect(`${signInPath}?redirect=${returnUrl}`, 302);
  }

  return next();
});

// ==================== EXPORT ====================

// Ordre : sécurité headers → locale redirect → CSRF → session auth → protection routes
export const onRequest = sequence(
  securityHeaders,
  localeRedirect,
  csrfProtection,
  authSession,
  protectedRoutes,
);
