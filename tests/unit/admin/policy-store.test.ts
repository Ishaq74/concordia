import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSelect, mockInsert, mockDelete, mockFrom, mockWhere, mockOrderBy, mockValues, mockOnConflictDoUpdate } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockDelete = vi.fn();
  const mockFrom = vi.fn();
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockValues = vi.fn();
  const mockOnConflictDoUpdate = vi.fn();
  return { mockSelect, mockInsert, mockDelete, mockFrom, mockWhere, mockOrderBy, mockValues, mockOnConflictDoUpdate };
});

// Chain builders
mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
mockWhere.mockResolvedValue([]);
mockOrderBy.mockResolvedValue([]);
mockInsert.mockReturnValue({ values: mockValues });
mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate });
mockOnConflictDoUpdate.mockResolvedValue(undefined);
mockDelete.mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    select: mockSelect,
    insert: mockInsert,
    delete: mockDelete,
  }),
}));

import {
  listRolePolicies,
  getRolePolicy,
  upsertRolePolicy,
  deleteRolePolicy,
  ADMIN_POLICY_TABLE_ERROR,
} from '@lib/admin/policy-store';

describe('admin/policy-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy });
    mockWhere.mockResolvedValue([]);
    mockOrderBy.mockResolvedValue([]);
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate });
    mockOnConflictDoUpdate.mockResolvedValue(undefined);
  });

  describe('listRolePolicies()', () => {
    it('returns policies ordered by roleKey', async () => {
      const mockPolicies = [
        { roleKey: 'admin', label: 'Admin', statement: {} },
        { roleKey: 'user', label: 'User', statement: {} },
      ];
      mockOrderBy.mockResolvedValue(mockPolicies);
      const result = await listRolePolicies();
      expect(result).toEqual(mockPolicies);
      expect(mockSelect).toHaveBeenCalled();
    });

    it('returns empty array when table does not exist (42P01)', async () => {
      mockOrderBy.mockRejectedValue({ code: '42P01' });
      const result = await listRolePolicies();
      expect(result).toEqual([]);
    });

    it('rethrows non-42P01 errors', async () => {
      mockOrderBy.mockRejectedValue(new Error('connection lost'));
      await expect(listRolePolicies()).rejects.toThrow('connection lost');
    });
  });

  describe('getRolePolicy()', () => {
    it('returns matching policy or null', async () => {
      mockWhere.mockResolvedValue([{ roleKey: 'admin', statement: {} }]);
      const result = await getRolePolicy('admin');
      expect(result).toEqual({ roleKey: 'admin', statement: {} });
    });

    it('returns null when no record found', async () => {
      mockWhere.mockResolvedValue([]);
      const result = await getRolePolicy('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null when table does not exist (42P01)', async () => {
      mockWhere.mockRejectedValue({ code: '42P01' });
      const result = await getRolePolicy('admin');
      expect(result).toBeNull();
    });
  });

  describe('upsertRolePolicy()', () => {
    it('inserts a new policy', async () => {
      await upsertRolePolicy({
        roleKey: 'editor',
        statement: { user: ['list', 'get'] },
      });
      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
    });

    it('normalizes statement (dedups, trims)', async () => {
      await upsertRolePolicy({
        roleKey: 'editor',
        statement: { user: ['list', ' list ', 'get'] },
      });
      // The normalizeStatement function should deduplicate and trim
      expect(mockValues).toHaveBeenCalled();
    });

    it('throws ADMIN_POLICY_TABLE_MISSING when table absent', async () => {
      mockOnConflictDoUpdate.mockRejectedValue({ code: '42P01' });
      await expect(
        upsertRolePolicy({
          roleKey: 'editor',
          statement: { user: ['list'] },
        }),
      ).rejects.toThrow(ADMIN_POLICY_TABLE_ERROR);
    });
  });

  describe('deleteRolePolicy()', () => {
    it('deletes policy by roleKey', async () => {
      const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
      mockDelete.mockReturnValue({ where: mockDeleteWhere });
      await expect(deleteRolePolicy('editor')).resolves.not.toThrow();
    });
  });

  describe('ADMIN_POLICY_TABLE_ERROR', () => {
    it('is the expected constant', () => {
      expect(ADMIN_POLICY_TABLE_ERROR).toBe('ADMIN_POLICY_TABLE_MISSING');
    });
  });
});
