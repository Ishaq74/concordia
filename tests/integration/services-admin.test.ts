import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getTestDb } from '@tests/config/test-db'
import { TEST_ENV } from '@tests/config/test-env'
import {
  createTestUser,
  generateUniqueEmail,
  generateUniqueUsername,
} from '@tests/utils/auth-test-utils'
import {
  servicesListings,
  servicesCategories,
  servicesBookings,
  servicesMedia,
  servicesTranslations,
} from '@database/schemas'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

beforeEach(() => {
  Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
})

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

async function createService(db: any, providerId: string, catId?: string, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID()
  await db.insert(servicesListings).values({
    id,
    slug: overrides.slug ?? `svc-${id.slice(0, 8)}`,
    providerId,
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
  it('service listing can be created with direct provider ownership', async () => {
    const db = await getTestDb()
    const user = await createTestUser({
      email: generateUniqueEmail('svcprov1'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const providerId = (user as any).user.id
    const svcId = await createService(db, providerId)

    const [found] = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.id, svcId))
      .limit(1)

    expect(found).toBeDefined()
    expect(found.providerId).toBe(providerId)
    expect(found.status).toBe('active')
  })

  it('service listings can be filtered by provider', async () => {
    const db = await getTestDb()
    const providerA = await createTestUser({
      email: generateUniqueEmail('svcfiltera'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const providerB = await createTestUser({
      email: generateUniqueEmail('svcfilterb'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const providerAId = (providerA as any).user.id
    const providerBId = (providerB as any).user.id

    await createService(db, providerAId)
    await createService(db, providerAId)
    await createService(db, providerBId)

    const providerAServices = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.providerId, providerAId))

    const providerBServices = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.providerId, providerBId))

    expect(providerAServices.length).toBe(2)
    expect(providerBServices.length).toBe(1)
  })

  it('service listing can be updated', async () => {
    const db = await getTestDb()
    const provider = await createTestUser({
      email: generateUniqueEmail('svcup'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const svcId = await createService(db, (provider as any).user.id, undefined, {
      basePrice: '25.00',
    })

    await db
      .update(servicesListings)
      .set({ basePrice: '75.00', status: 'inactive' })
      .where(eq(servicesListings.id, svcId))

    const [updated] = await db
      .select()
      .from(servicesListings)
      .where(eq(servicesListings.id, svcId))

    expect(updated.basePrice).toBe('75.00')
    expect(updated.status).toBe('inactive')
  })

  it('service listing can be deleted', async () => {
    const db = await getTestDb()
    const provider = await createTestUser({
      email: generateUniqueEmail('svcdel'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const svcId = await createService(db, (provider as any).user.id)

    await db.delete(servicesListings).where(eq(servicesListings.id, svcId))

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
    const provider = await createTestUser({
      email: generateUniqueEmail('bkprov'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const customer = await createTestUser({
      email: generateUniqueEmail('bkcust'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const provId = (provider as any).user.id
    const custId = (customer as any).user.id
    const svcId = await createService(db, provId)
    const bkId = await createBooking(db, svcId, custId, provId)

    const [found] = await db
      .select()
      .from(servicesBookings)
      .where(eq(servicesBookings.id, bkId))

    expect(found).toBeDefined()
    expect(found.status).toBe('pending')
    expect(found.customerId).toBe(custId)
    expect(found.providerId).toBe(provId)
  })

  it('booking status can be updated (confirm → completed)', async () => {
    const db = await getTestDb()
    const provider = await createTestUser({
      email: generateUniqueEmail('bkconf'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const customer = await createTestUser({
      email: generateUniqueEmail('bkcconf'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const svcId = await createService(db, (provider as any).user.id)
    const bkId = await createBooking(db, svcId, (customer as any).user.id, (provider as any).user.id)

    // Confirm
    await db
      .update(servicesBookings)
      .set({ status: 'confirmed' })
      .where(eq(servicesBookings.id, bkId))

    let [booking] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId))
    expect(booking.status).toBe('confirmed')

    // Complete
    await db
      .update(servicesBookings)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(servicesBookings.id, bkId))

    ;[booking] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId))
    expect(booking.status).toBe('completed')
    expect(booking.completedAt).toBeDefined()
  })

  it('booking provider response can be set', async () => {
    const db = await getTestDb()
    const provider = await createTestUser({
      email: generateUniqueEmail('bkresp'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const customer = await createTestUser({
      email: generateUniqueEmail('bkcresp'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const svcId = await createService(db, (provider as any).user.id)
    const bkId = await createBooking(db, svcId, (customer as any).user.id, (provider as any).user.id, {
      customerMessage: 'Bonjour, je voudrais réserver',
    })

    await db
      .update(servicesBookings)
      .set({ providerResponse: 'Bien sûr, confirmé !' })
      .where(eq(servicesBookings.id, bkId))

    const [found] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId))
    expect(found.providerResponse).toBe('Bien sûr, confirmé !')
    expect(found.customerMessage).toBe('Bonjour, je voudrais réserver')
  })

  it('booking can be cancelled', async () => {
    const db = await getTestDb()
    const provider = await createTestUser({
      email: generateUniqueEmail('bkcan'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const customer = await createTestUser({
      email: generateUniqueEmail('bkccan'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const svcId = await createService(db, (provider as any).user.id)
    const bkId = await createBooking(db, svcId, (customer as any).user.id, (provider as any).user.id)

    await db
      .update(servicesBookings)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(eq(servicesBookings.id, bkId))

    const [found] = await db.select().from(servicesBookings).where(eq(servicesBookings.id, bkId))
    expect(found.status).toBe('cancelled')
    expect(found.cancelledAt).toBeDefined()
  })
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

// ─── Provider ownership isolation ──────────────────────────────

describe('Services — Provider ownership isolation', () => {
  it('services from different providers are properly isolated', async () => {
    const db = await getTestDb()
    const providerA = await createTestUser({
      email: generateUniqueEmail('isoprova'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const providerB = await createTestUser({
      email: generateUniqueEmail('isoprovb'),
      username: generateUniqueUsername(),
      emailVerified: true,
    })
    const providerAId = (providerA as any).user.id
    const providerBId = (providerB as any).user.id

    const svcA1 = await createService(db, providerAId)
    await createService(db, providerAId)
    const svcB1 = await createService(db, providerBId)

    const allA = await db.select().from(servicesListings).where(eq(servicesListings.providerId, providerAId))
    const allB = await db.select().from(servicesListings).where(eq(servicesListings.providerId, providerBId))

    expect(allA.length).toBe(2)
    expect(allB.length).toBe(1)
    expect(allA.map((s: any) => s.id)).not.toContain(svcB1)
    expect(allB.map((s: any) => s.id)).not.toContain(svcA1)
  })
})
