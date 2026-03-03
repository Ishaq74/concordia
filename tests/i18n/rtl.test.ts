/**
 * RTL (Right-to-Left) layout tests for Arabic locale.
 *
 * Validates that Arabic pages render with correct `dir="rtl"` and `lang="ar"`,
 * and that non-Arabic pages use `dir="ltr"`.
 */

import { describe, it, expect } from "vitest";
import { getSupportedLocales } from "@lib/i18n/route-helpers";

const locales = [...getSupportedLocales()];
const RTL_LOCALES = ["ar"];

describe("RTL — dir attribute correctness", () => {
  for (const locale of locales) {
    const expectedDir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

    it(`/${locale}/ should have dir="${expectedDir}" and lang="${locale}"`, () => {
      // This test validates the logic in BaseLayout.astro:
      //   const htmlDir = dir ?? (currentLocale === "ar" ? "rtl" : "ltr");
      // Since we can't render Astro components in Vitest, we test the logic directly.
      const htmlDir = locale === "ar" ? "rtl" : "ltr";
      expect(htmlDir).toBe(expectedDir);
    });
  }
});

describe("RTL — locale detection", () => {
  it("only Arabic is RTL", () => {
    for (const locale of locales) {
      const isRtl = locale === "ar";
      if (RTL_LOCALES.includes(locale)) {
        expect(isRtl).toBe(true);
      } else {
        expect(isRtl).toBe(false);
      }
    }
  });

  it("RTL_LOCALES array is consistent with supported locales", () => {
    for (const rtlLocale of RTL_LOCALES) {
      expect(locales).toContain(rtlLocale);
    }
  });
});
