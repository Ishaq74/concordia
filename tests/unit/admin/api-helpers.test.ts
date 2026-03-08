import { describe, it, expect, vi } from 'vitest';

// Mock the permissions module BEFORE importing api-helpers
vi.mock('@lib/admin/permissions', () => ({
  isAdminUser: vi.fn((user: unknown) => {
    if (!user || typeof user !== 'object') return false;
    const u = user as Record<string, unknown>;
    return typeof u.role === 'string' && u.role.toLowerCase().includes('admin');
  }),
}));

import { json, guardAdmin, generateId, slugify } from '@lib/admin/api-helpers';

describe('admin/api-helpers', () => {
  describe('json()', () => {
    it('returns a Response with correct status', () => {
      const res = json(200, { ok: true });
      expect(res).toBeInstanceOf(Response);
      expect(res.status).toBe(200);
    });

    it('sets Content-Type to application/json', () => {
      const res = json(201, {});
      expect(res.headers.get('Content-Type')).toBe('application/json');
    });

    it('serialises payload as JSON body', async () => {
      const payload = { items: [1, 2, 3], count: 3 };
      const res = json(200, payload);
      const body = await res.json();
      expect(body).toEqual(payload);
    });

    it('supports error status codes', () => {
      const res = json(404, { error: 'not found' });
      expect(res.status).toBe(404);
    });

    it('supports 500 status code', () => {
      const res = json(500, { error: 'internal' });
      expect(res.status).toBe(500);
    });
  });

  describe('guardAdmin()', () => {
    it('returns null for an admin user (caller continues)', () => {
      const locals = { user: { role: 'admin' } } as unknown as App.Locals;
      expect(guardAdmin(locals)).toBeNull();
    });

    it('returns null for superadmin user', () => {
      const locals = { user: { role: 'superadmin' } } as unknown as App.Locals;
      expect(guardAdmin(locals)).toBeNull();
    });

    it('returns 403 Response for a regular user', async () => {
      const locals = { user: { role: 'user' } } as unknown as App.Locals;
      const res = guardAdmin(locals);
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
      const body = await res!.json();
      expect(body).toEqual({ error: 'forbidden' });
    });

    it('returns 403 when user is null', async () => {
      const locals = { user: null } as unknown as App.Locals;
      const res = guardAdmin(locals);
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('returns 403 when user is undefined', async () => {
      const locals = { user: undefined } as unknown as App.Locals;
      const res = guardAdmin(locals);
      expect(res!.status).toBe(403);
    });
  });

  describe('generateId()', () => {
    it('returns a valid UUID v4 string', () => {
      const id = generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('generates unique IDs on successive calls', () => {
      const ids = new Set(Array.from({ length: 50 }, () => generateId()));
      expect(ids.size).toBe(50);
    });
  });

  describe('slugify()', () => {
    it('lowercases and hyphenates spaces', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('removes diacritics', () => {
      expect(slugify('Résumé détaillé')).toBe('resume-detaille');
    });

    it('replaces special characters with hyphens', () => {
      expect(slugify('foo@bar & baz!')).toBe('foo-bar-baz');
    });

    it('strips leading/trailing hyphens', () => {
      expect(slugify('---test---')).toBe('test');
    });

    it('collapses multiple hyphens', () => {
      expect(slugify('a   b   c')).toBe('a-b-c');
    });

    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('handles Arabic text', () => {
      const result = slugify('مرحبا');
      expect(result).toBe('');
    });

    it('handles mixed unicode and latin', () => {
      expect(slugify('Café Latte')).toBe('cafe-latte');
    });
  });
});
