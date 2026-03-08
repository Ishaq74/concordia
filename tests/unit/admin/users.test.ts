import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAdminApi } = vi.hoisted(() => {
  const mockAdminApi = {
    listUsers: vi.fn().mockResolvedValue({ users: [] }),
    createUser: vi.fn().mockResolvedValue({ id: 'new-user' }),
    setRole: vi.fn().mockResolvedValue({ ok: true }),
    banUser: vi.fn().mockResolvedValue({ ok: true }),
    unbanUser: vi.fn().mockResolvedValue({ ok: true }),
    listSessions: vi.fn().mockResolvedValue({ sessions: [] }),
    revokeSessions: vi.fn().mockResolvedValue({ ok: true }),
    setPassword: vi.fn().mockResolvedValue({ ok: true }),
    removeUser: vi.fn().mockResolvedValue({ ok: true }),
    impersonateUser: vi.fn().mockResolvedValue({ ok: true }),
    stopImpersonating: vi.fn().mockResolvedValue({ ok: true }),
  };
  return { mockAdminApi };
});

vi.mock('@lib/auth/auth', () => ({
  getAuth: vi.fn().mockResolvedValue({
    api: mockAdminApi,
  }),
}));

import {
  listUsers,
  createUser,
  setUserRole,
  banUser,
  unbanUser,
  listUserSessions,
  revokeUserSessions,
  setUserPassword,
  removeUser,
  impersonateUser,
  stopImpersonating,
} from '@lib/admin/users';

describe('admin/users', () => {
  const headers = new Headers({ Authorization: 'Bearer test-token' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsers()', () => {
    it('calls api.listUsers with headers and query', async () => {
      await listUsers(headers, { limit: 10 });
      expect(mockAdminApi.listUsers).toHaveBeenCalledWith({
        headers,
        query: { limit: 10 },
      });
    });

    it('defaults to empty query', async () => {
      await listUsers(headers);
      expect(mockAdminApi.listUsers).toHaveBeenCalledWith({
        headers,
        query: {},
      });
    });
  });

  describe('createUser()', () => {
    it('passes email, password, name, role to api', async () => {
      await createUser(headers, {
        email: 'test@mail.com',
        password: 'Secure123!',
        name: 'Test User',
        role: 'admin',
      });
      expect(mockAdminApi.createUser).toHaveBeenCalledWith({
        headers,
        body: expect.objectContaining({
          email: 'test@mail.com',
          password: 'Secure123!',
          name: 'Test User',
          role: 'admin',
        }),
      });
    });

    it('omits name when not provided', async () => {
      await createUser(headers, {
        email: 'a@b.com',
        password: 'pw',
      });
      const call = mockAdminApi.createUser.mock.calls[0][0];
      expect(call.body).not.toHaveProperty('name');
    });

    it('omits role when not provided', async () => {
      await createUser(headers, {
        email: 'a@b.com',
        password: 'pw',
      });
      const call = mockAdminApi.createUser.mock.calls[0][0];
      expect(call.body).not.toHaveProperty('role');
    });
  });

  describe('setUserRole()', () => {
    it('passes userId and role', async () => {
      await setUserRole(headers, { userId: 'u1', role: 'admin' });
      expect(mockAdminApi.setRole).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1', role: 'admin' },
      });
    });
  });

  describe('banUser()', () => {
    it('bans user with reason', async () => {
      await banUser(headers, { userId: 'u1', reason: 'spam' });
      expect(mockAdminApi.banUser).toHaveBeenCalledWith({
        headers,
        body: expect.objectContaining({
          userId: 'u1',
          banReason: 'spam',
        }),
      });
    });

    it('uses default reason when none provided', async () => {
      await banUser(headers, { userId: 'u1' });
      const call = mockAdminApi.banUser.mock.calls[0][0];
      expect(call.body.banReason).toBe('Décision administrative');
    });

    it('computes banExpiresIn from a future date', async () => {
      const future = new Date(Date.now() + 3600_000); // +1h
      await banUser(headers, { userId: 'u1', banExpires: future });
      const call = mockAdminApi.banUser.mock.calls[0][0];
      expect(call.body.banExpiresIn).toBeGreaterThan(0);
    });

    it('omits banExpiresIn for past date', async () => {
      const past = new Date(Date.now() - 3600_000); // -1h
      await banUser(headers, { userId: 'u1', banExpires: past });
      const call = mockAdminApi.banUser.mock.calls[0][0];
      expect(call.body.banExpiresIn).toBeUndefined();
    });

    it('handles invalid date string gracefully', async () => {
      await banUser(headers, { userId: 'u1', banExpires: 'not-a-date' });
      const call = mockAdminApi.banUser.mock.calls[0][0];
      expect(call.body.banExpiresIn).toBeUndefined();
    });
  });

  describe('unbanUser()', () => {
    it('unbans user by ID', async () => {
      await unbanUser(headers, { userId: 'u1' });
      expect(mockAdminApi.unbanUser).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1' },
      });
    });
  });

  describe('listUserSessions()', () => {
    it('lists sessions for a user', async () => {
      await listUserSessions(headers, { userId: 'u1' });
      expect(mockAdminApi.listSessions).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1' },
      });
    });
  });

  describe('revokeUserSessions()', () => {
    it('revokes sessions for a user', async () => {
      await revokeUserSessions(headers, { userId: 'u1' });
      expect(mockAdminApi.revokeSessions).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1' },
      });
    });
  });

  describe('setUserPassword()', () => {
    it('sets password for a user', async () => {
      await setUserPassword(headers, { userId: 'u1', password: 'newP@ss' });
      expect(mockAdminApi.setPassword).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1', password: 'newP@ss' },
      });
    });
  });

  describe('removeUser()', () => {
    it('removes a user by ID', async () => {
      await removeUser(headers, { userId: 'u1' });
      expect(mockAdminApi.removeUser).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1' },
      });
    });
  });

  describe('impersonateUser()', () => {
    it('impersonates a user by ID', async () => {
      await impersonateUser(headers, { userId: 'u1' });
      expect(mockAdminApi.impersonateUser).toHaveBeenCalledWith({
        headers,
        body: { userId: 'u1' },
      });
    });
  });

  describe('stopImpersonating()', () => {
    it('stops impersonation', async () => {
      await stopImpersonating(headers);
      expect(mockAdminApi.stopImpersonating).toHaveBeenCalledWith({
        headers,
        body: {},
      });
    });
  });
});
