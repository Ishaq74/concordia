import { describe, it, expect } from "vitest";
import { SUPPORTED_LOCALES } from "@i18n/slug-map";

/**
 * Ensures every key present in the reference locale (FR) also exists
 * in every other locale file. This catches missing translation keys
 * at test time rather than at runtime.
 */

async function loadTranslations(locale: string): Promise<Record<string, unknown>> {
  // Dynamic import — vitest resolves the @i18n alias
  const mod = await import(`@i18n/${locale}.json`);
  return mod.default ?? mod;
}

function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

describe("translation coverage", () => {
  it("all locales have the same top-level sections as FR", async () => {
    const fr = await loadTranslations("fr");
    const frSections = Object.keys(fr).sort();

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "fr") continue;
      const data = await loadTranslations(locale);
      const sections = Object.keys(data).sort();
      expect(sections, `${locale} should have the same top-level sections as FR`).toEqual(frSections);
    }
  });

  it("every key in FR exists in all other locales", async () => {
    const fr = await loadTranslations("fr");
    const frKeys = collectKeys(fr);

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "fr") continue;
      const data = await loadTranslations(locale);
      const localeKeys = new Set(collectKeys(data));

      const missing = frKeys.filter((k) => !localeKeys.has(k));
      expect(
        missing,
        `${locale} is missing ${missing.length} keys present in FR: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "..." : ""}`,
      ).toHaveLength(0);
    }
  });

  it("no extra keys in other locales that FR doesn't have", async () => {
    const fr = await loadTranslations("fr");
    const frKeys = new Set(collectKeys(fr));

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "fr") continue;
      const data = await loadTranslations(locale);
      const localeKeys = collectKeys(data);

      const extra = localeKeys.filter((k) => !frKeys.has(k));
      expect(
        extra,
        `${locale} has ${extra.length} extra keys not in FR: ${extra.slice(0, 10).join(", ")}${extra.length > 10 ? "..." : ""}`,
      ).toHaveLength(0);
    }
  });
});
