import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import { auth } from '@lib/auth/auth'
import {
  servicesListings,
  servicesCategories,
  servicesBookings,
  servicesMedia,
} from '@database/schemas'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

/** Typed result from test.saveOrganization() */
type TestOrg = { id: string; [key: string]: unknown }

let test: Awaited<typeof auth.$context>['test']

beforeAll(async () => {
  const ctx = await auth.$context
  test = ctx.test
})

beforeEach(() => {
  Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
})

async function saveOrg(data: Record<string, unknown> = {}): Promise<TestOrg> {
  return await test.saveOrganization(test.createOrganization(data)) as TestOrg
}

async function saveUser(overrides: Record<string, unknown> = {}) {
  return await test.saveUser(test.createUser({ emailVerified: true, ...overrides }))
}

// ─── Helpers ────────────────────────────────────────────────────

async function createCategory(db: any, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID()
  await db.insert(servicesCategories).values({
    id,
    slug: overrides.slug ?? `cat-${id.slice(0, 8)}`,
    name: overrides.name ?? JSON.stringify({ fr: 'Catégorie Test', en: 'Test Category' }),
    isActive: true,
    ...overrides,
  }).onConflictDoNothing()
  return id
}

async function createService(db: any, providerId: string, orgId: string, catId?: string, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID()
  await db.insert(servicesListings).values({
    id,
    slug: overrides.slug ?? `svc-${id.slice(0, 8)}`,
    providerId,
    organizationId: orgId,
    categoryId: catId ?? null,
    status: 'active',
    basePrice: '50.00',
    currency: 'EUR',
    inLanguage: 'fr',
    ...overrides,
  }).onConflictDoNothing()
  return id
}

async function createBooking(db: any, serviceId: string, customerId: string, providerId: string, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID()
  await db.insert(servicesBookings).values({
    id,
    serviceId,
    customerId,
    providerId,
    bookingDate: '2026-04-15',
    bookingTime: '14:00',
    durationMinutes: 60,
    status: 'pending',
    ...overrides,
  }).onConflictDoNothing()
  return id
}

// ─── Service Listings ───────────────────────────────────────

describe('Services — Listings CRUD', () => {
  it('service listing can be created with org', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Test Org' })
    const user = await saveUser()
    const providerId = user.id
    const svcId = await createService(db, providerId, org.id);
    const [found] = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.id, svcId))
      .limit(1);
    expect(found).toBeDefined();
    expect(found.organizationId).toBe(org.id);
    expect(found.providerId).toBe(providerId);
    expect(found.status).toBe('active');
  });

  it('service listing can be filtered by org', async () => {
    const db = await getTestDb()
    const orgA = await saveOrg({ name: 'Org A' })
    const orgB = await saveOrg({ name: 'Org B' })
    const provider = await saveUser()
    const provId = provider.id
    await createService(db, provId, orgA.id);
    await createService(db, provId, orgA.id);
    await createService(db, provId, orgB.id);
    const orgAServices = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.organizationId, orgA.id));
    const orgBServices = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.organizationId, orgB.id));
    expect(orgAServices.length).toBe(2);
    expect(orgBServices.length).toBe(1);
  });

  it('service listing can be updated', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Update Org' })
    const provider = await saveUser()
    const svcId = await createService(db, provider.id, org.id, undefined, {
      basePrice: '25.00',
    });
    await db
      .update(servicesListings)
      .set({ basePrice: '75.00', status: 'inactive' })
      .where(eq(servicesListings.id, svcId));
    const [updated] = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.id, svcId));
    expect(updated.basePrice).toBe('75.00');
    expect(updated.status).toBe('inactive');
  });

  it('service listing can be deleted', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Delete Org' })
    const provider = await saveUser()
    const svcId = await createService(db, provider.id, org.id);
    await db.delete(servicesListings).where(eq(servicesListings.id, svcId));

    const remaining = await db.select().from(servicesListings).where(eq(servicesListings.id, svcId))
    expect(remaining.length).toBe(0)
  })
})

// ─── Categories ──────────────────────────────────────────────

describe('Services — Categories CRUD', () => {
  it('category can be created', async () => {
    const db = await getTestDb()
    const catId = await createCategory(db, { name: JSON.stringify({ fr: 'Sport', en: 'Sport' }) })

    const [found] = await db
      .select()
      .from(servicesCategories)
      .where(eq(servicesCategories.id, catId))

    expect(found).toBeDefined()
    expect(found.isActive).toBe(true)
  })

  it('category can be updated', async () => {
    const db = await getTestDb()
    const catId = await createCategory(db)

    await db
      .update(servicesCategories)
      .set({ icon: 'mdi:star', isFeatured: true })
      .where(eq(servicesCategories.id, catId))

    const [updated] = await db
      .select()
      .from(servicesCategories)
      .where(eq(servicesCategories.id, catId))

    expect(updated.icon).toBe('mdi:star')
    expect(updated.isFeatured).toBe(true)
  })
})

