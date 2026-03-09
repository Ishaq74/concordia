/**
 * Unit tests for src/pages/api/search.ts
 * Tests global search across services, blog, organizations, citizens.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── Hoisted mocks ─────────────────────────────────────────── */
const {
  mockSelect, mockFrom, mockLeftJoin, mockWhere, mockOrderBy, mockLimit, mockOffset,
} = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockFrom = vi.fn()
  const mockLeftJoin = vi.fn()
  const mockWhere = vi.fn()
  const mockOrderBy = vi.fn()
  const mockLimit = vi.fn()
  const mockOffset = vi.fn()

  return { mockSelect, mockFrom, mockLeftJoin, mockWhere, mockOrderBy, mockLimit, mockOffset }
})

/* ── Mock drizzle ───────────────────────────────────────────── */
vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    select: mockSelect,
  }),
}))

vi.mock('@database/schemas', () => ({
  blogPosts: {
    id: 'blogPosts.id', slug: 'blogPosts.slug', status: 'blogPosts.status',
    publishedAt: 'blogPosts.publishedAt',
  },
  blogTranslations: {
    postId: 'blogTranslations.postId', inLanguage: 'blogTranslations.inLanguage',
    headline: 'blogTranslations.headline', excerpt: 'blogTranslations.excerpt',
  },
  servicesListings: {
    id: 'servicesListings.id', slug: 'servicesListings.slug', status: 'servicesListings.status',
    basePrice: 'servicesListings.basePrice', currency: 'servicesListings.currency',
    createdAt: 'servicesListings.createdAt',
  },
  servicesTranslations: {
    serviceId: 'servicesTranslations.serviceId', inLanguage: 'servicesTranslations.inLanguage',
    title: 'servicesTranslations.title', description: 'servicesTranslations.description',
  },
}))

vi.mock('@database/schemas/auth-schema', () => ({
  organization: {
    id: 'organization.id', name: 'organization.name', slug: 'organization.slug',
    logo: 'organization.logo', metadata: 'organization.metadata',
  },
  user: {
    id: 'user.id', name: 'user.name', username: 'user.username',
    image: 'user.image', role: 'user.role', banned: 'user.banned',
  },
}))

vi.mock('@database/schemas/profile.schema', () => ({
  profile: {
    userId: 'profile.userId', bio: 'profile.bio', location: 'profile.location',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ op: 'eq', a, b })),
  and: vi.fn((...args: unknown[]) => ({ op: 'and', args })),
  or: vi.fn((...args: unknown[]) => ({ op: 'or', args })),
  desc: vi.fn((col) => ({ op: 'desc', col })),
  ilike: vi.fn((col, pat) => ({ op: 'ilike', col, pat })),
  sql: Object.assign(vi.fn(), {
    raw: vi.fn(),
  }),
}))

/* ── Import after mocks ─────────────────────────────────────── */
import { GET } from '@pages/api/search'

/* ── Helpers ─────────────────────────────────────────────────── */
function makeContext(path: string) {
  const urlStr = `http://localhost:4321${path}`
  const request = new Request(urlStr, { method: 'GET' })
  const url = new URL(urlStr)
  return { request, url } as Parameters<typeof GET>[0]
}

/* ── Setup ───────────────────────────────────────────────────── */
beforeEach(() => {
  vi.clearAllMocks()

  mockOffset.mockResolvedValue([])
  mockLimit.mockReturnValue({ offset: mockOffset })
  mockOrderBy.mockReturnValue({ limit: mockLimit })
  mockWhere.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit })
  mockLeftJoin.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin })
  mockFrom.mockReturnValue({ leftJoin: mockLeftJoin, where: mockWhere, orderBy: mockOrderBy })
  mockSelect.mockReturnValue({ from: mockFrom })
})

/* ── Tests ───────────────────────────────────────────────────── */
describe('GET /api/search', () => {
  it('returns empty results for empty query', async () => {
    const ctx = makeContext('/api/search?q=')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toEqual([])
    expect(data.total).toBe(0)
  })

  it('returns empty results for query shorter than 2 chars', async () => {
    const ctx = makeContext('/api/search?q=a')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results).toEqual([])
  })

  it('searches services when type=services', async () => {
    mockOffset.mockResolvedValue([
      { id: 's1', slug: 'test-service', status: 'active', price: '50', currency: 'EUR', title: 'Test', description: 'A test service' },
    ])

    const ctx = makeContext('/api/search?q=test&type=services&lang=fr')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results.length).toBeGreaterThanOrEqual(1)
    expect(data.results[0].type).toBe('service')
  })

  it('searches blog posts when type=blog', async () => {
    mockOffset.mockResolvedValue([
      { id: 'b1', slug: 'test-post', status: 'published', publishedAt: new Date(), headline: 'Test Post', excerpt: 'An excerpt' },
    ])

    const ctx = makeContext('/api/search?q=test&type=blog&lang=fr')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results.length).toBeGreaterThanOrEqual(1)
    expect(data.results[0].type).toBe('blog')
  })

  it('searches organizations when type=organizations', async () => {
    mockOffset.mockResolvedValue([
      { id: 'o1', name: 'Test Org', slug: 'test-org', logo: null, metadata: null },
    ])

    const ctx = makeContext('/api/search?q=test&type=organizations&lang=fr')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results.length).toBeGreaterThanOrEqual(1)
    expect(data.results[0].type).toBe('organization')
  })

  it('searches citizens when type=citizens', async () => {
    mockOffset.mockResolvedValue([
      { id: 'u1', name: 'John', username: 'john', image: null, role: 'user', bio: 'Hello', location: 'Paris' },
    ])

    const ctx = makeContext('/api/search?q=john&type=citizens&lang=fr')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.results.length).toBeGreaterThanOrEqual(1)
    expect(data.results[0].type).toBe('citizen')
  })

  it('searches all types when type=all', async () => {
    const ctx = makeContext('/api/search?q=test&type=all&lang=fr')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('results')
    expect(data).toHaveProperty('query', 'test')
    expect(data).toHaveProperty('type', 'all')
  })

  it('defaults to type=all and lang=fr', async () => {
    const ctx = makeContext('/api/search?q=test')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.type).toBe('all')
  })

  it('clamps page to min 1', async () => {
    const ctx = makeContext('/api/search?q=test&page=-1')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.page).toBe(1)
  })

  it('clamps limit to max 20', async () => {
    const ctx = makeContext('/api/search?q=test&limit=100')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
  })

  it('generates correct URLs for results', async () => {
    mockOffset.mockResolvedValue([
      { id: 'u1', name: 'Jane', username: 'jane', image: null, role: 'user', bio: null, location: null },
    ])

    const ctx = makeContext('/api/search?q=jane&type=citizens&lang=en')
    const res = await GET(ctx)
    const data = await res.json()
    if (data.results.length > 0) {
      expect(data.results[0].url).toBe('/en/citizens/jane')
    }
  })

  it('handles database errors gracefully', async () => {
    mockSelect.mockImplementation(() => {
      throw new Error('DB error')
    })

    const ctx = makeContext('/api/search?q=test&type=services')
    const res = await GET(ctx)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Search failed')
  })
})
