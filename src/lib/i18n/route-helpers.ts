/**
 * Route helpers for the `[lang]/` dynamic routing system.
 *
 * These functions are the *single source of truth* for locale-aware URL
 * generation and resolution across pages, middleware, and components.
 */

import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  slugMap,
  reverseSlugMap,
} from "@i18n/slug-map";

// Re-export for convenience
export { SUPPORTED_LOCALES, type SupportedLocale };

/**
 * Type guard: is the value a supported locale code?
 */
export function isValidLocale(lang: string): lang is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(lang);
}

/**
 * Return the array of supported locale codes.
 */
export function getSupportedLocales(): readonly SupportedLocale[] {
  return SUPPORTED_LOCALES;
}

/**
 * Build a fully-prefixed, localized URL.
 *
 * @param lang   - Target locale (`fr`, `en`, `es`, `ar`)
 * @param canonicalPath - Canonical page path without leading `/` or `[lang]/`
 *                        Examples: `"about"`, `"auth/sign-in"`, `"blog/author/john"`
 * @returns The public URL, e.g. `/fr/a-propos`, `/es/auth/iniciar-sesion`
 *
 * For paths that include a dynamic tail (e.g. `organizations/my-org`), only the
 * static prefix is localised; the dynamic portion passes through unchanged.
 */
export function getLocalizedUrl(lang: string, canonicalPath: string): string {
  const locale = isValidLocale(lang) ? lang : "fr";
  const normalized = canonicalPath.replace(/^\/+|\/+$/g, "");

  if (normalized === "" || normalized === "/") {
    return `/${locale}/`;
  }

  // Try an exact match first (most cases)
  const exactEntry = slugMap[normalized];
  if (exactEntry) {
    return `/${locale}/${exactEntry[locale]}`;
  }

  // Try matching longest prefix (handles dynamic segments like organizations/[slug])
  // Sort by key length descending so we match the most specific prefix first
  const sortedKeys = Object.keys(slugMap).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (normalized.startsWith(key + "/")) {
      const tail = normalized.slice(key.length); // includes leading /
      return `/${locale}/${slugMap[key][locale]}${tail}`;
    }
  }

  // No mapping needed — slug is identical across locales
  return `/${locale}/${normalized}`;
}

/**
 * Resolve a localized URL slug back to its canonical (EN-based) path.
 *
 * Used by the middleware to rewrite incoming requests, e.g.:
 *   `getCanonicalPath("fr", "auth/connexion")` → `"auth/sign-in"`
 *
 * @param lang            - The locale extracted from the URL's first segment
 * @param localizedSlug   - The rest of the URL after `/{lang}/`, without leading `/`
 * @returns The canonical path (which maps to a physical file under `[lang]/`)
 *          or `null` if no rewrite is needed (slug is already canonical).
 */
export function getCanonicalPath(
  lang: string,
  localizedSlug: string,
): string | null {
  const locale = isValidLocale(lang) ? lang : "fr";
  const normalized = localizedSlug.replace(/^\/+|\/+$/g, "");

  // Exact match in reverse map
  const reverseMap = reverseSlugMap[locale];
  const exactCanonical = reverseMap.get(normalized);
  if (exactCanonical) {
    return exactCanonical;
  }

  // Prefix match for dynamic segments (e.g. "organisations/my-org" → "organizations/my-org")
  for (const [localized, canonical] of reverseMap.entries()) {
    if (normalized.startsWith(localized + "/")) {
      const tail = normalized.slice(localized.length); // includes leading /
      return canonical + tail;
    }
  }

  // No rewrite needed
  return null;
}