// ─── Bookings ─────────────────────────────────────────────────

describe('Services — Bookings CRUD', () => {
  it('booking can be created', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Booking Org' })
    const provider = await saveUser()
    const customer = await saveUser()
    const provId = provider.id
    const custId = customer.id
    const svcId = await createService(db, provId, org.id);
    const bkId = await createBooking(db, svcId, custId, provId);
    const [found] = await db
      .select()
      .from(servicesBookings)
      .where(eq(servicesBookings.id, bkId));
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');
    expect(found.customerId).toBe(custId);
    expect(found.providerId).toBe(provId);
  });

  it('booking status can be updated (confirm → completed)', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Booking Status Org' })
    const provider = await saveUser()
    const customer = await saveUser()
    const svcId = await createService(db, provider.id, org.id);
    const bkId = await createBooking(db, svcId, customer.id, provider.id);
    // Confirm
    await db
      .update(servicesBookings)
      .set({ status: 'confirmed' })
      .where(eq(servicesBookings.id, bkId));
    let [booking] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId));
    expect(booking.status).toBe('confirmed');
    // Complete
    await db
      .update(servicesBookings)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(servicesBookings.id, bkId));
    [booking] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId));
    expect(booking.status).toBe('completed');
    expect(booking.completedAt).toBeDefined();
  });

  it('booking provider response can be set', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Provider Response Org' })
    const provider = await saveUser()
    const customer = await saveUser()
    const svcId = await createService(db, provider.id, org.id);
    const bkId = await createBooking(db, svcId, customer.id, provider.id, {
      customerMessage: 'Bonjour, je voudrais réserver',
    });
    await db
      .update(servicesBookings)
      .set({ providerResponse: 'Bien sûr, confirmé !' })
      .where(eq(servicesBookings.id, bkId));
    const [found] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId));
    expect(found.providerResponse).toBe('Bien sûr, confirmé !');
    expect(found.customerMessage).toBe('Bonjour, je voudrais réserver');
  });

  it('booking can be cancelled', async () => {
    const db = await getTestDb()
    const org = await saveOrg({ name: 'Cancel Booking Org' })
    const provider = await saveUser()
    const customer = await saveUser()
    const svcId = await createService(db, provider.id, org.id);
    const bkId = await createBooking(db, svcId, customer.id, provider.id);
    await db
      .update(servicesBookings)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(eq(servicesBookings.id, bkId));
    const [found] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId));
    expect(found.status).toBe('cancelled');
    expect(found.cancelledAt).toBeDefined();
  });
})

// ─── Media ───────────────────────────────────────────────────

describe('Services — Media CRUD', () => {
  it('media record can be created', async () => {
    const db = await getTestDb()
    const mediaId = randomUUID()

    await db.insert(servicesMedia).values({
      id: mediaId,
      url: '/uploads/services/test-image.webp',
      type: 'image',
      encodingFormat: 'image/webp',
      width: '800',
      height: '600',
    }).onConflictDoNothing()

    const [found] = await db
      .select()
      .from(servicesMedia)
      .where(eq(servicesMedia.id, mediaId))

    expect(found).toBeDefined()
    expect(found.url).toBe('/uploads/services/test-image.webp')
    expect(found.type).toBe('image')
  })
})

// ─── Org scoping — services isolation ──────────────────────────

describe('Services — Org scoping isolation', () => {
  it('services from different orgs are properly isolated', async () => {
    const db = await getTestDb()
    const orgA = await saveOrg({ name: 'Isolated A' })
    const orgB = await saveOrg({ name: 'Isolated B' })
    const provider = await saveUser()
    const provId = provider.id
    const svcA1 = await createService(db, provId, orgA.id);
    await createService(db, provId, orgA.id);
    const svcB1 = await createService(db, provId, orgB.id);
    const allA = await db.select().from(servicesListings).where(eq(servicesListings.organizationId, orgA.id));
    const allB = await db.select().from(servicesListings).where(eq(servicesListings.organizationId, orgB.id));
    expect(allA.length).toBe(2);
    expect(allB.length).toBe(1);
    expect(allA.map((s: any) => s.id)).not.toContain(svcB1);
    expect(allB.map((s: any) => s.id)).not.toContain(svcA1);
  });
})
