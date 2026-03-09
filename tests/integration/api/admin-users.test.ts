/**
 * Integration tests for /api/admin/users endpoint.
 * Tests admin guard, user listing, role management, ban/unban, sessions.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/users', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET — list users', () => {
    it('rejects unauthenticated request', async () => {
      const res = await apiCall('GET', '/admin/users')
      expect(res.status).toBe(401)
    })

    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/users', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('returns users list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/users', undefined, { headers })
      expect(res.status).toBe(200)
    })
  })

  describe('POST — user actions', () => {
    it('rejects missing action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/users', { userId: 'x' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_action')
    })

    it('rejects missing userId', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/users', { action: 'ban' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_userId')
    })

    it('rejects unknown action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/users', { action: 'nuke', userId: 'x' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('unknown_action')
    })

    it('rejects set-role without role', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/users', { action: 'set-role', userId: 'x' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_role')
    })

    it('rejects non-admin user for POST', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('POST', '/admin/users', { action: 'ban', userId: 'x' }, { token })
      expect(res.status).toBe(403)
    })
  })
})
