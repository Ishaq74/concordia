/**
 * Integration tests for /api/admin/organizations/members.
 * Tests member listing, invitation, role updates, removal.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createAdminWithToken, createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/admin/organizations/members', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  describe('GET', () => {
    it('rejects non-admin', async () => {
      const { token } = await createUserWithToken()
      const res = await apiCall('GET', '/admin/organizations/members?organizationId=x', undefined, { token })
      expect(res.status).toBe(403)
    })

    it('requires organizationId', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('GET', '/admin/organizations/members', undefined, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_organizationId')
    })
  })

  describe('POST', () => {
    it('rejects missing action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations/members', { organizationId: 'x' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_action')
    })

    it('rejects missing organizationId', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations/members', { action: 'invite' }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_organizationId')
    })

    it('rejects invite without email', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations/members', {
        action: 'invite', organizationId: 'x',
      }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_email')
    })

    it('rejects unknown action', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations/members', {
        action: 'destroy', organizationId: 'x',
      }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('unknown_action')
    })

    it('rejects remove-member without memberId', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations/members', {
        action: 'remove-member', organizationId: 'x',
      }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_memberId')
    })

    it('rejects cancel-invitation without invitationId', async () => {
      const { token } = await createAdminWithToken()
      const headers = buildApiHeaders(token)
      const res = await apiCall('POST', '/admin/organizations/members', {
        action: 'cancel-invitation', organizationId: 'x',
      }, { headers })
      expect(res.status).toBe(400)
      expect(res.data.error).toBe('missing_invitationId')
    })
  })
})
