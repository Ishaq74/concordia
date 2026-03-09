/**
 * Unit tests for src/pages/api/admin/translations.ts
 * Tests POST endpoint for saving blog/services translations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── Hoisted mocks ─────────────────────────────────────────── */
const {
  mockSelect, mockUpdate, mockInsert,
  mockSelectFrom, mockSelectWhere, mockSelectLimit,
  mockUpdateSet, mockUpdateWhere,
  mockInsertValues,
  mockSessionUserId,
} = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockUpdate = vi.fn()
  const mockInsert = vi.fn()
  const mockSelectFrom = vi.fn()
  const mockSelectWhere = vi.fn()
  const mockSelectLimit = vi.fn()
  const mockUpdateSet = vi.fn()
  const mockUpdateWhere = vi.fn()
  const mockInsertValues = vi.fn()
  const mockSessionUserId = { value: 'admin-1' as string | null }

  return {
    mockSelect, mockUpdate, mockInsert,
    mockSelectFrom, mockSelectWhere, mockSelectLimit,
    mockUpdateSet, mockUpdateWhere,
    mockInsertValues,
    mockSessionUserId,
  }
})

/* ── Mock auth ──────────────────────────────────────────────── */
vi.mock('@lib/auth/auth', () => ({
  getAuth: vi.fn().mockResolvedValue({
    api: {
      getSession: vi.fn().mockImplementation(() =>
        mockSessionUserId.value
          ? Promise.resolve({ user: { id: mockSessionUserId.value } })
          : Promise.resolve(null)
      ),
    },
  }),
}))

/* ── Mock drizzle ───────────────────────────────────────────── */
vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
  }),
}))

vi.mock('@database/schemas', () => ({
  blogTranslations: {
    id: 'blogTranslations.id', postId: 'blogTranslations.postId',
    inLanguage: 'blogTranslations.inLanguage',
    headline: 'blogTranslations.headline', articleBody: 'blogTranslations.articleBody',
    excerpt: 'blogTranslations.excerpt',
  },
  servicesTranslations: {
    id: 'servicesTranslations.id', serviceId: 'servicesTranslations.serviceId',
    inLanguage: 'servicesTranslations.inLanguage',
    title: 'servicesTranslations.title', description: 'servicesTranslations.description',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ op: 'eq', a, b })),
  and: vi.fn((...args: unknown[]) => ({ op: 'and', args })),
}))

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'uuid-test-123'),
}))

/* ── Import after mocks ─────────────────────────────────────── */
import { POST } from '@pages/api/admin/translations'

/* ── Helpers ─────────────────────────────────────────────────── */
function makeContext(body: unknown) {
  const urlStr = 'http://localhost:4321/api/admin/translations'
  const request = new Request(urlStr, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { request } as Parameters<typeof POST>[0]
}

/* ── Setup ───────────────────────────────────────────────────── */
beforeEach(() => {
  vi.clearAllMocks()
  mockSessionUserId.value = 'admin-1'

  // select chain: select() → from() → where() → limit()
  mockSelectLimit.mockResolvedValue([])
  mockSelectWhere.mockReturnValue({ limit: mockSelectLimit })
  mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
  mockSelect.mockReturnValue({ from: mockSelectFrom })

  // update chain
  mockUpdateWhere.mockResolvedValue({ rowCount: 1 })
  mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
  mockUpdate.mockReturnValue({ set: mockUpdateSet })

  // insert chain
  mockInsertValues.mockResolvedValue(undefined)
  mockInsert.mockReturnValue({ values: mockInsertValues })
})

/* ── Tests ───────────────────────────────────────────────────── */
describe('POST /api/admin/translations', () => {
  it('returns 401 when not authenticated', async () => {
    mockSessionUserId.value = null
    const ctx = makeContext({ contentType: 'blog', contentId: 'p1', locale: 'en', fields: { title: 'Hello' } })
    const res = await POST(ctx)
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields are missing', async () => {
    const ctx = makeContext({ contentType: 'blog' })
    const res = await POST(ctx)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing required fields')
  })

  it('returns 400 for invalid content type', async () => {
    const ctx = makeContext({ contentType: 'invalid', contentId: 'x', locale: 'en', fields: { title: 'T' } })
    const res = await POST(ctx)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid content type')
  })

  describe('blog translations', () => {
    it('inserts new blog translation when none exists', async () => {
      mockSelectLimit.mockResolvedValue([])  // no existing

      const ctx = makeContext({
        contentType: 'blog', contentId: 'post-1', locale: 'en',
        fields: { title: 'Hello', excerpt: 'Summary', content: 'Body text' },
      })
      const res = await POST(ctx)
      expect(res.status).toBe(200)
      expect(mockInsert).toHaveBeenCalled()
      expect(mockInsertValues).toHaveBeenCalledWith(expect.objectContaining({
        id: 'uuid-test-123',
        inLanguage: 'en',
        postId: 'post-1',
        headline: 'Hello',
        excerpt: 'Summary',
        articleBody: 'Body text',
      }))
    })

    it('updates existing blog translation', async () => {
      mockSelectLimit.mockResolvedValue([{ id: 'trans-1' }])  // existing found

      const ctx = makeContext({
        contentType: 'blog', contentId: 'post-1', locale: 'en',
        fields: { title: 'Updated Title' },
      })
      const res = await POST(ctx)
      expect(res.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
        headline: 'Updated Title',
        inLanguage: 'en',
        postId: 'post-1',
      }))
    })
  })

  describe('services translations', () => {
    it('inserts new service translation when none exists', async () => {
      mockSelectLimit.mockResolvedValue([])  // no existing

      const ctx = makeContext({
        contentType: 'services', contentId: 'svc-1', locale: 'ar',
        fields: { title: 'خدمة', description: 'وصف' },
      })
      const res = await POST(ctx)
      expect(res.status).toBe(200)
      expect(mockInsert).toHaveBeenCalled()
      expect(mockInsertValues).toHaveBeenCalledWith(expect.objectContaining({
        id: 'uuid-test-123',
        inLanguage: 'ar',
        serviceId: 'svc-1',
        title: 'خدمة',
        description: 'وصف',
      }))
    })

    it('updates existing service translation', async () => {
      mockSelectLimit.mockResolvedValue([{ id: 'trans-2' }])  // existing found

      const ctx = makeContext({
        contentType: 'services', contentId: 'svc-1', locale: 'es',
        fields: { title: 'Servicio actualizado' },
      })
      const res = await POST(ctx)
      expect(res.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  it('handles database errors gracefully', async () => {
    mockSelect.mockImplementation(() => { throw new Error('DB error') })

    const ctx = makeContext({
      contentType: 'blog', contentId: 'p1', locale: 'en',
      fields: { title: 'Test' },
    })
    const res = await POST(ctx)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Save failed')
  })
})
