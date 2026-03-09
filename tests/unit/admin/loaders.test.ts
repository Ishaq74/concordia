/**
 * Unit tests for src/lib/admin/loaders.ts
 * Tests getAdminListData with mocked database.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindMany = vi.fn().mockResolvedValue([])
const mockCountSelect = vi.fn()
const mockCountFrom = vi.fn()
const mockCountWhere = vi.fn()

vi.mock('@database/drizzle', () => ({
  getDrizzle: vi.fn().mockResolvedValue({
    query: {
      blogPosts: {
        findMany: mockFindMany,
      },
    },
    select: mockCountSelect,
  }),
}))

vi.mock('@database/schemas', () => ({
  blogPosts: {
    id: 'blogPosts.id',
    createdAt: 'blogPosts.createdAt',
    slug: 'blogPosts.slug',
  },
}))

vi.mock('drizzle-orm', () => ({
  count: vi.fn().mockReturnValue('count_fn'),
  ilike: vi.fn((col, pattern) => ({ col, pattern })),
  or: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((col) => col),
}))

describe('admin/loaders — getAdminListData', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up the count query chain
    mockCountWhere.mockResolvedValue([{ total: 5 }])
    mockCountFrom.mockReturnValue({ where: mockCountWhere })
    mockCountSelect.mockReturnValue({ from: mockCountFrom })
    mockFindMany.mockResolvedValue([{ id: '1' }, { id: '2' }])
  })

  it('returns paginated data with total', async () => {
    const { getAdminListData } = await import('@lib/admin/loaders')
    const schemas = await import('@database/schemas')
    const table = schemas.blogPosts

    const result = await getAdminListData('blogPosts', table, {
      page: 1,
      pageSize: 10,
    })

    expect(result.data).toHaveLength(2)
    expect(result.total).toBe(5)
    expect(result.totalPages).toBe(1)
  })

  it('defaults to page 1 and pageSize 10', async () => {
    const { getAdminListData } = await import('@lib/admin/loaders')
    const schemas = await import('@database/schemas')

    await getAdminListData('blogPosts', schemas.blogPosts, {})

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 0,
      })
    )
  })

  it('calculates correct offset for page 3', async () => {
    const { getAdminListData } = await import('@lib/admin/loaders')
    const schemas = await import('@database/schemas')

    await getAdminListData('blogPosts', schemas.blogPosts, {
      page: 3,
      pageSize: 5,
    })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 5,
        offset: 10,
      })
    )
  })

  it('applies search filter with searchColumns', async () => {
    const { getAdminListData } = await import('@lib/admin/loaders')
    const schemas = await import('@database/schemas')
    const { ilike } = await import('drizzle-orm')

    await getAdminListData('blogPosts', schemas.blogPosts, {
      search: 'hello',
      searchColumns: [schemas.blogPosts.slug],
    })

    expect(ilike).toHaveBeenCalledWith(schemas.blogPosts.slug, '%hello%')
  })

  it('calculates totalPages correctly', async () => {
    mockCountWhere.mockResolvedValue([{ total: 23 }])
    const { getAdminListData } = await import('@lib/admin/loaders')
    const schemas = await import('@database/schemas')

    const result = await getAdminListData('blogPosts', schemas.blogPosts, {
      page: 1,
      pageSize: 10,
    })

    expect(result.totalPages).toBe(3) // ceil(23/10)
  })

  it('handles zero total gracefully', async () => {
    mockCountWhere.mockResolvedValue([{ total: 0 }])
    mockFindMany.mockResolvedValue([])

    const { getAdminListData } = await import('@lib/admin/loaders')
    const schemas = await import('@database/schemas')

    const result = await getAdminListData('blogPosts', schemas.blogPosts, {})

    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.data).toEqual([])
  })
})
