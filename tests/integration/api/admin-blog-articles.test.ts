/**
 * Integration tests for /api/admin/blog/articles endpoint.
 * Tests admin guard, article listing, CRUD actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/blog/articles', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list articles', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/blog/articles')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/blog/articles', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns articles list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/articles?page=1&perPage=5', undefined, { headers })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('articles')
      expect(res.data).toHaveProperty('total')
    })

    it('supports search filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/articles?q=nonexistent', undefined, { headers })
      expect(res.status).toBe(200)
      expect(res.data.articles).toEqual([])
    })

    it('supports status filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/articles?status=published', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('returns 404 for nonexistent article id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/articles?id=nonexistent-id', undefined, { headers })
      expect(res.status).toBe(404)
      expect(res.data.error).toBe('not_found')
    })
  })

  describe('POST — article actions', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/blog/articles', { action: 'create' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/blog/articles', { action: 'create' }, { token })
      expect(res.status).toBe(403)
    })

    it('accepts create without explicit fields (server generates defaults)', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/articles', { action: 'create' }, { headers })
      // Server generates slug from ID when no title/slug provided
      expect(res.status).toBe(201)
    })

    it('rejects delete without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/articles', { action: 'delete' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })

    it('rejects unknown action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/articles', { action: 'nuke' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
