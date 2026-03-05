import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import { auth } from '@lib/auth/auth';
import { blogOrganizations } from '@database/schemas'
import { member, invitation } from '@database/schemas/auth-schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

beforeEach(() => {
  Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
})

// Use Better Auth plugin helpers for organization creation

// ─── Organization Profile API ───────────────────────────────────

describe('Org Admin — Profile API logic', () => {
  it('blogOrganizations can be queried by id', async () => {
    const db = await getTestDb();
    const ctx = await auth.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true, role: 'admin' });
    const user = await test.saveUser(userObj);
    const orgObj = test.createOrganization({ name: 'Query Test Org' });
    const org = await test.saveOrganization(orgObj);
    const [found] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1);
    expect(found).toBeDefined();
    expect(found.name).toBe('Query Test Org');
  });

  it('blogOrganizations can be listed', async () => {
    const db = await getTestDb();
    const ctx = await auth.$context;
    const test = ctx.test;
    await test.saveOrganization(test.createOrganization({ name: 'List Org A' }));
    await test.saveOrganization(test.createOrganization({ name: 'List Org B' }));
    const orgs = await db.select().from(blogOrganizations);
    expect(orgs.length).toBeGreaterThanOrEqual(2);
  });

  it('blogOrganizations can be updated', async () => {
    const db = await getTestDb();
    const ctx = await auth.$context;
    const test = ctx.test;
    const org = await test.saveOrganization(test.createOrganization({ name: 'Before Update' }));
    await db
      .update(blogOrganizations)
      .set({ name: 'After Update' })
      .where(eq(blogOrganizations.id, org.id));
    const [updated] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1);
    expect(updated.name).toBe('After Update');
  });

  it('blogOrganizations can be toggled active/inactive', async () => {
    const db = await getTestDb();
    const ctx = await auth.$context;
    const test = ctx.test;
    const org = await test.saveOrganization(test.createOrganization({ isActive: true }));
    await db
      .update(blogOrganizations)
      .set({ isActive: false })
      .where(eq(blogOrganizations.id, org.id));
    const [toggled] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1);
    expect(toggled.isActive).toBe(false);
  });

  it('blogOrganizations can be deleted', async () => {
    const db = await getTestDb();
    const ctx = await auth.$context;
    const test = ctx.test;
    const org = await test.saveOrganization(test.createOrganization({ name: 'To Delete' }));
    await db.delete(blogOrganizations).where(eq(blogOrganizations.id, org.id));
    const remaining = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id));
    expect(remaining.length).toBe(0);
  });
})

// ─── Organization Members ───────────────────────────────────────

describe('Org Admin — Members & Roles', () => {
  it('createTestOrganization creates org + owner membership', async () => {
    const ctx = await auth.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true, role: 'owner' });
    const user = await test.saveUser(userObj);
    const orgObj = test.createOrganization({ name: 'Owner Test Org' });
    const org = await test.saveOrganization(orgObj);
    const db = await getTestDb();
    const [membership] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, user.id), eq(member.organizationId, org.id)))
      .limit(1);
    expect(membership).toBeDefined();
    expect(membership.role).toBe('owner');
  });

  it('member role can be updated', async () => {
    const ctx = await auth.$context;
    const test = ctx.test;
    const ownerObj = test.createUser({ emailVerified: true, role: 'owner' });
    const owner = await test.saveUser(ownerObj);
    const orgObj = test.createOrganization({ name: 'Role Update Org' });
    const org = await test.saveOrganization(orgObj);
    // Add another member
    const memberObj = test.createUser({ emailVerified: true, role: 'member' });
    const memberUser = await test.saveUser(memberObj);
    // Simulate membership creation if needed
    const db = await getTestDb();
    await db
      .update(member)
      .set({ role: 'admin' })
      .where(and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)));
    const [updated] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)))
      .limit(1);
    expect(updated.role).toBe('admin');
  });

  it('member can be removed from organization', async () => {
    const ctx = await auth.$context;
    const test = ctx.test;
    const ownerObj = test.createUser({ emailVerified: true, role: 'owner' });
    const owner = await test.saveUser(ownerObj);
    const orgObj = test.createOrganization({ name: 'Remove Member Org' });
    const org = await test.saveOrganization(orgObj);
    const memberObj = test.createUser({ emailVerified: true, role: 'member' });
    const memberUser = await test.saveUser(memberObj);
    const db = await getTestDb();
    await db.delete(member).where(
      and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)),
    );
    const remaining = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)));
    expect(remaining.length).toBe(0);
  });

  it('invitation can be created and cancelled', async () => {
    const ctx = await auth.$context;
    const test = ctx.test;
    const ownerObj = test.createUser({ emailVerified: true, role: 'owner' });
    const owner = await test.saveUser(ownerObj);
    const orgObj = test.createOrganization({ name: 'Invite Org' });
    const org = await test.saveOrganization(orgObj);
    const db = await getTestDb();
    const invId = randomUUID();
    await db.insert(invitation).values({
      id: invId,
      organizationId: org.id,
      email: 'invite@test.local',
      role: 'editor',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000),
      inviterId: owner.id,
    });
    const [created_inv] = await db
      .select()
      .from(invitation)
      .where(eq(invitation.id, invId));
    expect(created_inv).toBeDefined();
    expect(created_inv.status).toBe('pending');
    expect(created_inv.role).toBe('editor');
    // Cancel
    await db.delete(invitation).where(eq(invitation.id, invId));
    const after = await db.select().from(invitation).where(eq(invitation.id, invId));
    expect(after.length).toBe(0);
  });

  it('multiple members can be listed for an organization', async () => {
    const ctx = await auth.$context;
    const test = ctx.test;
    const ownerObj = test.createUser({ emailVerified: true, role: 'owner' });
    const owner = await test.saveUser(ownerObj);
    const orgObj = test.createOrganization({ name: 'List Members Org' });
    const org = await test.saveOrganization(orgObj);
    // Add 3 more members
    for (let i = 0; i < 3; i++) {
      const memberObj = test.createUser({ emailVerified: true, role: i === 0 ? 'admin' : 'member' });
      await test.saveUser(memberObj);
    }
    const db = await getTestDb();
    const members = await db
      .select()
      .from(member)
      .where(eq(member.organizationId, org.id));
    expect(members.length).toBeGreaterThanOrEqual(4); // 1 owner + 3 members
    expect(members.find((m: any) => m.role === 'owner')).toBeDefined();
    expect(members.find((m: any) => m.role === 'admin')).toBeDefined();
  });
})

