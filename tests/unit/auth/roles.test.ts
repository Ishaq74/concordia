import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSelectReturn, mockUpdateReturn, mockUpdateSetReturn: _mockUpdateSetReturn } = vi.hoisted(() => {
  const mockSelectReturn = vi.fn();
  const mockUpdateReturn = vi.fn();
  const mockUpdateSetReturn = vi.fn();
  return { mockSelectReturn, mockUpdateReturn, mockUpdateSetReturn };
});

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: mockSelectReturn,
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: mockUpdateReturn,
      }),
    }),
  }),
}));

vi.mock('@database/schemas', () => ({
  user: {
    id: 'user.id',
    role: 'user.role',
  },
}));

import {
  getUserRoles,
  userHasRole,
  assignRole,
  removeRole,
} from '@lib/auth/roles';

describe('auth/roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectReturn.mockResolvedValue([]);
    mockUpdateReturn.mockResolvedValue(undefined);
  });

  describe('getUserRoles()', () => {
    it('returns ["citizen"] when no user row found', async () => {
      mockSelectReturn.mockResolvedValue([]);
      const roles = await getUserRoles('unknown-user');
      expect(roles).toEqual(['citizen']);
    });

    it('returns ["citizen"] when role is null', async () => {
      mockSelectReturn.mockResolvedValue([{ role: null }]);
      const roles = await getUserRoles('u1');
      expect(roles).toEqual(['citizen']);
    });

    it('returns role from DB', async () => {
      mockSelectReturn.mockResolvedValue([{ role: 'admin' }]);
      const roles = await getUserRoles('u1');
      expect(roles).toEqual(['admin']);
    });
  });

  describe('userHasRole()', () => {
    it('returns true when user has the role', async () => {
      mockSelectReturn.mockResolvedValue([{ role: 'admin' }]);
      const result = await userHasRole('u1', 'admin' as any);
      expect(result).toBe(true);
    });

    it('returns false when user does not have the role', async () => {
      mockSelectReturn.mockResolvedValue([{ role: 'user' }]);
      const result = await userHasRole('u1', 'admin' as any);
      expect(result).toBe(false);
    });
  });

  describe('assignRole()', () => {
    it('updates user role in DB', async () => {
      await expect(assignRole('u1', 'admin' as any)).resolves.not.toThrow();
    });
  });

  describe('removeRole()', () => {
    it('throws when attempting to remove "citizen"', async () => {
      await expect(removeRole('u1', 'citizen' as any)).rejects.toThrow(
        'Cannot remove the citizen role',
      );
    });

    it('clears role if matches current value', async () => {
      mockSelectReturn.mockResolvedValue([{ role: 'admin' }]);
      await expect(removeRole('u1', 'admin' as any)).resolves.not.toThrow();
    });

    it('does nothing if current role differs', async () => {
      mockSelectReturn.mockResolvedValue([{ role: 'user' }]);
      await expect(removeRole('u1', 'admin' as any)).resolves.not.toThrow();
    });
  });
});
