import { defineMiddleware, sequence } from "astro:middleware";
import { getAuth } from "@lib/auth/auth";

// ==================== SECURITY HEADERS ====================

const securityHeaders = defineMiddleware(async (_context, next) => {
  const response = await next();

  // CSP — restrictif mais permet les polices auto-hébergées et les inline scripts Astro
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  );

  response.headers.set("X-Frame-Options", "DENY");
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

// ==================== LOCALE REDIRECT ====================

const localeRedirect = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Pas de redirect pour les routes API, assets statiques, ou si déjà prefixé
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/fr/") ||
    pathname.startsWith("/en/") ||
    pathname.startsWith("/ar/") ||
    pathname.startsWith("/es/")
  ) {
    return next();
  }

  // Root "/" → /fr/ (le redirect est aussi dans astro.config mais ça sécurise le runtime)
  if (pathname === "/") {
    return context.redirect("/fr/", 302);
  }

  return next();
});

// ==================== PROTECTED ROUTES ====================

const protectedRoutes = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  // Routes qui nécessitent une session active
  const protectedPatterns = [
    /^\/(?:fr|en|ar|es)\/tableau-de-bord/,       // Dashboard FR
    /^\/(?:fr|en|ar|es)\/dashboard/,               // Dashboard EN
    /^\/(?:fr|en|ar|es)\/admin/,                   // Admin panel
    /^\/(?:fr|en|ar|es)\/profil/,                  // Profil FR
    /^\/(?:fr|en|ar|es)\/profile/,                 // Profile EN
    /^\/(?:fr|en|ar|es)\/messagerie/,              // Messagerie FR
    /^\/(?:fr|en|ar|es)\/messages/,                // Messages EN
  ];

  const isProtected = protectedPatterns.some((pattern) => pattern.test(pathname));

  if (isProtected && !context.locals.user) {
    // Extraire la locale du pathname
    const localeMatch = pathname.match(/^\/(fr|en|ar|es)\//);
    const locale = localeMatch?.[1] ?? "fr";

    // Slugs de connexion par locale
    const signInSlugs: Record<string, string> = {
      fr: "connexion",
      en: "sign-in",
      ar: "sign-in",
      es: "sign-in",
    };

    const signInPath = `/${locale}/auth/${signInSlugs[locale]}`;
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
