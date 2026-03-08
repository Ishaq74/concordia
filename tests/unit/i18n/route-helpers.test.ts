import { describe, it, expect, vi } from 'vitest';

vi.mock('@i18n/slug-map', () => {
  const SUPPORTED_LOCALES = ['fr', 'en', 'es', 'ar'] as const;
  const slugMap: Record<string, Record<string, string>> = {
    about: { fr: 'a-propos', en: 'about', es: 'acerca-de', ar: 'about' },
    organizations: { fr: 'organisations', en: 'organizations', es: 'organizaciones', ar: 'organizations' },
    'auth/sign-in': { fr: 'auth/connexion', en: 'auth/sign-in', es: 'auth/iniciar-sesion', ar: 'auth/sign-in' },
  };

  // Build reverse map
  const reverseSlugMap: Record<string, Map<string, string>> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const map = new Map<string, string>();
    for (const [canonical, localized] of Object.entries(slugMap)) {
      if (localized[locale]) {
        map.set(localized[locale], canonical);
      }
    }
    reverseSlugMap[locale] = map;
  }

  return { SUPPORTED_LOCALES, slugMap, reverseSlugMap };
});

import {
  isValidLocale,
  getSupportedLocales,
  getLocalizedUrl,
  getCanonicalPath,
} from '@lib/i18n/route-helpers';

describe('i18n/route-helpers', () => {
  describe('isValidLocale()', () => {
    it('returns true for supported locales', () => {
      expect(isValidLocale('fr')).toBe(true);
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('es')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
    });

    it('returns false for unsupported locales', () => {
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('zh')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('getSupportedLocales()', () => {
    it('returns all 4 locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toHaveLength(4);
      expect(locales).toContain('fr');
      expect(locales).toContain('en');
    });
  });

  describe('getLocalizedUrl()', () => {
    it('returns exact match for known page', () => {
      expect(getLocalizedUrl('fr', 'about')).toBe('/fr/a-propos');
      expect(getLocalizedUrl('en', 'about')).toBe('/en/about');
      expect(getLocalizedUrl('es', 'about')).toBe('/es/acerca-de');
    });

    it('returns /{locale}/ for empty path', () => {
      expect(getLocalizedUrl('fr', '')).toBe('/fr/');
      expect(getLocalizedUrl('fr', '/')).toBe('/fr/');
    });

    it('handles prefix match for dynamic segments', () => {
      expect(getLocalizedUrl('fr', 'organizations/my-org')).toBe(
        '/fr/organisations/my-org',
      );
    });

    it('passes through unmapped slugs as-is', () => {
      expect(getLocalizedUrl('fr', 'blog')).toBe('/fr/blog');
    });

    it('falls back to "fr" for invalid locale', () => {
      const url = getLocalizedUrl('xx', 'about');
      expect(url).toBe('/fr/a-propos');
    });

    it('strips leading/trailing slashes from path', () => {
      expect(getLocalizedUrl('en', '/about/')).toBe('/en/about');
    });
  });

  describe('getCanonicalPath()', () => {
    it('resolves localized slug to canonical path', () => {
      expect(getCanonicalPath('fr', 'a-propos')).toBe('about');
      expect(getCanonicalPath('es', 'acerca-de')).toBe('about');
    });

    it('returns null when no rewrite needed', () => {
      expect(getCanonicalPath('en', 'blog')).toBeNull();
    });

    it('handles prefix match for dynamic segments', () => {
      expect(getCanonicalPath('fr', 'organisations/my-org')).toBe(
        'organizations/my-org',
      );
    });

    it('falls back to "fr" for invalid locale', () => {
      expect(getCanonicalPath('xx', 'a-propos')).toBe('about');
    });
  });
});
