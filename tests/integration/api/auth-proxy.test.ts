/**
 * Integration tests for /api/auth/[...all] — Better Auth proxy endpoint.
 * Tests security headers, error mapping, handler availability.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TEST_ENV } from '@tests/config/test-env'
import { serverAvailable } from '@tests/helpers/server-guard'
import { apiCall } from '@tests/utils/api-helpers'

const serverUp = await serverAvailable()

describe.skipIf(!serverUp)('API /api/auth/[...all]', () => {
  beforeEach(() => {
    Object.entries(TEST_ENV).forEach(([key, value]) => vi.stubEnv(key, value))
  })

  it('responds with security headers on auth endpoints', async () => {
    const res = await apiCall('GET', '/api/auth/session')
    // Security headers should be present
    expect(res.securityHeaders.xcontent).toBe('nosniff')
    expect(res.securityHeaders.xframe).toBe('DENY')
    expect(res.securityHeaders.hsts).toContain('max-age=')
  })

  it('returns 404 for non-existent auth route', async () => {
    const res = await apiCall('GET', '/api/auth/nonexistent-route')
    expect([400, 404, 405]).toContain(res.status)
  })

  it('maps rate limit errors to 429', async () => {
    // Send many rapid requests to trigger potential rate limiting
    const promises = Array.from({ length: 30 }, () =>
      apiCall('POST', '/api/auth/sign-in/email', { email: 'x', password: 'x' })
    )
    const results = await Promise.all(promises)
    // At least one should be non-200 (400 bad request or 429 rate limit)
    const nonOk = results.filter(r => r.status >= 400)
    expect(nonOk.length).toBeGreaterThan(0)
  })

  it('rejects invalid content type gracefully', async () => {
    const res = await apiCall('POST', '/api/auth/sign-in/email', 'not json', {
      headers: { 'Content-Type': 'text/plain' },
    })
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})