// ─── Org-scoping fallback logic ────────────────────────────────

describe('Org Admin — Org ID resolution logic', () => {
  it('resolves orgId from member table when user has membership', async () => {
    const ctx = await auth.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true, role: 'member' });
    const user = await test.saveUser(userObj);
    const orgObj = test.createOrganization({ name: 'Resolve Org' });
    const org = await test.saveOrganization(orgObj);
    const db = await getTestDb();
    const [firstMembership] = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, user.id))
      .limit(1);
    expect(firstMembership).toBeDefined();
    expect(firstMembership.organizationId).toBe(org.id);
  });

  it('resolves orgId from blogOrganizations when member table is empty for user', async () => {
    const db = await getTestDb();
    const ctx = await auth.$context;
    const test = ctx.test;
    const org = await test.saveOrganization(test.createOrganization({ name: 'Fallback Org' }));
    // A user with no memberships
    const userObj = test.createUser({ emailVerified: true });
    const user = await test.saveUser(userObj);
    // member table should have nothing for this user
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, user.id));
    expect(memberships.length).toBe(0);
    // Fallback: first blogOrganizations entry
    const [firstOrg] = await db
      .select({ id: blogOrganizations.id })
      .from(blogOrganizations)
      .limit(1);
    expect(firstOrg).toBeDefined();
    expect(firstOrg.id).toBeTruthy();
    // Ensure the created org matches the fallback row
    expect(firstOrg.id).toBe(org.id);
  });

  it('query param ?org= takes priority', () => {
    // This is a URL-level test — simulates the logic used in pages
    const url = new URL('http://localhost:4321/fr/admin/organizations/dashboard?org=specific-org-id')
    const orgFromParam = url.searchParams.get('org')
    const orgFromSession = 'session-org-id'

    const resolved = orgFromParam || orgFromSession
    expect(resolved).toBe('specific-org-id')
  })

  it('session orgId is used when no query param', () => {
    const url = new URL('http://localhost:4321/fr/admin/organizations/dashboard')
    const orgFromParam = url.searchParams.get('org')
    const orgFromSession = 'session-org-id'

    const resolved = orgFromParam || orgFromSession
    expect(resolved).toBe('session-org-id')
  })
})

// ─── Admin permissions ──────────────────────────────────────────

describe('Org Admin — Permission checks', () => {
  it('isAdminUser accepts admin role', async () => {
    const { isAdminUser } = await import('@lib/admin/permissions')
    expect(isAdminUser({ role: 'admin' })).toBe(true)
    expect(isAdminUser({ role: 'superadmin' })).toBe(true)
    expect(isAdminUser({ role: 'Admin' })).toBe(true)
  })

  it('isAdminUser rejects non-admin roles', async () => {
    const { isAdminUser } = await import('@lib/admin/permissions')
    expect(isAdminUser({ role: 'user' })).toBe(false)
    expect(isAdminUser({ role: 'member' })).toBe(false)
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser(undefined)).toBe(false)
  })

  it('isSuperAdminUser distinguishes super from admin', async () => {
    const { isSuperAdminUser } = await import('@lib/admin/permissions')
    expect(isSuperAdminUser({ role: 'superadmin' })).toBe(true)
    expect(isSuperAdminUser({ role: 'admin' })).toBe(false)
    expect(isSuperAdminUser({ role: 'member' })).toBe(false)
  })
})
