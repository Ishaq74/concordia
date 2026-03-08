import { describe, it, expect } from 'vitest';
import { LANGUAGES, BLOG_RESOURCES } from '@lib/admin/config';

describe('admin/config', () => {
  describe('LANGUAGES', () => {
    it('contains exactly 4 supported locales', () => {
      expect(LANGUAGES).toHaveLength(4);
    });

    it('includes fr, en, es, ar', () => {
      expect(LANGUAGES).toContain('fr');
      expect(LANGUAGES).toContain('en');
      expect(LANGUAGES).toContain('es');
      expect(LANGUAGES).toContain('ar');
    });

    it('is typed as readonly array', () => {
      // `as const` makes it readonly at compile time; at runtime it's still an array
      expect(Array.isArray(LANGUAGES)).toBe(true);
    });
  });

  describe('BLOG_RESOURCES', () => {
    it('has authors, categories, posts keys', () => {
      expect(BLOG_RESOURCES).toHaveProperty('authors');
      expect(BLOG_RESOURCES).toHaveProperty('categories');
      expect(BLOG_RESOURCES).toHaveProperty('posts');
    });

    it('authors has collection and fields', () => {
      expect(BLOG_RESOURCES.authors.collection).toBe('blogAuthors');
      expect(BLOG_RESOURCES.authors.fields.system).toContain('slug');
      expect(BLOG_RESOURCES.authors.fields.i18n).toContain('displayName');
    });

    it('categories has collection and fields', () => {
      expect(BLOG_RESOURCES.categories.collection).toBe('blogCategories');
      expect(BLOG_RESOURCES.categories.fields.system).toContain('slug');
      expect(BLOG_RESOURCES.categories.fields.i18n).toContain('name');
    });

    it('posts has collection with i18nTable flag', () => {
      expect(BLOG_RESOURCES.posts.collection).toBe('blogPosts');
      expect((BLOG_RESOURCES.posts.fields as any).i18nTable).toBe(true);
    });
  });
});
