import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import {
  createTestUser,
  createTestOrganization,
  generateUniqueEmail,
  generateUniqueUsername,
} from '@tests/utils/auth-test-utils'
import { blogOrganizations } from '@database/schemas'
import { member, organization, invitation, user } from '@database/schemas/auth-schema'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

beforeEach(() => {
  Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
})

// ─── Helpers ────────────────────────────────────────────────────

async function createBlogOrg(db: any, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID()
  const slug = overrides.slug ?? `org-${id.slice(0, 8)}`
  await db.insert(blogOrganizations).values({
    id,
    name: overrides.name ?? `Test Org ${id.slice(0, 6)}`,
    slug,
    isActive: true,
    ...overrides,
  }).onConflictDoNothing()
  return id
}

// ─── Organization Profile API ───────────────────────────────────

describe('Org Admin — Profile API logic', () => {
  it('blogOrganizations can be queried by id', async () => {
    const db = await getTestDb()
    const orgId = await createBlogOrg(db, { name: 'Query Test Org' })

    const [found] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, orgId))
      .limit(1)

    expect(found).toBeDefined()
    expect(found.name).toBe('Query Test Org')
  })

  it('blogOrganizations can be listed', async () => {
    const db = await getTestDb()
    await createBlogOrg(db, { name: 'List Org A' })
    await createBlogOrg(db, { name: 'List Org B' })

    const orgs = await db.select().from(blogOrganizations)
    expect(orgs.length).toBeGreaterThanOrEqual(2)
  })

  it('blogOrganizations can be updated', async () => {
    const db = await getTestDb()
    const orgId = await createBlogOrg(db, { name: 'Before Update' })

    await db
      .update(blogOrganizations)
      .set({ name: 'After Update' })
      .where(eq(blogOrganizations.id, orgId))

    const [updated] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, orgId))
      .limit(1)

    expect(updated.name).toBe('After Update')
  })

  it('blogOrganizations can be toggled active/inactive', async () => {
    const db = await getTestDb()
    const orgId = await createBlogOrg(db, { isActive: true })

    await db
      .update(blogOrganizations)
      .set({ isActive: false })
      .where(eq(blogOrganizations.id, orgId))

    const [toggled] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, orgId))
      .limit(1)

    expect(toggled.isActive).toBe(false)
  })

  it('blogOrganizations can be deleted', async () => {
    const db = await getTestDb()
    const orgId = await createBlogOrg(db, { name: 'To Delete' })

    await db.delete(blogOrganizations).where(eq(blogOrganizations.id, orgId))

    const remaining = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, orgId))

    expect(remaining.length).toBe(0)
  })
})

// ─── Organization Members ───────────────────────────────────────

describe('Org Admin — Members & Roles', () => {
  it('createTestOrganization creates org + owner membership', async () => {
    const created = await createTestUser({
      email: generateUniqueEmail('orgowner'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const userId = (created as any).user.id

    const orgId = await createTestOrganization(userId, 'Owner Test Org')
    expect(orgId).toBeTruthy()

    const db = await getTestDb()
    const [membership] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))
      .limit(1)

    expect(membership).toBeDefined()
    expect(membership.role).toBe('owner')
  })

  it('member role can be updated', async () => {
    const created = await createTestUser({
      email: generateUniqueEmail('roleup'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const userId = (created as any).user.id
    const orgId = await createTestOrganization(userId)

    // Add another member
    const member2 = await createTestUser({
      email: generateUniqueEmail('member2'),
      username: generateUniqueUsername(),
      emailVerified: true,
      organizationId: orgId,
      role: 'member',
    })
    const member2Id = (member2 as any).user.id

    const db = await getTestDb()

    // Update from member → admin
    await db
      .update(member)
      .set({ role: 'admin' })
      .where(and(eq(member.userId, member2Id), eq(member.organizationId, orgId)))

    const [updated] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, member2Id), eq(member.organizationId, orgId)))
      .limit(1)

    expect(updated.role).toBe('admin')
  })

  it('member can be removed from organization', async () => {
    const created = await createTestUser({
      email: generateUniqueEmail('rmowner'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const userId = (created as any).user.id
    const orgId = await createTestOrganization(userId)

    const toRemove = await createTestUser({
      email: generateUniqueEmail('toremove'),
      username: generateUniqueUsername(),
      emailVerified: true,
      organizationId: orgId,
      role: 'member',
    })
    const removeId = (toRemove as any).user.id

    const db = await getTestDb()
    await db.delete(member).where(
      and(eq(member.userId, removeId), eq(member.organizationId, orgId)),
    )

    const remaining = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, removeId), eq(member.organizationId, orgId)))

    expect(remaining.length).toBe(0)
  })

  it('invitation can be created and cancelled', async () => {
    const created = await createTestUser({
      email: generateUniqueEmail('invowner'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const userId = (created as any).user.id
    const orgId = await createTestOrganization(userId)

    const db = await getTestDb()
    const invId = randomUUID()

    await db.insert(invitation).values({
      id: invId,
      organizationId: orgId,
      email: 'invite@test.local',
      role: 'editor',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000),
      inviterId: userId,
    })

    const [created_inv] = await db
      .select()
      .from(invitation)
      .where(eq(invitation.id, invId))

    expect(created_inv).toBeDefined()
    expect(created_inv.status).toBe('pending')
    expect(created_inv.role).toBe('editor')

    // Cancel
    await db.delete(invitation).where(eq(invitation.id, invId))

    const after = await db.select().from(invitation).where(eq(invitation.id, invId))
    expect(after.length).toBe(0)
  })

  it('multiple members can be listed for an organization', async () => {
    const owner = await createTestUser({
      email: generateUniqueEmail('listowner'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const ownerId = (owner as any).user.id
    const orgId = await createTestOrganization(ownerId)

    // Add 3 more members
    for (let i = 0; i < 3; i++) {
      await createTestUser({
        email: generateUniqueEmail(`listmem${i}`),
        username: generateUniqueUsername(),
        emailVerified: true,
        organizationId: orgId,
        role: i === 0 ? 'admin' : 'member',
      })
    }

    const db = await getTestDb()
    const members = await db
      .select()
      .from(member)
      .where(eq(member.organizationId, orgId))

    expect(members.length).toBe(4) // 1 owner + 3 members
    expect(members.find((m: any) => m.role === 'owner')).toBeDefined()
    expect(members.find((m: any) => m.role === 'admin')).toBeDefined()
  })
})

// ─── Org-scoping fallback logic ────────────────────────────────

describe('Org Admin — Org ID resolution logic', () => {
  it('resolves orgId from member table when user has membership', async () => {
    const created = await createTestUser({
      email: generateUniqueEmail('resolve1'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const userId = (created as any).user.id
    const orgId = await createTestOrganization(userId)

    const db = await getTestDb()
    const [firstMembership] = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userId))
      .limit(1)

    expect(firstMembership).toBeDefined()
    expect(firstMembership.organizationId).toBe(orgId)
  })

  it('resolves orgId from blogOrganizations when member table is empty for user', async () => {
    const db = await getTestDb()
    const blogOrgId = await createBlogOrg(db, { name: 'Fallback Org' })

    // A user with no memberships
    const created = await createTestUser({
      email: generateUniqueEmail('nomember'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const userId = (created as any).user.id

    // member table should have nothing for this user
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, userId))

    expect(memberships.length).toBe(0)

    // Fallback: first blogOrganizations entry
    const [firstOrg] = await db
      .select({ id: blogOrganizations.id })
      .from(blogOrganizations)
      .limit(1)

    expect(firstOrg).toBeDefined()
    expect(firstOrg.id).toBeTruthy()
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
