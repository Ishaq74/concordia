import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies that permissions.ts imports
vi.mock('@lib/auth/auth', () => ({
  auth: {
    api: {
      userHasPermission: vi.fn(),
    },
  },
}));

vi.mock('@lib/auth/admin-access-control', () => ({
  loadAdminAccessArtifacts: vi.fn().mockResolvedValue({
    statements: { user: ['create', 'list'] },
    roles: { admin: { statements: { user: ['create', 'list'] } } },
  }),
  getAdminStatements: vi.fn().mockReturnValue({ user: ['create', 'list'] }),
  reloadAdminAccessControl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@lib/admin/policy-store', () => ({
  listRolePolicies: vi.fn().mockResolvedValue([]),
  getRolePolicy: vi.fn().mockResolvedValue(null),
  upsertRolePolicy: vi.fn().mockResolvedValue(undefined),
  deleteRolePolicy: vi.fn().mockResolvedValue(undefined),
  ADMIN_POLICY_TABLE_ERROR: 'ADMIN_POLICY_TABLE_MISSING',
}));

import {
  isAdminUser,
  isSuperAdminUser,
  extractRoleList,
  resolvePrimaryRole,
  normalizeRoleKey,
  sortRoleKeys,
  formatRoleLabel,
  getRoleDefinitions,
  getPermissionModules,
  loadRoleDefinitions,
  loadPermissionModules,
  listRolePolicyDefinitions,
  getRolePolicy,
  saveRolePolicy,
  removeRolePolicy,
  getPermissionStatementMatrix,
} from '@lib/admin/permissions';

