import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import { blogOrganizations } from '@database/schemas'
import { member, invitation } from '@database/schemas/auth-schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import type { TestHelpers } from 'better-auth/plugins'

/** Typed result from test.saveOrganization() */
type TestOrg = { id: string; [key: string]: unknown }

describe('Org Admin tests', () => {
  let test: TestHelpers

  beforeAll(async () => {
    const { auth } = await import('@lib/auth/auth')
    const ctx = await auth.$context
    test = ctx.test
  })

  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  async function saveOrg(data: Record<string, unknown> = {}): Promise<TestOrg> {
    const org = await test.saveOrganization(test.createOrganization(data)) as TestOrg
    // Also insert into blogOrganizations so tests querying that table find entries
    const db = await getTestDb()
    const blogOrgValues: Record<string, unknown> = {
      id: org.id,
      name: (data.name as string) || (org as any).name || 'Test Org',
      slug: (org as any).slug || `org-${org.id.slice(0, 8)}`,
    }
    if ('isActive' in data) blogOrgValues.isActive = Boolean(data.isActive)
    await db.insert(blogOrganizations).values(blogOrgValues as any).onConflictDoNothing()
    return org
  }

  async function saveUser(overrides: Record<string, unknown> = {}) {
    return await test.saveUser(test.createUser({ emailVerified: true, ...overrides }))
  }

  async function addMembership(userId: string, orgId: string, role: string = 'member') {
    const db = await getTestDb()
    await db.insert(member).values({
      id: randomUUID(),
      userId,
      organizationId: orgId,
      role,
      createdAt: new Date(),
    }).onConflictDoNothing()
  }

// ─── Organization Profile API ───────────────────────────────────

describe('Org Admin — Profile API logic', () => {
  it('blogOrganizations can be queried by id', async () => {
    const db = await getTestDb()
    await saveUser({ role: 'admin' })
    const org = await saveOrg({ name: 'Query Test Org' })
    const [found] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1)
    expect(found).toBeDefined()
    expect(found.name).toBe('Query Test Org')
  })

  it('blogOrganizations can be listed', async () => {
    const db = await getTestDb()
    await saveOrg({ name: 'List Org A' })
    await saveOrg({ name: 'List Org B' })
    const orgs = await db.select().from(blogOrganizations)
    expect(orgs.length).toBeGreaterThanOrEqual(2)
  })

  it('blogOrganizations can be updated', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Before Update' })
    await db
      .update(blogOrganizations)
      .set({ name: 'After Update' })
      .where(eq(blogOrganizations.id, org.id))
    const [updated] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1)
    expect(updated.name).toBe('After Update')
  })

  it('blogOrganizations can be toggled active/inactive', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ isActive: true })
    await db
      .update(blogOrganizations)
      .set({ isActive: false })
      .where(eq(blogOrganizations.id, org.id))
    const [toggled] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1)
    expect(toggled.isActive).toBe(false)
  })

  it('blogOrganizations can be deleted', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'To Delete' })
    await db.delete(blogOrganizations).where(eq(blogOrganizations.id, org.id))
    const remaining = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
    expect(remaining.length).toBe(0)
  })
})

// ─── Organization Members ───────────────────────────────────────

describe('Org Admin — Members & Roles', () => {
  it('org + owner membership can be created and queried', async () => {
    const db = await getTestDb()
    const user = await saveUser({ role: 'owner' })
    const org = await saveOrg({ name: 'Owner Test Org' })
    await addMembership(user.id, org.id, 'owner')
    const [membership] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, user.id), eq(member.organizationId, org.id)))
      .limit(1)
    expect(membership).toBeDefined()
    expect(membership.role).toBe('owner')
  })

  it('member role can be updated', async () => {
    const db = await getTestDb()
    const owner = await saveUser({ role: 'owner' })
    const org = await saveOrg({ name: 'Role Update Org' })
    await addMembership(owner.id, org.id, 'owner')
    const memberUser = await saveUser({ role: 'member' })
    await addMembership(memberUser.id, org.id, 'member')
    await db
      .update(member)
      .set({ role: 'admin' })
      .where(and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)))
    const [updated] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)))
      .limit(1)
    expect(updated.role).toBe('admin')
  })

  it('member can be removed from organization', async () => {
    const db = await getTestDb()
    const owner = await saveUser({ role: 'owner' })
    const org = await saveOrg({ name: 'Remove Member Org' })
    await addMembership(owner.id, org.id, 'owner')
    const memberUser = await saveUser({ role: 'member' })
    await addMembership(memberUser.id, org.id, 'member')
    await db.delete(member).where(
      and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)),
    )
    const remaining = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, memberUser.id), eq(member.organizationId, org.id)))
    expect(remaining.length).toBe(0)
  })

  it('invitation can be created and cancelled', async () => {
    const db = await getTestDb()
    const owner = await saveUser({ role: 'owner' })
    const org = await saveOrg({ name: 'Invite Org' })
    const invId = randomUUID()
    await db.insert(invitation).values({
      id: invId,
      organizationId: org.id,
      email: 'invite@test.local',
      role: 'editor',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000),
      inviterId: owner.id,
    })
    const [created_inv] = await db
      .select()
      .from(invitation)
      .where(eq(invitation.id, invId))
    expect(created_inv).toBeDefined()
    expect(created_inv.status).toBe('pending')
    expect(created_inv.role).toBe('editor')
    await db.delete(invitation).where(eq(invitation.id, invId))
    const after = await db.select().from(invitation).where(eq(invitation.id, invId))
    expect(after.length).toBe(0)
  })

  it('multiple members can be listed for an organization', async () => {
    const db = await getTestDb()
    const owner = await saveUser({ role: 'owner' })
    const org = await saveOrg({ name: 'List Members Org' })
    await addMembership(owner.id, org.id, 'owner')
    const roles = ['admin', 'member', 'member']
    for (const role of roles) {
      const u = await saveUser({ role })
      await addMembership(u.id, org.id, role)
    }
    const members = await db
      .select()
      .from(member)
      .where(eq(member.organizationId, org.id))
    expect(members.length).toBeGreaterThanOrEqual(4)
    expect(members.find((m: any) => m.role === 'owner')).toBeDefined()
    expect(members.find((m: any) => m.role === 'admin')).toBeDefined()
  })
})

// ─── Org-scoping fallback logic ────────────────────────────────

describe('Org Admin — Org ID resolution logic', () => {
  it('resolves orgId from member table when user has membership', async () => {
    const db = await getTestDb()
    const user = await saveUser({ role: 'member' })
    const org = await saveOrg({ name: 'Resolve Org' })
    await addMembership(user.id, org.id, 'member')
    const [firstMembership] = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, user.id))
      .limit(1)
    expect(firstMembership).toBeDefined()
    expect(firstMembership.organizationId).toBe(org.id)
  })

  it('resolves orgId from blogOrganizations when member table is empty for user', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Fallback Org' })
    const user = await saveUser()
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, user.id))
    expect(memberships.length).toBe(0)
    // Query the specific org we just created
    const [foundOrg] = await db
      .select({ id: blogOrganizations.id })
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, org.id))
      .limit(1)
    expect(foundOrg).toBeDefined()
    expect(foundOrg.id).toBe(org.id)
  })

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
});
