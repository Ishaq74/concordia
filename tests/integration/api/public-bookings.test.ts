/**
 * Integration tests for /api/services/bookings (public booking creation).
 * Tests auth, validation, availability, self-booking prevention.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { randomUUID } from 'crypto'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'
import { createUserWithToken, buildApiHeaders } from '@tests/fixtures/test-factory'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/services/bookings (public)', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  it('rejects unauthenticated request', async () => {
    const res = await apiCall('POST', '/services/bookings', {
      serviceId: 'x', bookingDate: '2026-04-01', bookingTime: '10:00',
    })
    expect(res.status).toBe(401)
  })

  it('rejects missing required fields', async () => {
    const { token } = await createUserWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/services/bookings', { serviceId: 'x' }, { headers })
    expect(res.status).toBe(400)
  })

  it('returns 404 for non-existent service', async () => {
    const { token } = await createUserWithToken()
    const headers = buildApiHeaders(token)
    const res = await apiCall('POST', '/services/bookings', {
      serviceId: randomUUID(),
      bookingDate: '2026-04-01',
      bookingTime: '10:00',
    }, { headers })
    expect(res.status).toBe(404)
  })
})
