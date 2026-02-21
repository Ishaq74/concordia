/**
 * Generate a relative URL for a given locale and path.
 * Replaces getRelativeLocaleUrl from astro:i18n for explicit type resolution.
 * Works with i18n.routing.prefixDefaultLocale: true.
 *
 * @param locale - Locale code (fr, en, ar, es)
 * @param path - Page path (e.g. "/blog", "services")
 * @returns Prefixed relative URL (e.g. "/fr/blog")
 */
export function getRelativeLocaleUrl(locale: string, path: string = ""): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // Avoid double slash: /fr/ when path is empty
  if (normalizedPath === "/") return `/${locale}/`;
  return `/${locale}${normalizedPath}`;
}
