/**
 * Integration tests for /api/admin/services/services endpoint.
 * Tests admin guard, service listing, CRUD actions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/services/services', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list services', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/services/services')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/services/services', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns services list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/services?page=1&perPage=5', undefined, { headers })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('services')
      expect(res.data).toHaveProperty('total')
    })

    it('supports search filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/services?q=nonexistent', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('supports status filter', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/services?status=active', undefined, { headers })
      expect(res.status).toBe(200)
    })

    it('returns 404 for nonexistent service id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/services/services?id=nonexistent-id', undefined, { headers })
      expect(res.status).toBe(404)
      expect(res.data.error).toBe('not_found')
    })
  })

  describe('POST — service actions', () => {
    it('rejects unauthenticated POST', async () => {
      const res = await apiCall('POST', '/admin/services/services', { action: 'create' })
      expect(res.status).toBe(401)
    })

    it('rejects non-admin POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/services/services', { action: 'create' }, { token })
      expect(res.status).toBe(403)
    })

    it('rejects create without required fields', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/services', { action: 'create' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })

    it('rejects delete without id', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/services', { action: 'delete' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })

    it('rejects unknown action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/services/services', { action: 'nuke' }, { headers })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
    })
  })
})
