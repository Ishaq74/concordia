import { describe, it, expect, vi } from 'vitest';
import { securityPayloads } from '@tests/fixtures/security-payloads';

// ── Mocks for modules that security code imports ──────────────────────

vi.mock('astro:actions', () => ({
  defineAction: (opts: any) => ({ handler: opts.handler }),
}));

vi.mock('astro:schema', () => import('@tests/mocks/astro-schema'));

const { mockDb } = vi.hoisted(() => {
  const mockDb = {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
  };
  return { mockDb };
});
vi.mock('@database/drizzle', () => ({ getDrizzle: vi.fn(() => mockDb) }));
vi.mock('@database/schemas/blog_comments.schema', () => ({ blogComments: {} }));
vi.mock('nanoid', () => ({ nanoid: () => 'id' }));

// ── Real imports of application security code ─────────────────────────

import { COMBINED_DANGEROUS, validateUserInput } from '@lib/auth/validate-user';
import { guardAdmin } from '@lib/admin/api-helpers';
import { isAdminUser, isSuperAdminUser } from '@lib/admin/permissions';

// =====================================================================
// 1. COMBINED_DANGEROUS regex — blocks XSS, SQLi, NoSQLi, command injection
// =====================================================================
describe('COMBINED_DANGEROUS regex', () => {
  it.each(securityPayloads.xss)('blocks XSS payload: %s', (payload) => {
    expect(COMBINED_DANGEROUS.test(payload)).toBe(true);
  });

  it.each(securityPayloads.sql)('blocks SQL injection payload: %s', (payload) => {
    expect(COMBINED_DANGEROUS.test(payload)).toBe(true);
  });

  it.each(securityPayloads.commandInjection)('blocks command injection: %s', (payload) => {
    expect(COMBINED_DANGEROUS.test(payload)).toBe(true);
  });

  it.each(securityPayloads.pathTraversal)('blocks path traversal: %s', (payload) => {
    expect(COMBINED_DANGEROUS.test(payload)).toBe(true);
  });

  it.each(securityPayloads.nullBytes)('blocks null-byte payload: %s', (payload) => {
    expect(COMBINED_DANGEROUS.test(payload)).toBe(true);
  });

  it('allows safe content', () => {
    expect(COMBINED_DANGEROUS.test('Hello world')).toBe(false);
    expect(COMBINED_DANGEROUS.test('Bon article !')).toBe(false);
    expect(COMBINED_DANGEROUS.test('A simple comment with numbers 123')).toBe(false);
  });
});

// =====================================================================
// 2. validateUserInput — full input validation
// =====================================================================
describe('validateUserInput', () => {
  const validInput = {
    email: 'user@example.com',
    username: 'alice',
    name: 'Alice',
    password: 'CorrectHorse42!',
  };

  it('accepts valid input', () => {
    expect(() => validateUserInput(validInput)).not.toThrow();
  });

  it('rejects XSS in username', () => {
    expect(() =>
      validateUserInput({ ...validInput, username: '<script>alert(1)</script>' })
    ).toThrow(/dangerous/i);
  });

  it('rejects SQLi in name', () => {
    expect(() =>
      validateUserInput({ ...validInput, name: "'; DROP TABLE user; --" })
    ).toThrow(/dangerous/i);
  });

  it('rejects command injection in password', () => {
    expect(() =>
      validateUserInput({ ...validInput, password: '; cat /etc/passwd' })
    ).toThrow(/dangerous/i);
  });

  it('rejects path traversal in username', () => {
    expect(() =>
      validateUserInput({ ...validInput, username: '../../../etc/passwd' })
    ).toThrow(/dangerous/i);
  });

  it('rejects null byte in email', () => {
    expect(() =>
      validateUserInput({ ...validInput, email: 'user\x00@example.com' })
    ).toThrow(/dangerous/i);
  });

  it('rejects non-string input', () => {
    expect(() =>
      validateUserInput({ ...validInput, email: 42 as any })
    ).toThrow(/invalid input type/i);
  });

  it('rejects null input', () => {
    expect(() =>
      validateUserInput({ ...validInput, email: null as any })
    ).toThrow(/invalid input type/i);
  });

  it('rejects empty string', () => {
    expect(() =>
      validateUserInput({ ...validInput, username: '' })
    ).toThrow(/empty input/i);
  });

  it.each(securityPayloads.weakPasswords)('rejects weak password: %s', (pwd) => {
    expect(() =>
      validateUserInput({ ...validInput, password: pwd })
    ).toThrow();
  });

  it.each(securityPayloads.invalidEmails)('rejects invalid email: %s', (email) => {
    expect(() =>
      validateUserInput({ ...validInput, email })
    ).toThrow();
  });
});

