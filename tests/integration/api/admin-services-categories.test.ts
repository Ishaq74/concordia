/**
 * Integration tests for /api/admin/services/categories endpoint.
 * Tests admin guard, category listing, CRUD actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/services/categories', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list service categories', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/services/categories')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/services/categories', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns categories for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/categories', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports mode=all for flat list', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/categories?mode=all', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('POST — category actions', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/services/categories', { action: 'create' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/services/categories', { action: 'create' }, { token })
      expect(res.status).toBe(403)
    })

    it('accepts create without explicit fields (server generates defaults)', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/categories', { action: 'create' }, { headers })
      // Server generates slug from ID when no name/slug provided
      expect(res.status).toBe(201)
    })

    it('rejects delete without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/categories', { action: 'delete' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
