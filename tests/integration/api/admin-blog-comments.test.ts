/**
 * Integration tests for /api/admin/blog/comments endpoint.
 * Tests admin guard, comment listing, moderation actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/blog/comments', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list comments', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/blog/comments')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/blog/comments', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns comments list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/comments', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports status filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/comments?status=pending', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports search filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/blog/comments?q=nonexistent', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('POST — comment moderation', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/blog/comments', { action: 'approve', id: 'x' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/blog/comments', { action: 'approve', id: 'x' }, { token })
      expect(res.status).toBe(403)
    })

    it('rejects approve without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/comments', { action: 'approve' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })

    it('rejects unknown action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/blog/comments', { action: 'nuke', id: 'x' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
