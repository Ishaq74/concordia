import { describe, it, expect } from 'vitest';
import { getRelativeLocaleUrl } from '@lib/i18n/locale-url';

describe('i18n/locale-url', () => {
  describe('getRelativeLocaleUrl()', () => {
    it('prefixes locale with path', () => {
      expect(getRelativeLocaleUrl('fr', '/blog')).toBe('/fr/blog');
    });

    it('handles path without leading slash', () => {
      expect(getRelativeLocaleUrl('en', 'services')).toBe('/en/services');
    });

    it('returns /{locale}/ for empty path', () => {
      expect(getRelativeLocaleUrl('ar', '')).toBe('/ar/');
    });

    it('returns /{locale}/ for root path', () => {
      expect(getRelativeLocaleUrl('es', '/')).toBe('/es/');
    });

    it('handles nested paths', () => {
      expect(getRelativeLocaleUrl('fr', '/blog/article/123')).toBe(
        '/fr/blog/article/123',
      );
    });

    it('works with all supported locales', () => {
      for (const locale of ['fr', 'en', 'es', 'ar']) {
        const url = getRelativeLocaleUrl(locale, '/test');
        expect(url).toBe(`/${locale}/test`);
      }
    });
  });
});
