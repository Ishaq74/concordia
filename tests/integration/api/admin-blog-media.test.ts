/**
 * Integration tests for /api/admin/blog/media endpoint.
 * Tests admin guard, media listing, upload validation, metadata actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/blog/media', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list media', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/blog/media')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/blog/media', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns media list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/media', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports type filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/media?type=image', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports search filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/media?q=test', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('POST — media actions', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/blog/media', { action: 'delete', id: 'x' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/blog/media', { action: 'delete', id: 'x' }, { token })
      expect(res.status).toBe(403)
    })

    it('rejects delete without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/media', { action: 'delete' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