describe('admin/permissions — pure functions', () => {
  describe('isAdminUser()', () => {
    it('returns true for role = "admin"', () => {
      expect(isAdminUser({ role: 'admin' })).toBe(true);
    });

    it('returns true for role = "superadmin"', () => {
      expect(isAdminUser({ role: 'superadmin' })).toBe(true);
    });

    it('returns true for comma-separated roles containing admin', () => {
      expect(isAdminUser({ role: 'user,admin' })).toBe(true);
    });

    it('returns true for role as array', () => {
      expect(isAdminUser({ role: ['member', 'admin'] })).toBe(true);
    });

    it('returns true for roles field (plural)', () => {
      expect(isAdminUser({ roles: 'admin' })).toBe(true);
    });

    it('returns false for role = "user"', () => {
      expect(isAdminUser({ role: 'user' })).toBe(false);
    });

    it('returns false for null user', () => {
      expect(isAdminUser(null)).toBe(false);
    });

    it('returns false for undefined user', () => {
      expect(isAdminUser(undefined)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(isAdminUser({})).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isAdminUser('admin')).toBe(false);
    });
  });

  describe('isSuperAdminUser()', () => {
    it('returns true for role = "superadmin"', () => {
      expect(isSuperAdminUser({ role: 'superadmin' })).toBe(true);
    });

    it('returns true for role = "super-admin"', () => {
      expect(isSuperAdminUser({ role: 'super-admin' })).toBe(true);
    });

    it('returns false for role = "admin"', () => {
      expect(isSuperAdminUser({ role: 'admin' })).toBe(false);
    });

    it('returns false for null', () => {
      expect(isSuperAdminUser(null)).toBe(false);
    });
  });

  describe('extractRoleList()', () => {
    it('parses comma-separated string', () => {
      expect(extractRoleList('admin,user')).toEqual(['admin', 'user']);
    });

    it('returns array as-is', () => {
      expect(extractRoleList(['admin', 'user'])).toEqual(['admin', 'user']);
    });

    it('returns empty array for null', () => {
      expect(extractRoleList(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(extractRoleList(undefined)).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      expect(extractRoleList('')).toEqual([]);
    });

    it('trims whitespace', () => {
      expect(extractRoleList(' admin , user ')).toEqual(['admin', 'user']);
    });
  });

  describe('resolvePrimaryRole()', () => {
    it('returns first role from comma-separated', () => {
      expect(resolvePrimaryRole('admin,user')).toBe('admin');
    });

    it('returns fallback when value is null', () => {
      expect(resolvePrimaryRole(null)).toBe('user');
    });

    it('uses custom fallback', () => {
      expect(resolvePrimaryRole(null, 'citizen')).toBe('citizen');
    });

    it('returns first from array', () => {
      expect(resolvePrimaryRole(['moderator', 'user'])).toBe('moderator');
    });
  });

  describe('normalizeRoleKey()', () => {
    it('returns "superadmin" for "superadmin"', () => {
      expect(normalizeRoleKey('superadmin')).toBe('superadmin');
    });

    it('returns "superadmin" for "super-admin"', () => {
      expect(normalizeRoleKey('super-admin')).toBe('superadmin');
    });

    it('returns "admin" for "admin"', () => {
      expect(normalizeRoleKey('admin')).toBe('admin');
    });

    it('returns "member" for "user"', () => {
      expect(normalizeRoleKey('user')).toBe('member');
    });

    it('returns "member" for null', () => {
      expect(normalizeRoleKey(null)).toBe('member');
    });

    it('returns "member" for undefined', () => {
      expect(normalizeRoleKey(undefined)).toBe('member');
    });
  });

  describe('sortRoleKeys()', () => {
    it('sorts by ROLE_PRIORITY (superadmin first)', () => {
      const sorted = sortRoleKeys(['user', 'admin', 'superadmin']);
      expect(sorted[0]).toBe('superadmin');
      expect(sorted[1]).toBe('admin');
      expect(sorted[2]).toBe('user');
    });

    it('deduplicates entries', () => {
      const sorted = sortRoleKeys(['admin', 'admin', 'user']);
      expect(sorted).toHaveLength(2);
    });

    it('puts unknown roles after known roles', () => {
      const sorted = sortRoleKeys(['custom', 'admin']);
      expect(sorted[0]).toBe('admin');
      expect(sorted[1]).toBe('custom');
    });

    it('sorts unknown roles alphabetically', () => {
      const sorted = sortRoleKeys(['zebra', 'alpha']);
      expect(sorted).toEqual(['alpha', 'zebra']);
    });

    it('handles empty iterable', () => {
      expect(sortRoleKeys([])).toEqual([]);
    });
  });

  describe('formatRoleLabel()', () => {
    it('capitalizes simple key', () => {
      expect(formatRoleLabel('admin')).toBe('Admin');
    });

    it('splits hyphenated keys', () => {
      expect(formatRoleLabel('super-admin')).toBe('Super Admin');
    });

    it('splits underscored keys', () => {
      expect(formatRoleLabel('super_admin')).toBe('Super Admin');
    });

    it('returns dash for empty string', () => {
      expect(formatRoleLabel('')).toBe('—');
    });
  });

  describe('getRoleDefinitions()', () => {
    it('returns an array of role definitions', () => {
      const defs = getRoleDefinitions();
      expect(Array.isArray(defs)).toBe(true);
      expect(defs.length).toBeGreaterThan(0);
    });

    it('each definition has the required shape', () => {
      const defs = getRoleDefinitions();
      for (const def of defs) {
        expect(def).toHaveProperty('key');
        expect(def).toHaveProperty('label');
        expect(def).toHaveProperty('description');
        expect(def).toHaveProperty('highlights');
        expect(def).toHaveProperty('tone');
      }
    });

    it('includes additional keys', () => {
      const defs = getRoleDefinitions(['custom-role']);
      const keys = defs.map((d) => d.key);
      expect(keys).toContain('custom-role');
    });
  });

  describe('getPermissionModules()', () => {
    it('returns an array of modules', () => {
      const modules = getPermissionModules();
      expect(Array.isArray(modules)).toBe(true);
    });

    it('each module has key, label, description, actions', () => {
      const modules = getPermissionModules();
      for (const mod of modules) {
        expect(mod).toHaveProperty('key');
        expect(mod).toHaveProperty('label');
        expect(mod).toHaveProperty('description');
        expect(Array.isArray(mod.actions)).toBe(true);
      }
    });
  });
});

describe('admin/permissions — async functions', () => {
  const { listRolePolicies } = vi.mocked(
    await import('@lib/admin/policy-store'),
  );
  const { reloadAdminAccessControl } = vi.mocked(
    await import('@lib/auth/admin-access-control'),
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadRoleDefinitions()', () => {
    it('calls listRolePolicies and returns definitions', async () => {
      listRolePolicies.mockResolvedValue([]);
      const defs = await loadRoleDefinitions();
      expect(listRolePolicies).toHaveBeenCalled();
      expect(Array.isArray(defs)).toBe(true);
    });
  });

  describe('loadPermissionModules()', () => {
    it('returns permission modules from loaded artifacts', async () => {
      const modules = await loadPermissionModules();
      expect(Array.isArray(modules)).toBe(true);
    });
  });

  describe('listRolePolicyDefinitions()', () => {
    it('delegates to listRolePolicies', async () => {
      listRolePolicies.mockResolvedValue([]);
      const result = await listRolePolicyDefinitions();
      expect(listRolePolicies).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getRolePolicy()', () => {
    it('delegates to persisted getRolePolicy', async () => {
      const { getRolePolicy: getPersistedRolePolicy } = vi.mocked(
        await import('@lib/admin/policy-store'),
      );
      getPersistedRolePolicy.mockResolvedValue(null);
      const result = await getRolePolicy('admin');
      expect(getPersistedRolePolicy).toHaveBeenCalledWith('admin');
      expect(result).toBeNull();
    });
  });

  describe('saveRolePolicy()', () => {
    it('upserts, fetches updated, and reloads access control', async () => {
      const { upsertRolePolicy, getRolePolicy: getPersistedRolePolicy } =
        vi.mocked(await import('@lib/admin/policy-store'));
      upsertRolePolicy.mockResolvedValue(undefined);
      getPersistedRolePolicy.mockResolvedValue({
        roleKey: 'editor',
        label: 'Editor',
        description: null,
        tone: 'info',
        highlights: [],
        statement: { user: ['list'] },
        updatedBy: null,
        updatedAt: new Date(),
      });

      const result = await saveRolePolicy({
        roleKey: 'editor',
        statement: { user: ['list'] },
      });

      expect(upsertRolePolicy).toHaveBeenCalled();
      expect(reloadAdminAccessControl).toHaveBeenCalled();
      expect(result?.roleKey).toBe('editor');
    });
  });

  describe('removeRolePolicy()', () => {
    it('deletes and reloads access control', async () => {
      const { deleteRolePolicy } = vi.mocked(
        await import('@lib/admin/policy-store'),
      );
      deleteRolePolicy.mockResolvedValue(undefined);
      await removeRolePolicy('editor');
      expect(deleteRolePolicy).toHaveBeenCalledWith('editor');
      expect(reloadAdminAccessControl).toHaveBeenCalled();
    });
  });

  describe('getPermissionStatementMatrix()', () => {
    it('returns statement matrix from getAdminStatements', async () => {
      const matrix = await getPermissionStatementMatrix();
      expect(matrix).toBeDefined();
    });
  });
});
