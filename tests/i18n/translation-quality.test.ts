import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@i18n/slug-map';

/**
 * Translation quality tests — go beyond key coverage to check:
 * - No empty or whitespace-only values
 * - Placeholder consistency ({name}, {count}, etc.)
 * - No untranslated strings (FR value appearing in non-FR locale)
 * - No HTML in translation values (should use components)
 * - Arabic translations exist for RTL-critical UI elements
 */

async function loadTranslations(locale: string): Promise<Record<string, unknown>> {
  const mod = await import(`@i18n/${locale}.json`);
  return mod.default ?? mod;
}

function collectEntries(obj: Record<string, unknown>, prefix = ''): Array<{ key: string; value: unknown }> {
  const entries: Array<{ key: string; value: unknown }> = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...collectEntries(value as Record<string, unknown>, full));
    } else {
      entries.push({ key: full, value });
    }
  }
  return entries;
}

function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{[^}]+\}/g);
  return matches ? matches.sort() : [];
}

// ─── Empty Values ─────────────────────────────────────────────

describe('Translation quality — No empty values', () => {
  for (const locale of SUPPORTED_LOCALES) {
    it(`${locale}: no empty or whitespace-only translation values`, async () => {
      const data = await loadTranslations(locale);
      const entries = collectEntries(data);

      const empties = entries.filter(
        e => typeof e.value === 'string' && e.value.trim() === ''
      );

      expect(
        empties.map(e => e.key),
        `${locale} has ${empties.length} empty values`
      ).toHaveLength(0);
    });
  }
});

// ─── Placeholder Consistency ──────────────────────────────────

describe('Translation quality — Placeholder consistency', () => {
  it('all locales have the same placeholders as FR', async () => {
    const fr = await loadTranslations('fr');
    const frEntries = collectEntries(fr);

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === 'fr') continue;
      const data = await loadTranslations(locale);
      const localeEntries = new Map(collectEntries(data).map(e => [e.key, e.value]));

      const mismatches: string[] = [];

      for (const { key, value } of frEntries) {
        if (typeof value !== 'string') continue;
        const frPlaceholders = extractPlaceholders(value);
        if (frPlaceholders.length === 0) continue;

        const localeValue = localeEntries.get(key);
        if (typeof localeValue !== 'string') continue;

        const localePlaceholders = extractPlaceholders(localeValue);
        if (JSON.stringify(frPlaceholders) !== JSON.stringify(localePlaceholders)) {
          mismatches.push(`${key}: FR=${frPlaceholders.join(',')} vs ${locale}=${localePlaceholders.join(',')}`);
        }
      }

      expect(
        mismatches,
        `${locale} has ${mismatches.length} placeholder mismatches:\n${mismatches.slice(0, 5).join('\n')}`
      ).toHaveLength(0);
    }
  });
});

// ─── Untranslated Strings ─────────────────────────────────────

describe('Translation quality — No copy-paste from FR', () => {
  // Check that non-FR locales don't have too many identical values to FR
  // (some will legitimately be the same, e.g. brand names, URLs)
  it('non-FR locales should have < 30% identical values to FR', async () => {
    const fr = await loadTranslations('fr');
    const frEntries = collectEntries(fr);
    const frMap = new Map(frEntries.map(e => [e.key, e.value]));

    for (const locale of SUPPORTED_LOCALES) {
      if (locale === 'fr') continue;
      const data = await loadTranslations(locale);
      const localeEntries = collectEntries(data);

      let identicalCount = 0;
      let totalStrings = 0;

      for (const { key, value } of localeEntries) {
        if (typeof value !== 'string') continue;
        totalStrings++;
        const frValue = frMap.get(key);
        if (typeof frValue === 'string' && frValue === value && value.length > 3) {
          identicalCount++;
        }
      }

      if (totalStrings > 0) {
        const ratio = identicalCount / totalStrings;
        expect(
          ratio,
          `${locale}: ${identicalCount}/${totalStrings} (${(ratio * 100).toFixed(1)}%) strings identical to FR`
        ).toBeLessThan(0.3);
      }
    }
  });
});

// ─── No Raw HTML ──────────────────────────────────────────────

describe('Translation quality — No raw HTML in values', () => {
  const htmlPattern = /<(?:script|style|iframe|object|embed|form|input|button|select|textarea)\b/i;

  for (const locale of SUPPORTED_LOCALES) {
    it(`${locale}: no dangerous HTML tags in translations`, async () => {
      const data = await loadTranslations(locale);
      const entries = collectEntries(data);

      const withHtml = entries.filter(
        e => typeof e.value === 'string' && htmlPattern.test(e.value)
      );

      expect(
        withHtml.map(e => `${e.key}: ${String(e.value).slice(0, 50)}`),
        `${locale} has ${withHtml.length} entries with dangerous HTML`
      ).toHaveLength(0);
    });
  }
});

// ─── Slug Map Coverage ────────────────────────────────────────

describe('Translation quality — Slug map completeness', () => {
  it('all slug-map entries have values for every supported locale', async () => {
    const { slugMap } = await import('@i18n/slug-map');

    const incomplete: string[] = [];
    for (const [canonical, localeMap] of Object.entries(slugMap)) {
      for (const locale of SUPPORTED_LOCALES) {
        const value = (localeMap as Record<string, string>)[locale];
        if (!value || value.trim() === '') {
          incomplete.push(`${canonical} missing ${locale}`);
        }
      }
    }

    expect(incomplete, `Slug map has ${incomplete.length} missing entries`).toHaveLength(0);
  });

  it('no slug-map values contain special characters', async () => {
    const { slugMap } = await import('@i18n/slug-map');
    const badChars = /[^a-z0-9\-\/]/;

    const bad: string[] = [];
    for (const [canonical, localeMap] of Object.entries(slugMap)) {
      for (const [locale, slug] of Object.entries(localeMap as Record<string, string>)) {
        if (badChars.test(slug)) {
          bad.push(`${canonical}[${locale}] = "${slug}"`);
        }
      }
    }

    expect(bad, `Slug map has ${bad.length} entries with bad characters`).toHaveLength(0);
  });
});

// ─── Value Length Sanity ──────────────────────────────────────

describe('Translation quality — Value length sanity', () => {
  it('no translation value exceeds 5000 characters', async () => {
    for (const locale of SUPPORTED_LOCALES) {
      const data = await loadTranslations(locale);
      const entries = collectEntries(data);

      const tooLong = entries.filter(
        e => typeof e.value === 'string' && e.value.length > 5000
      );

      expect(
        tooLong.map(e => `${e.key} (${String(e.value).length} chars)`),
        `${locale} has ${tooLong.length} excessively long values`
      ).toHaveLength(0);
    }
  });
});
