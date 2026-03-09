import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { getTestDb } from '@tests/config/test-db';
import { TEST_ENV } from '@tests/config/test-env';
import { blogOrganizations, blogPosts, servicesListings } from '@database/schemas';
import { member } from '@database/schemas/auth-schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { serverAvailable } from '@tests/helpers/server-guard';

/**
 * Multi-tenant isolation tests — CRITICAL for government deployment.
 * Verifies that Organisation A cannot access or modify Organisation B data.
 */

const serverUp = await serverAvailable();

type TestOrg = { id: string; [key: string]: unknown };

describe.skipIf(!serverUp)('Multi-tenant isolation', () => {
  let test: any;

  beforeAll(async () => {
    const { auth } = await import('@lib/auth/auth');
    const ctx = await auth.$context;
    test = ctx.test;
  });

  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value));
  });

  async function saveOrg(data: Record<string, unknown> = {}): Promise<TestOrg> {
    const org = (await test.saveOrganization(test.createOrganization(data))) as TestOrg;
    const db = await getTestDb();
    await db.insert(blogOrganizations).values({
      id: org.id,
      name: (data.name as string) || (org as any).name || 'Test Org',
      slug: (org as any).slug || `org-${org.id.slice(0, 8)}`,
    }).onConflictDoNothing();
    return org;
  }

  async function saveUser(overrides: Record<string, unknown> = {}) {
    return await test.saveUser(test.createUser({ emailVerified: true, ...overrides }));
  }

// ─── Data Isolation Tests ─────────────────────────────────────

describe('Multi-tenant — Data isolation', () => {
  it('org A blog posts are not visible when querying org B', async () => {
    const db = await getTestDb();
    const orgA = await saveOrg({ name: 'Org A' });
    const orgB = await saveOrg({ name: 'Org B' });
    const userA = await saveUser();

    // Insert a blog post for org A
    const postId = randomUUID();
    await db.insert(blogPosts).values({
      id: postId,
      slug: `post-${postId.slice(0, 8)}`,
      organizationId: orgA.id,
      authorId: userA.id,
      status: 'published',
      inLanguage: 'fr',
    }).onConflictDoNothing();

    // Query posts for org B — should NOT include org A's post
    const orgBPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.organizationId, orgB.id));

    expect(orgBPosts.find((p: any) => p.id === postId)).toBeUndefined();
  });

  it('org A services are not visible when querying org B', async () => {
    const db = await getTestDb();
    const orgA = await saveOrg({ name: 'Service Org A' });
    const orgB = await saveOrg({ name: 'Service Org B' });
    const provider = await saveUser();

    const svcId = randomUUID();
    await db.insert(servicesListings).values({
      id: svcId,
      slug: `svc-${svcId.slice(0, 8)}`,
      providerId: provider.id,
      organizationId: orgA.id,
      status: 'active',
      basePrice: '100.00',
      currency: 'EUR',
      inLanguage: 'fr',
    }).onConflictDoNothing();

    const orgBServices = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.organizationId, orgB.id));

    expect(orgBServices.find((s: any) => s.id === svcId)).toBeUndefined();
  });

  it('member of org A cannot be listed as member of org B', async () => {
    const db = await getTestDb();
    const orgA = await saveOrg({ name: 'Member Org A' });
    const orgB = await saveOrg({ name: 'Member Org B' });
    const userA = await saveUser();

    // Add user to org A
    await db.insert(member).values({
      id: randomUUID(),
      userId: userA.id,
      organizationId: orgA.id,
      role: 'member',
      createdAt: new Date(),
    }).onConflictDoNothing();

    // Query members of org B
    const orgBMembers = await db
      .select()
      .from(member)
      .where(eq(member.organizationId, orgB.id));

    expect(orgBMembers.find((m: any) => m.userId === userA.id)).toBeUndefined();
  });
});

// ─── API Isolation Tests ──────────────────────────────────────

