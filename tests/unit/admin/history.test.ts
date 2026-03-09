/**
 * Unit tests for src/lib/admin/history.ts
 * Tests listSessionHistory with mocked database.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the drizzle module
const mockFindMany = vi.fn().mockResolvedValue([])
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockInnerJoin = vi.fn()
const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    select: mockSelect,
  }),
}))

vi.mock('@database/schemas/auth-schema', () => ({
  session: {
    id: 'session.id',
    userId: 'session.userId',
    ipAddress: 'session.ipAddress',
    userAgent: 'session.userAgent',
    createdAt: 'session.createdAt',
    expiresAt: 'session.expiresAt',
    impersonatedBy: 'session.impersonatedBy',
  },
  user: {
    id: 'user.id',
    name: 'user.name',
    email: 'user.email',
  },
}))

vi.mock('drizzle-orm', () => ({
  desc: vi.fn((col) => col),
  eq: vi.fn((a, b) => [a, b]),
  ilike: vi.fn((col, pattern) => [col, pattern]),
  inArray: vi.fn((col, arr) => [col, arr]),
  or: vi.fn((...args: unknown[]) => args),
}))

describe('admin/history — listSessionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up chainable query builder
    mockLimit.mockResolvedValue([])
    mockOrderBy.mockReturnValue({ limit: mockLimit })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockInnerJoin.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    })
    mockFrom.mockReturnValue({ innerJoin: mockInnerJoin })
    mockSelect.mockReturnValue({ from: mockFrom })
  })

  it('returns empty array when no sessions exist', async () => {
    const { listSessionHistory } = await import('@lib/admin/history')
    const result = await listSessionHistory()
    expect(result).toEqual([])
  })

  it('applies default limit of 50', async () => {
    const { listSessionHistory } = await import('@lib/admin/history')
    await listSessionHistory()
    expect(mockLimit).toHaveBeenCalledWith(50)
  })

  it('applies custom limit', async () => {
    const { listSessionHistory } = await import('@lib/admin/history')
    await listSessionHistory({ limit: 10 })
    expect(mockLimit).toHaveBeenCalledWith(10)
  })

  it('applies search filter when provided', async () => {
    const { listSessionHistory } = await import('@lib/admin/history')
    await listSessionHistory({ search: 'admin' })
    expect(mockWhere).toHaveBeenCalled()
  })

  it('skips search filter for empty/whitespace search', async () => {
    const { listSessionHistory } = await import('@lib/admin/history')
    await listSessionHistory({ search: '   ' })
    // With empty trimmed search, the query should use orderBy directly (no where)
    expect(mockOrderBy).toHaveBeenCalled()
  })

  it('enriches rows with impersonator details', async () => {
    const rows = [
      {
        sessionId: 's1',
        userId: 'u1',
        userName: 'User 1',
        userEmail: 'u1@test.com',
        ip: '1.2.3.4',
        userAgent: 'Chrome',
        createdAt: new Date(),
        expiresAt: new Date(),
        impersonatedBy: 'admin-1',
      },
    ]

    const impersonators = [
      { id: 'admin-1', name: 'Admin', email: 'admin@test.com' },
    ]

    mockLimit.mockResolvedValueOnce(rows)
    // Second select call for impersonators
    const mockImpFrom = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(impersonators),
    })
    mockSelect
      .mockReturnValueOnce({ from: mockFrom }) // first call (main query)
      .mockReturnValueOnce({ from: mockImpFrom }) // second call (impersonator lookup)

    const { listSessionHistory } = await import('@lib/admin/history')
    const result = await listSessionHistory()

    expect(result).toHaveLength(1)
    expect(result[0].impersonatorName).toBe('Admin')
    expect(result[0].impersonatorEmail).toBe('admin@test.com')
  })
})
