
import { describe, it, expect } from 'vitest';
import { getAuth } from './auth';

// Define RBAC/ABAC enums and helpers for test matrix
enum Role {
  ADMIN = 'admin',
  USER = 'user',
  OWNER = 'owner',
  MEMBER = 'member',
}
enum Permission {
  CREATE_USER = 'create_user',
  DELETE_USER = 'delete_user',
  IMPERSONATE_USER = 'impersonate_user',
  READ_PROFILE = 'read_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',
  ADMIN_ACCESS = 'admin_access',
  UPDATE_RESOURCE = 'update_resource',
  READ_RESOURCE = 'read_resource',
  CHANGE_ROLE = 'change_role',
}
type ABACContext = Record<string, any>;

// Helper to get permission check from auth instance
async function checkPermission(role: Role, permission: Permission, context?: ABACContext) {
  const auth = await getAuth();
  // Use runtime property to bypass type error
  if (typeof (auth as any).checkPermission === 'function') {
    return (auth as any).checkPermission(role, permission, context);
  }
  throw new Error('Permission check not implemented');
}

describe('RBAC/ABAC Security', () => {

  // RBAC Matrix
  const matrix: [Role, Permission, boolean, string?][] = [
    [Role.ADMIN, Permission.CREATE_USER, true],
    [Role.ADMIN, Permission.DELETE_USER, true],
    [Role.ADMIN, Permission.IMPERSONATE_USER, true],
    [Role.USER, Permission.READ_PROFILE, true],
    [Role.USER, Permission.UPDATE_OWN_PROFILE, true],
    [Role.USER, Permission.DELETE_USER, false],
    [Role.USER, Permission.ADMIN_ACCESS, false],
    [Role.OWNER, Permission.ADMIN_ACCESS, false],
  ];

  it.each(matrix)('%s -> %s = %s (%s)', async (role, perm, expected) => {
    await expect(checkPermission(role, perm)).resolves.toBe(expected);
  });

  describe('ABAC - Attribute Based', () => {
    it('owner: ressource own vs other', async () => {
      const ownCtx: ABACContext = { resourceOwnerId: 'u1', userId: 'u1' };
      const otherCtx: ABACContext = { resourceOwnerId: 'u2', userId: 'u1' };
      await expect(checkPermission(Role.OWNER, Permission.UPDATE_RESOURCE, ownCtx)).resolves.toBe(true);
      await expect(checkPermission(Role.OWNER, Permission.UPDATE_RESOURCE, otherCtx)).resolves.toBe(false);
      await expect(checkPermission(Role.OWNER, Permission.READ_RESOURCE, otherCtx)).resolves.toBe(true);
    });
    it('time-based restrictions', async () => {
      const businessHours: ABACContext = { userId: 'u1', hour: 14 };
      const night: ABACContext = { userId: 'u1', hour: 2 };
      await expect(checkPermission(Role.ADMIN, Permission.ADMIN_ACCESS, businessHours)).resolves.toBe(true);
      await expect(checkPermission(Role.ADMIN, Permission.ADMIN_ACCESS, night)).resolves.toBe(false);
    });
    it('IP-based restrictions', async () => {
      const internalIP: ABACContext = { userId: 'u1', ip: '10.0.0.1' };
      const externalIP: ABACContext = { userId: 'u1', ip: '203.0.113.1' };
      await expect(checkPermission(Role.ADMIN, Permission.ADMIN_ACCESS, internalIP)).resolves.toBe(true);
      await expect(checkPermission(Role.ADMIN, Permission.ADMIN_ACCESS, externalIP)).resolves.toBe(false);
    });
  });

  describe('Privilege Escalation Prevention', () => {
    it('user ne peut pas s\'auto-promouvoir', async () => {
      await expect(checkPermission(Role.USER, Permission.CHANGE_ROLE, { targetRole: 'admin' })).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('rôle inexistant = deny', async () => {
      await expect(checkPermission('superadmin' as Role, Permission.READ_PROFILE)).rejects.toThrow();
    });
    it('permission inexistante = deny', async () => {
      await expect(checkPermission(Role.ADMIN, 'nuke_database' as Permission)).rejects.toThrow();
    });
    it('context manquant pour ABAC = deny', async () => {
      await expect(checkPermission(Role.OWNER, Permission.UPDATE_RESOURCE)).rejects.toThrow(/context required/i);
    });
  });
});
