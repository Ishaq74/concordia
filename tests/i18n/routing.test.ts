import { describe, it, expect } from "vitest";
import {
  getLocalizedUrl,
  getCanonicalPath,
  getSupportedLocales,
  isValidLocale,
} from "@lib/i18n/route-helpers";

describe("route-helpers", () => {
  // ── isValidLocale ─────────────────────────────────────────
  describe("isValidLocale", () => {
    it("accepts valid locales", () => {
      expect(isValidLocale("fr")).toBe(true);
      expect(isValidLocale("en")).toBe(true);
      expect(isValidLocale("es")).toBe(true);
      expect(isValidLocale("ar")).toBe(true);
    });

    it("rejects invalid locales", () => {
      expect(isValidLocale("de")).toBe(false);
      expect(isValidLocale("")).toBe(false);
      expect(isValidLocale("FR")).toBe(false);
    });
  });

  // ── getSupportedLocales ────────────────────────────────────
  describe("getSupportedLocales", () => {
    it("returns exactly 4 locales", () => {
      expect(getSupportedLocales()).toEqual(["fr", "en", "es", "ar"]);
    });
  });

  // ── getLocalizedUrl ────────────────────────────────────────
  describe("getLocalizedUrl", () => {
    it("localizes top-level pages", () => {
      expect(getLocalizedUrl("fr", "about")).toBe("/fr/a-propos");
      expect(getLocalizedUrl("en", "about")).toBe("/en/about");
      expect(getLocalizedUrl("es", "about")).toBe("/es/acerca-de");
      expect(getLocalizedUrl("ar", "about")).toBe("/ar/about");
    });

    it("localizes auth pages", () => {
      expect(getLocalizedUrl("fr", "auth/sign-in")).toBe("/fr/auth/connexion");
      expect(getLocalizedUrl("en", "auth/sign-in")).toBe("/en/auth/sign-in");
      expect(getLocalizedUrl("es", "auth/sign-in")).toBe("/es/auth/iniciar-sesion");
      expect(getLocalizedUrl("fr", "auth/sign-up")).toBe("/fr/auth/inscription");
      expect(getLocalizedUrl("es", "auth/sign-up")).toBe("/es/auth/registro");
    });


    it("localizes blog/author with dynamic slug", () => {
      expect(getLocalizedUrl("fr", "blog/author/john-doe")).toBe("/fr/blog/auteur/john-doe");
      expect(getLocalizedUrl("es", "blog/author/john-doe")).toBe("/es/blog/autor/john-doe");
      expect(getLocalizedUrl("en", "blog/author/john-doe")).toBe("/en/blog/author/john-doe");
    });

    it("passes through non-localized paths unchanged", () => {
      expect(getLocalizedUrl("fr", "admin")).toBe("/fr/admin");
      expect(getLocalizedUrl("en", "docs/design/button")).toBe("/en/docs/design/button");
      expect(getLocalizedUrl("fr", "blog")).toBe("/fr/blog");
    });

    it("handles root path", () => {
      expect(getLocalizedUrl("fr", "")).toBe("/fr/");
      expect(getLocalizedUrl("en", "/")).toBe("/en/");
    });

    it("strips leading/trailing slashes from canonical path", () => {
      expect(getLocalizedUrl("fr", "/about/")).toBe("/fr/a-propos");
      expect(getLocalizedUrl("fr", "/auth/sign-in/")).toBe("/fr/auth/connexion");
    });

    it("falls back to fr for invalid locale", () => {
      expect(getLocalizedUrl("de", "about")).toBe("/fr/a-propos");
    });
  });

  // ── getCanonicalPath ───────────────────────────────────────
  describe("getCanonicalPath", () => {
    it("resolves FR localized slugs to canonical paths", () => {
      expect(getCanonicalPath("fr", "a-propos")).toBe("about");
      expect(getCanonicalPath("fr", "auth/connexion")).toBe("auth/sign-in");
      expect(getCanonicalPath("fr", "auth/inscription")).toBe("auth/sign-up");
      expect(getCanonicalPath("fr", "blog/auteur")).toBe("blog/author");
    });

    it("resolves ES localized slugs to canonical paths", () => {
      expect(getCanonicalPath("es", "acerca-de")).toBe("about");
      expect(getCanonicalPath("es", "auth/iniciar-sesion")).toBe("auth/sign-in");
    });

    it("returns null for EN (already canonical)", () => {
      expect(getCanonicalPath("en", "about")).toBeNull();
      expect(getCanonicalPath("en", "auth/sign-in")).toBeNull();
    });

    it("returns null for AR (same as EN)", () => {
      expect(getCanonicalPath("ar", "about")).toBeNull();
      expect(getCanonicalPath("ar", "auth/sign-in")).toBeNull();
    });

    it("returns null for paths without any mapping", () => {
      expect(getCanonicalPath("fr", "admin")).toBeNull();
      expect(getCanonicalPath("fr", "docs/design/button")).toBeNull();
      expect(getCanonicalPath("fr", "blog")).toBeNull();
    });

    it("handles dynamic segments after a mapped prefix", () => {
      expect(getCanonicalPath("fr", "blog/auteur/john-doe")).toBe("blog/author/john-doe");
    });

    it("strips leading/trailing slashes", () => {
      expect(getCanonicalPath("fr", "/a-propos/")).toBe("about");
    });
  });
});
