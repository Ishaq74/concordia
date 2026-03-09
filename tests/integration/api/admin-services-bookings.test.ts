/**
 * Integration tests for /api/admin/services/bookings endpoint.
 * Tests admin guard, booking listing, status management.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/services/bookings', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list bookings', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/services/bookings')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/services/bookings', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns bookings list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/bookings', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports status filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/bookings?status=confirmed', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports date range filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/bookings?from=2025-01-01&to=2025-12-31', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('PATCH — booking status updates', () => {
    it('rejects unauthenticated PATCH', async () => {
      const res = await apiCall('PATCH', '/admin/services/bookings', { id: 'x', status: 'confirmed' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin PATCH', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('PATCH', '/admin/services/bookings', { id: 'x', status: 'confirmed' }, { token })
      expect(res.status).toBe(403)
    })

    it('rejects PATCH without booking id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('PATCH', '/admin/services/bookings', { status: 'confirmed' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