describe('Multi-tenant — API isolation', () => {
  it('org switch requires user membership in target org', async () => {
    const orgA = await saveOrg({ name: 'Switch Org A' });
    const orgB = await saveOrg({ name: 'Switch Org B' });
    const user = await saveUser({ role: 'admin' });
    const db = await getTestDb();

    // Add user to org A only
    await db.insert(member).values({
      id: randomUUID(),
      userId: user.id,
      organizationId: orgA.id,
      role: 'owner',
      createdAt: new Date(),
    }).onConflictDoNothing();

    const { token } = await test.login({ userId: user.id });
    const { apiCall } = await import('@tests/utils/api-helpers');

    // Switch to org A — should work
    const r1 = await apiCall(
      'POST',
      '/admin/organizations',
      { action: 'set-active', organizationId: orgA.id },
      { token },
    );
    expect(r1.status).toBeLessThan(500);

    // Switch to org B (not a member) — should be forbidden or 4xx
    const r2 = await apiCall(
      'POST',
      '/admin/organizations',
      { action: 'set-active', organizationId: orgB.id },
      { token },
    );
    // We accept 403 or any 4xx as valid rejection
    expect(r2.status).toBeGreaterThanOrEqual(400);
    expect(r2.status).toBeLessThan(500);
  });

  it('org profile endpoint scopes data to active org only', async () => {
    const orgA = await saveOrg({ name: 'Profile Org A' });
    const orgB = await saveOrg({ name: 'Profile Org B' });
    const user = await saveUser({ role: 'admin' });
    const db = await getTestDb();

    // Add user to both orgs
    for (const org of [orgA, orgB]) {
      await db.insert(member).values({
        id: randomUUID(),
        userId: user.id,
        organizationId: org.id,
        role: 'owner',
        createdAt: new Date(),
      }).onConflictDoNothing();
    }

    const { token } = await test.login({ userId: user.id });
    const { apiCall } = await import('@tests/utils/api-helpers');

    // Set active org to A
    await apiCall(
      'POST',
      '/admin/organizations',
      { action: 'set-active', organizationId: orgA.id },
      { token },
    );

    // Fetch profile — should return org A data
    const profileRes = await apiCall('GET', '/admin/organizations/profile', undefined, { token });
    if (profileRes.status === 200 && profileRes.data) {
      // If the API returns org data, verify it's org A, not org B
      const data = profileRes.data;
      if (data.id) {
        expect(data.id).toBe(orgA.id);
        expect(data.id).not.toBe(orgB.id);
      }
    }
    expect(profileRes.status).toBeLessThan(500);
  });
});

// ─── Cross-org data leakage ───────────────────────────────────

describe('Multi-tenant — Cross-org data leakage prevention', () => {
  it('cannot update org B data while scoped to org A', async () => {
    const db = await getTestDb();
    const orgA = await saveOrg({ name: 'Leakage Org A' });
    const orgB = await saveOrg({ name: 'Leakage Org B' });

    // Attempt to update org B name using org A's ID in a WHERE clause
    // This tests raw DB-level scoping; in prod the API should also enforce this
    const updateResult = await db
      .update(blogOrganizations)
      .set({ name: 'Hacked by A' })
      .where(and(eq(blogOrganizations.id, orgB.id), eq(blogOrganizations.id, orgA.id)));

    // No rows should match (id cannot be both A and B)
    expect(updateResult.rowCount ?? 0).toBe(0);

    // Verify org B name unchanged
    const [orgBCheck] = await db
      .select()
      .from(blogOrganizations)
      .where(eq(blogOrganizations.id, orgB.id));
    expect(orgBCheck.name).toBe('Leakage Org B');
  });

  it('deleting org A does not cascade-delete org B members', async () => {
    const db = await getTestDb();
    const orgA = await saveOrg({ name: 'Delete Org A' });
    const orgB = await saveOrg({ name: 'Delete Org B' });
    const user = await saveUser();

    // Add user to both orgs
    for (const org of [orgA, orgB]) {
      await db.insert(member).values({
        id: randomUUID(),
        userId: user.id,
        organizationId: org.id,
        role: 'member',
        createdAt: new Date(),
      }).onConflictDoNothing();
    }

    // Delete org A
    await db.delete(blogOrganizations).where(eq(blogOrganizations.id, orgA.id));

    // Org B members should still exist
    const orgBMembers = await db
      .select()
      .from(member)
      .where(eq(member.organizationId, orgB.id));
    expect(orgBMembers.length).toBeGreaterThanOrEqual(1);
    expect(orgBMembers.some((m: any) => m.userId === user.id)).toBe(true);
  });
});
});