// =====================================================================
// 3. RBAC — guardAdmin, isAdminUser, isSuperAdminUser
// =====================================================================
describe('RBAC — access control functions', () => {
  describe('isAdminUser()', () => {
    it('grants admin role', () => {
      expect(isAdminUser({ role: 'admin' })).toBe(true);
    });

    it('grants superadmin role', () => {
      expect(isAdminUser({ role: 'superadmin' })).toBe(true);
    });

    it('denies regular user role', () => {
      expect(isAdminUser({ role: 'user' })).toBe(false);
    });

    it('denies null/undefined user', () => {
      expect(isAdminUser(null)).toBe(false);
      expect(isAdminUser(undefined)).toBe(false);
    });

    it('denies empty object', () => {
      expect(isAdminUser({})).toBe(false);
    });
  });

  describe('isSuperAdminUser()', () => {
    it('grants superadmin only', () => {
      expect(isSuperAdminUser({ role: 'superadmin' })).toBe(true);
    });

    it('denies admin (not super)', () => {
      expect(isSuperAdminUser({ role: 'admin' })).toBe(false);
    });
  });

  describe('guardAdmin()', () => {
    it('returns null (pass) for admin user', () => {
      const result = guardAdmin({ user: { role: 'admin' } } as any);
      expect(result).toBeNull();
    });

    it('returns 403 Response for non-admin', () => {
      const result = guardAdmin({ user: { role: 'user' } } as any);
      expect(result).toBeInstanceOf(Response);
      expect(result!.status).toBe(403);
    });

    it('returns 403 Response for missing user', () => {
      const result = guardAdmin({} as any);
      expect(result).toBeInstanceOf(Response);
      expect(result!.status).toBe(403);
    });
  });
});

// =====================================================================
// 4. Comment handler — rejects dangerous content at application layer
// =====================================================================
describe('Comment handler — XSS rejection', () => {
  it('rejects XSS in comment content', async () => {
    const { commentActions } = await import('@actions/comments');
    const handler = (commentActions as any).createComment.handler;

    await expect(
      handler(
        { postId: 'p1', postType: 'blog', content: '<script>alert(1)</script>' },
        { locals: { user: { name: 'Test', email: 'a@b.com' } }, request: { url: 'http://x/fr/blog/1' } }
      )
    ).rejects.toThrow('INVALID_CONTENT');
  });

  it('rejects javascript: URI in comment content', async () => {
    const { commentActions } = await import('@actions/comments');
    const handler = (commentActions as any).createComment.handler;

    await expect(
      handler(
        { postId: 'p1', postType: 'blog', content: 'javascript:alert(1)' },
        { locals: { user: { name: 'Test', email: 'a@b.com' } }, request: { url: 'http://x/fr/blog/1' } }
      )
    ).rejects.toThrow('INVALID_CONTENT');
  });

  it('accepts safe comment content', async () => {
    mockDb.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    const { commentActions } = await import('@actions/comments');
    const handler = (commentActions as any).createComment.handler;

    const result = await handler(
      { postId: 'p1', postType: 'blog', content: 'Great article, merci !', rating: 0 },
      { locals: { user: { name: 'Alice', email: 'a@b.com' } }, request: { url: 'http://x/fr/blog/1' } }
    );
    expect(result).toEqual({ success: true });
  });

  it('rejects unauthenticated comment', async () => {
    const { commentActions } = await import('@actions/comments');
    const handler = (commentActions as any).createComment.handler;

    await expect(
      handler(
        { postId: 'p1', postType: 'blog', content: 'hello' },
        { locals: {}, request: { url: 'http://x/fr/blog/1' } }
      )
    ).rejects.toThrow('UNAUTHORIZED');
  });
});
