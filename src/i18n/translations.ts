/**
 * Centralised translation loader.
 *
 * Uses `import.meta.glob` so Vite can statically analyse the set of JSON
 * files at build time — unlike a bare `await import(…/${lang}.json)` which
 * produces "Unknown variable dynamic import" errors at runtime.
 */

const modules = import.meta.glob<{ default: Record<string, any> }>(
  './*.json',
  { eager: true },
);

/**
 * Return the translation object for the given locale.
 *
 * @example
 * ```ts
 * import { getTranslations } from "@i18n/translations";
 * const t = getTranslations("fr");
 * ```
 */
export function getTranslations(locale: string): Record<string, any> {
  const key = `./${locale}.json`;
  const mod = modules[key];
  if (!mod) {
    throw new Error(`[i18n] Unknown locale "${locale}". Available: ${Object.keys(modules).join(', ')}`);
  }
  return mod.default;
}
