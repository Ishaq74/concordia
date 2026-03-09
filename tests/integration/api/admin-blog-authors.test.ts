/**
 * Integration tests for /api/admin/blog/authors endpoint.
 * Tests admin guard, author listing, CRUD actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/blog/authors', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list authors', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/blog/authors')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/blog/authors', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns authors list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/authors', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports mode=all for flat list', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/authors?mode=all', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('POST — author actions', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/blog/authors', { action: 'create' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/blog/authors', { action: 'create' }, { token })
      expect(res.status).toBe(403)
    })

    it('rejects create without required fields', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/authors', { action: 'create' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })

    it('rejects delete without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/authors', { action: 'delete' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
