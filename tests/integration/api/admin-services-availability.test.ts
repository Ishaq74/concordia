/**
 * Integration tests for /api/admin/services/availability endpoint.
 * Tests admin guard, availability listing, slot CRUD actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/services/availability', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list availability', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/services/availability')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/services/availability', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('requires serviceId query param', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/availability', undefined, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_serviceId')
    })

    it('supports serviceId filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/availability?serviceId=test-service', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('POST — availability actions', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/services/availability', { action: 'create' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/services/availability', { action: 'create' }, { token })
      expect(res.status).toBe(403)
    })

    it('rejects create without required fields', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/availability', { action: 'create' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })

    it('rejects delete without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/availability', { action: 'delete' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
