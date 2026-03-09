/**
 * Unit tests for src/pages/api/notifications.ts
 * Tests GET (list), PATCH (mark read), DELETE notification endpoints.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── Hoisted mocks ─────────────────────────────────────────── */
const {
  mockSelect, mockUpdate, mockDelete,
  mockFrom, mockWhere, mockOrderBy, mockLimit, mockOffset,
  mockSet, mockUpdateWhere,
  mockDeleteWhere,
  mockCountFrom, mockCountWhere,
  mockSessionUserId,
} = vi.hoisted(() => {
  const mockSelect = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()

  const mockFrom = vi.fn()
  const mockWhere = vi.fn()
  const mockOrderBy = vi.fn()
  const mockLimit = vi.fn()
  const mockOffset = vi.fn()

  const mockSet = vi.fn()
  const mockUpdateWhere = vi.fn()

  const mockDeleteWhere = vi.fn()

  const mockCountFrom = vi.fn()
  const mockCountWhere = vi.fn()

  const mockSessionUserId = { value: 'user-123' as string | null }

  return {
    mockSelect, mockUpdate, mockDelete,
    mockFrom, mockWhere, mockOrderBy, mockLimit, mockOffset,
    mockSet, mockUpdateWhere,
    mockDeleteWhere,
    mockCountFrom, mockCountWhere,
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
    delete: mockDelete,
  }),
}))

vi.mock('@database/schemas/notification.schema', () => ({
  notification: {
    id: 'notification.id',
    userId: 'notification.userId',
    type: 'notification.type',
    isRead: 'notification.isRead',
    createdAt: 'notification.createdAt',
    readAt: 'notification.readAt',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ op: 'eq', a, b })),
  and: vi.fn((...args: unknown[]) => ({ op: 'and', args })),
  desc: vi.fn((col) => ({ op: 'desc', col })),
  count: vi.fn(() => 'count_fn'),
}))

/* ── Import after mocks ─────────────────────────────────────── */
import { GET, PATCH, DELETE as DELETE_HANDLER } from '@pages/api/notifications'

/* ── Helpers ─────────────────────────────────────────────────── */
function makeRequest(method: string, url: string, body?: unknown): Request {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return new Request(url, init)
}

function makeContext(method: string, path: string, body?: unknown) {
  const urlStr = `http://localhost:4321${path}`
  const request = makeRequest(method, urlStr, body)
  const url = new URL(urlStr)
  return { request, url } as Parameters<typeof GET>[0]
}

/* ── Setup chains ────────────────────────────────────────────── */
beforeEach(() => {
  vi.clearAllMocks()
  mockSessionUserId.value = 'user-123'

  // select chain: select() → from() → where() → orderBy() → limit() → offset()
  mockOffset.mockResolvedValue([])
  mockLimit.mockReturnValue({ offset: mockOffset })
  mockOrderBy.mockReturnValue({ limit: mockLimit })
  mockWhere.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit })
  mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy })
  mockSelect.mockReturnValue({ from: mockFrom })

  // count chain: select() → from() → where() resolves to [{count: N}]
  mockCountWhere.mockResolvedValue([{ count: 5 }])
  mockCountFrom.mockReturnValue({ where: mockCountWhere })

  // For parallel selects, return different chains each call
  let callCount = 0
  mockSelect.mockImplementation(() => {
    callCount++
    if (callCount === 1) {
      // items query
      return { from: mockFrom }
    }
    // count queries
    return { from: mockCountFrom }
  })

  // update chain
  mockUpdateWhere.mockResolvedValue({ rowCount: 1 })
  mockSet.mockReturnValue({ where: mockUpdateWhere })
  mockUpdate.mockReturnValue({ set: mockSet })

  // delete chain
  mockDeleteWhere.mockResolvedValue({ rowCount: 1 })
  mockDelete.mockReturnValue({ where: mockDeleteWhere })
})

/* ── GET tests ───────────────────────────────────────────────── */
describe('GET /api/notifications', () => {
  it('returns 401 when not authenticated', async () => {
    mockSessionUserId.value = null
    const ctx = makeContext('GET', '/api/notifications')
    const res = await GET(ctx)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns notifications for authenticated user', async () => {
    const ctx = makeContext('GET', '/api/notifications')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('notifications')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('unread')
    expect(data).toHaveProperty('page')
  })

  it('parses page and limit from query params', async () => {
    const ctx = makeContext('GET', '/api/notifications?page=2&limit=10')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.page).toBe(2)
  })

  it('clamps limit to max 50', async () => {
    const ctx = makeContext('GET', '/api/notifications?limit=100')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
  })

  it('clamps page to min 1', async () => {
    const ctx = makeContext('GET', '/api/notifications?page=-5')
    const res = await GET(ctx)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.page).toBe(1)
  })

  it('filters by type when provided', async () => {
    const ctx = makeContext('GET', '/api/notifications?type=booking')
    await GET(ctx)
    // eq should be called with notification.type and the type value
    const { eq: eqFn } = await import('drizzle-orm')
    expect(eqFn).toHaveBeenCalledWith('notification.type', 'booking')
  })

  it('filters by unread when unread=true', async () => {
    const ctx = makeContext('GET', '/api/notifications?unread=true')
    await GET(ctx)
    const { eq: eqFn } = await import('drizzle-orm')
    expect(eqFn).toHaveBeenCalledWith('notification.isRead', false)
  })
})

/* ── PATCH tests ─────────────────────────────────────────────── */
describe('PATCH /api/notifications', () => {
  it('returns 401 when not authenticated', async () => {
    mockSessionUserId.value = null
    const ctx = makeContext('PATCH', '/api/notifications', { action: 'markRead', notificationId: 'n1' })
    const res = await PATCH(ctx)
    expect(res.status).toBe(401)
  })

  it('marks a single notification as read', async () => {
    const ctx = makeContext('PATCH', '/api/notifications', { action: 'markRead', notificationId: 'n1' })
    const res = await PATCH(ctx)
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ isRead: true }))
  })

  it('marks all notifications as read', async () => {
    const ctx = makeContext('PATCH', '/api/notifications', { action: 'markAllRead' })
    const res = await PATCH(ctx)
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('returns 400 for invalid action', async () => {
    const ctx = makeContext('PATCH', '/api/notifications', { action: 'invalid' })
    const res = await PATCH(ctx)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid action')
  })
})

/* ── DELETE tests ────────────────────────────────────────────── */
describe('DELETE /api/notifications', () => {
  it('returns 401 when not authenticated', async () => {
    mockSessionUserId.value = null
    const ctx = makeContext('DELETE', '/api/notifications?id=n1')
    const res = await DELETE_HANDLER(ctx)
    expect(res.status).toBe(401)
  })

  it('returns 400 when notification id is missing', async () => {
    const ctx = makeContext('DELETE', '/api/notifications')
    const res = await DELETE_HANDLER(ctx)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing notification id')
  })

  it('deletes notification by id', async () => {
    const ctx = makeContext('DELETE', '/api/notifications?id=n1')
    const res = await DELETE_HANDLER(ctx)
    expect(res.status).toBe(200)
    expect(mockDelete).toHaveBeenCalled()
  })
})
