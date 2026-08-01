/**
 * Public page path resolution tests.
 *
 * Validates that getLocalizedUrl produces correct paths for all
 * public page types across all 4 supported locales.
 * These are unit tests (no running server needed).
 */

import { describe, it, expect } from "vitest";
import { getLocalizedUrl, getSupportedLocales } from "@lib/i18n/route-helpers";

const locales = [...getSupportedLocales()];

// Pages that exist under [lang]/ with slug-map entries
const mappedPages = [
  { canonical: "about", expected: { fr: "a-propos", en: "about", es: "acerca-de", ar: "about" } },
  { canonical: "contact", expected: { fr: "contact", en: "contact", es: "contacto", ar: "contact" } },
  { canonical: "profile", expected: { fr: "profil", en: "profile", es: "perfil", ar: "profile" } },
  { canonical: "auth/sign-in", expected: { fr: "auth/connexion", en: "auth/sign-in", es: "auth/iniciar-sesion", ar: "auth/sign-in" } },
  { canonical: "auth/sign-up", expected: { fr: "auth/inscription", en: "auth/sign-up", es: "auth/registro", ar: "auth/sign-up" } },
  { canonical: "auth/forgot-password", expected: { fr: "auth/mot-de-passe-oublie", en: "auth/forgot-password", es: "auth/olvido-contrasena", ar: "auth/forgot-password" } },
  { canonical: "auth/verify-email", expected: { fr: "auth/verifier-email", en: "auth/verify-email", es: "auth/verificar-email", ar: "auth/verify-email" } },
];

// Pages that pass through unchanged (no slug-map entry)
const unmappedPages = ["blog", "docs", "admin", "admin/dashboard", "docs/design/button"];

describe("Public pages — localized URL generation", () => {
  for (const { canonical, expected } of mappedPages) {
    describe(canonical, () => {
      for (const locale of locales) {
        it(`${locale} → /${locale}/${expected[locale as keyof typeof expected]}`, () => {
          const url = getLocalizedUrl(locale, canonical);
          expect(url).toBe(`/${locale}/${expected[locale as keyof typeof expected]}`);
        });
      }
    });
  }
});

describe("Unmapped pages — pass-through URL generation", () => {
  for (const page of unmappedPages) {
    for (const locale of locales) {
      it(`${locale}/${page} → /${locale}/${page}`, () => {
        const url = getLocalizedUrl(locale, page);
        expect(url).toBe(`/${locale}/${page}`);
      });
    }
  }
});

describe("Home page URL", () => {
  for (const locale of locales) {
    it(`${locale} home → /${locale}/`, () => {
      const url = getLocalizedUrl(locale, "");
      expect(url).toBe(`/${locale}/`);
    });
  }
});

describe("Dynamic segment pages", () => {

  it("blog/author/john-doe resolves to localized prefix", () => {
    expect(getLocalizedUrl("fr", "blog/author/john-doe")).toBe("/fr/blog/auteur/john-doe");
    expect(getLocalizedUrl("es", "blog/author/john-doe")).toBe("/es/blog/autor/john-doe");
  });
});
