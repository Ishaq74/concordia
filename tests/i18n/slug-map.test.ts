import { describe, it, expect } from "vitest";
import {
  slugMap,
  reverseSlugMap,
  SUPPORTED_LOCALES
} from "@i18n/slug-map";

describe("slug-map", () => {
  it("exports 20 canonical entries (12 original + 7 navigation + 1 legal)", () => {
    expect(Object.keys(slugMap)).toHaveLength(20);
  });

  it("every entry has all 4 locales defined", () => {
    for (const [canonical, locales] of Object.entries(slugMap)) {
      for (const lang of SUPPORTED_LOCALES) {
        expect(locales[lang], `missing ${lang} in "${canonical}"`).toBeDefined();
        expect(typeof locales[lang]).toBe("string");
        expect(locales[lang].length).toBeGreaterThan(0);
      }
    }
  });

  it("EN slug always matches the canonical key", () => {
    for (const [canonical, locales] of Object.entries(slugMap)) {
      expect(locales.en).toBe(canonical);
    }
  });

  it("AR slug matches EN slug (per mapping table)", () => {
    for (const locales of Object.values(slugMap)) {
      // AR uses the same slug as EN for all 13 types per the spec
      expect(locales.ar).toBe(locales.en);
    }
  });

  it("no duplicate localized slugs within a single locale", () => {
    for (const lang of SUPPORTED_LOCALES) {
      const slugs = Object.values(slugMap).map((l) => l[lang]);
      const unique = new Set(slugs);
      expect(unique.size, `duplicate slug found for locale ${lang}`).toBe(slugs.length);
    }
  });

  describe("reverseSlugMap", () => {
    it("has entries for all 4 locales", () => {
      for (const lang of SUPPORTED_LOCALES) {
        expect(reverseSlugMap[lang]).toBeInstanceOf(Map);
      }
    });

    it("reverse map resolves FR localized slugs back to canonical", () => {
      const frMap = reverseSlugMap.fr;
      expect(frMap.get("a-propos")).toBe("about");
      expect(frMap.get("auth/connexion")).toBe("auth/sign-in");
      expect(frMap.get("auth/inscription")).toBe("auth/sign-up");
      expect(frMap.get("organisations")).toBe("organizations");
      expect(frMap.get("blog/auteur")).toBe("blog/author");
    });

    it("reverse map resolves ES localized slugs back to canonical", () => {
      const esMap = reverseSlugMap.es;
      expect(esMap.get("acerca-de")).toBe("about");
      expect(esMap.get("auth/iniciar-sesion")).toBe("auth/sign-in");
      expect(esMap.get("auth/registro")).toBe("auth/sign-up");
      expect(esMap.get("organizaciones")).toBe("organizations");
      expect(esMap.get("blog/autor")).toBe("blog/author");
    });

    it("EN reverse map is empty (EN = canonical, no rewrite needed)", () => {
      expect(reverseSlugMap.en.size).toBe(0);
    });

    it("AR reverse map is empty (AR = EN = canonical)", () => {
      expect(reverseSlugMap.ar.size).toBe(0);
    });

    it("is strictly the inverse of slugMap for non-identity entries", () => {
      for (const [canonical, locales] of Object.entries(slugMap)) {
        for (const lang of SUPPORTED_LOCALES) {
          const localized = locales[lang];
          if (localized !== canonical) {
            expect(
              reverseSlugMap[lang].get(localized),
              `reverse[${lang}]["${localized}"] should be "${canonical}"`,
            ).toBe(canonical);
          }
        }
      }
    });
  });
});
