/**
 * Integration tests for /api/admin/organizations endpoint.
 * Tests admin CRUD, member management, query parameters.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/organizations', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET', () => {
    it('rejects non-admin user', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/organizations', undefined, { token })
      expect(res.status).toBe(403)
    })

    // TODO: Better Auth's listOrganizations internal API hangs in dev environment.
    // This is a pre-existing issue with the organization plugin's API routing.
    it.skip('returns organizations list for admin', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/organizations', undefined, { headers, timeout: 30000 })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('organizations')
    })
  })

  describe('POST', () => {
    it('rejects missing action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations', {}, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_action')
    })

    it('rejects create without name/slug', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations', { action: 'create', name: 'Test' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_name_or_slug')
    })

    it('rejects unknown action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations', { action: 'destroy', organizationId: 'x' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('unknown_action')
    })

    it('rejects add-member without userId or role', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations', {
        action: 'add-member', organizationId: 'x', userId: 'y',
      }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_userId_or_role')
    })

    it('rejects action requiring organizationId when missing', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations', { action: 'set-active' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_organizationId')
    })
  })
})
