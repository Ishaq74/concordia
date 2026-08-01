/**
 * Bidirectional slug mapping for the 13 page types with localized slugs.
 *
 * Keys are canonical (EN-based) paths — the physical filenames under `[lang]/`.
 * Values map each supported locale to the slug that appears in the public URL.
 *
 * The 53 remaining page types (admin, docs, blog/index, blog/[category], etc.)
 * have identical slugs across all languages and therefore need no entry here.
 */

export const SUPPORTED_LOCALES = ["fr", "en", "es", "ar"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * canonical path → { locale: localized slug }
 *
 * The canonical path does NOT contain the `[lang]/` prefix.
 * Segments containing `[slug]` or `[id]` are dynamic — only the static prefix
 * is handled; the dynamic portion passes through unchanged.
 */
export const slugMap: Record<string, Record<SupportedLocale, string>> = {
  // ─── Top-level ──────────────────────────────────────────
  about: {
    fr: "a-propos",
    en: "about",
    es: "acerca-de",
    ar: "about",
  },
  profile: {
    fr: "profil",
    en: "profile",
    es: "perfil",
    ar: "profile",
  },
  contact: {
    fr: "contact",
    en: "contact",
    es: "contacto",
    ar: "contact",
  },

  // ─── Organizations ─────────────────────────────────────
  organizations: {
    fr: "organisations",
    en: "organizations",
    es: "organizaciones",
    ar: "organizations",
  },

  // ─── Navigation sections (pages may not exist yet) ────
  trails: {
    fr: "sentiers",
    en: "trails",
    es: "senderos",
    ar: "trails",
  },
  events: {
    fr: "evenements",
    en: "events",
    es: "eventos",
    ar: "events",
  },
  groups: {
    fr: "groupes",
    en: "groups",
    es: "grupos",
    ar: "groups",
  },
  classifieds: {
    fr: "annonces",
    en: "classifieds",
    es: "anuncios",
    ar: "classifieds",
  },
  volunteer: {
    fr: "benevolat",
    en: "volunteer",
    es: "voluntariado",
    ar: "volunteer",
  },
  funding: {
    fr: "financement",
    en: "funding",
    es: "financiacion",
    ar: "funding",
  },
  transparency: {
    fr: "transparence",
    en: "transparency",
    es: "transparencia",
    ar: "transparency",
  },

  // ─── Auth ──────────────────────────────────────────────
  "auth/sign-in": {
    fr: "auth/connexion",
    en: "auth/sign-in",
    es: "auth/iniciar-sesion",
    ar: "auth/sign-in",
  },
  "auth/sign-up": {
    fr: "auth/inscription",
    en: "auth/sign-up",
    es: "auth/registro",
    ar: "auth/sign-up",
  },
  "auth/profile": {
    fr: "auth/profil",
    en: "auth/profile",
    es: "auth/perfil",
    ar: "auth/profile",
  },
  "auth/verify-email": {
    fr: "auth/verifier-email",
    en: "auth/verify-email",
    es: "auth/verificar-email",
    ar: "auth/verify-email",
  },
  "auth/reset-password": {
    fr: "auth/reinitialiser-mot-de-passe",
    en: "auth/reset-password",
    es: "auth/restablecer-contrasena",
    ar: "auth/reset-password",
  },
  "auth/forgot-password": {
    fr: "auth/mot-de-passe-oublie",
    en: "auth/forgot-password",
    es: "auth/olvido-contrasena",
    ar: "auth/forgot-password",
  },
  "auth/invitations": {
    fr: "auth/invitations",
    en: "auth/invitations",
    es: "auth/invitaciones",
    ar: "auth/invitations",
  },
  "auth/legal": {
    fr: "auth/mentions-legales",
    en: "auth/legal",
    es: "auth/legal",
    ar: "auth/legal",
  },

  // ─── Blog author (prerendered) ─────────────────────────
  "blog/author": {
    fr: "blog/auteur",
    en: "blog/author",
    es: "blog/autor",
    ar: "blog/author",
  },
};

// ─── Reverse index: for each locale, localized slug → canonical path ──
// Built once at import time.
export const reverseSlugMap: Record<SupportedLocale, Map<string, string>> = {
  fr: new Map(),
  en: new Map(),
  es: new Map(),
  ar: new Map(),
};

for (const [canonical, locales] of Object.entries(slugMap)) {
  for (const locale of SUPPORTED_LOCALES) {
    const localized = locales[locale];
    if (localized !== canonical) {
      reverseSlugMap[locale].set(localized, canonical);
    }
  }
}
