import { describe, it, expect, vi } from 'vitest';

// Mock the permissions module BEFORE importing api-helpers
vi.mock('@lib/admin/permissions', () => ({
  isAdminUser: vi.fn((user: unknown) => {
    if (!user || typeof user !== 'object') return false;
    const u = user as Record<string, unknown>;
    return typeof u.role === 'string' && u.role.toLowerCase().includes('admin');
  }),
}));

vi.mock('@lib/auth/permissions', () => ({
  hasPermission: vi.fn((roles: string[], permission: string) => {
    // Admin role has all permissions in tests
    if (roles.includes('admin')) return true;
    // Author role has article permissions
    if (roles.includes('author') && permission.startsWith('article.')) return true;
    // Moderator has moderation permissions
    if (roles.includes('moderator') && permission.startsWith('moderation.')) return true;
    return false;
  }),
}));

import { json, guardAdmin, guardPermission, guardOrgOwnership, generateId, slugify } from '@lib/admin/api-helpers';

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

    it('returns 401 when user is null', async () => {
      const locals = { user: null } as unknown as App.Locals;
      const res = guardAdmin(locals);
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(401);
      const body = await res!.json();
      expect(body).toEqual({ error: 'unauthorized' });
    });

    it('returns 401 when user is undefined', async () => {
      const locals = { user: undefined } as unknown as App.Locals;
      const res = guardAdmin(locals);
      expect(res!.status).toBe(401);
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

  describe('guardPermission()', () => {
    it('returns null for admin user with any permission', () => {
      const locals = { user: { id: '1', role: 'admin' } } as unknown as App.Locals;
      expect(guardPermission(locals, 'article.create')).toBeNull();
    });

    it('returns null for author with article permissions', () => {
      const locals = { user: { id: '1', role: 'author' } } as unknown as App.Locals;
      expect(guardPermission(locals, 'article.create')).toBeNull();
    });

    it('returns 403 for citizen without article permissions', async () => {
      const locals = { user: { id: '1', role: 'citizen' } } as unknown as App.Locals;
      const res = guardPermission(locals, 'article.create');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
      const body = await res!.json();
      expect(body.error).toBe('forbidden');
      expect(body.requiredPermission).toBe('article.create');
    });

    it('returns 401 when user is null', () => {
      const locals = { user: null } as unknown as App.Locals;
      const res = guardPermission(locals, 'article.create');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(401);
    });

    it('returns 403 for moderator without article permissions', () => {
      const locals = { user: { id: '1', role: 'moderator' } } as unknown as App.Locals;
      const res = guardPermission(locals, 'article.create');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('returns null for moderator with moderation permissions', () => {
      const locals = { user: { id: '1', role: 'moderator' } } as unknown as App.Locals;
      expect(guardPermission(locals, 'moderation.action')).toBeNull();
    });
  });

  describe('guardOrgOwnership()', () => {
    it('returns null for admin user (bypass)', () => {
      const locals = { user: { role: 'admin' }, organizationId: 'org-2' } as unknown as App.Locals;
      expect(guardOrgOwnership(locals, 'org-1')).toBeNull();
    });

    it('returns null when resource has no org', () => {
      const locals = { user: { role: 'citizen' }, organizationId: 'org-1' } as unknown as App.Locals;
      expect(guardOrgOwnership(locals, null)).toBeNull();
    });

    it('returns null when org matches', () => {
      const locals = { user: { role: 'citizen' }, organizationId: 'org-1' } as unknown as App.Locals;
      expect(guardOrgOwnership(locals, 'org-1')).toBeNull();
    });

    it('returns 403 when org does not match', async () => {
      const locals = { user: { role: 'citizen' }, organizationId: 'org-1' } as unknown as App.Locals;
      const res = guardOrgOwnership(locals, 'org-2');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
      const body = await res!.json();
      expect(body.reason).toBe('organization_mismatch');
    });

    it('returns 403 when user has no active org', () => {
      const locals = { user: { role: 'citizen' } } as unknown as App.Locals;
      const res = guardOrgOwnership(locals, 'org-1');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });
  });
});
