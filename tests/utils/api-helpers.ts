/**
 * compute base URL at call time. setup.ts will update TEST_BASE_URL once the
 * dev server chooses a port, and this getter ensures the most up-to-date value
 * is used even if this module was imported earlier.
 */
export function getApiBase() {
  // ensure we only return the host portion; callers will add `/api` prefix
  let base = process.env.TEST_BASE_URL || 'http://localhost:4321';
  base = base.replace(/\/api(\/auth)?$/, '');
  return base;
}

export interface ApiCallOptions {
  token?: string
  headers?: Record<string, string>
  timeout?: number
}

export async function apiCall(
  method: string,
  path: string,
  body?: unknown,
  opts: ApiCallOptions = {}
) {
  const controller = new AbortController()
  const timeout = opts.timeout || 15000
  const timeoutHandle = setTimeout(() => controller.abort(), timeout)

  try {
    const base = getApiBase();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Origin: new URL(base).origin,
      Host: new URL(base).host,
      ...opts.headers,
    }

    if (opts.token) {
      headers['Authorization'] = `Bearer ${opts.token}`
    }

    // Add /api prefix for short API paths (e.g. '/admin/blog/articles').
    // Skip prefix for paths that already start with /api or look like page routes.
    const isAbsolutePath = path.startsWith('/api') || path.startsWith('/fr') || path.startsWith('/en') || path.startsWith('/ar') || path.startsWith('/es') || path === '/';
    const prefix = isAbsolutePath ? '' : '/api';
    const finalUrl = `${getApiBase()}${prefix}${path}`;
    const response = await fetch(finalUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const securityHeaders = {
      csp: response.headers.get('content-security-policy'),
      xframe: response.headers.get('x-frame-options'),
      xcontent: response.headers.get('x-content-type-options'),
      hsts: response.headers.get('strict-transport-security'),
      xss: response.headers.get('x-xss-protection'),
    }

    const contentType = response.headers.get('content-type')
    let data: any = null

    if (contentType?.includes('application/json')) {
      data = await response.json().catch(() => null)
    } else {
      data = await response.text().catch(() => '')
    }

    return {
      status: response.status,
      headers: response.headers,
      securityHeaders,
      data,
      ok: response.ok,
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutHandle)
  }
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  name?: string,
  opts?: ApiCallOptions
) {
  return apiCall(
    'POST',
    '/sign-up/email',
    { email, password, username, name: name || username },
    opts
  )
}

export async function signIn(
  email: string,
  password: string,
  opts?: ApiCallOptions
) {
  return apiCall('POST', '/sign-in/email', { email, password }, opts)
}

export async function verifyEmail(
  code: string,
  opts?: ApiCallOptions
) {
  return apiCall('POST', '/verify-email', { code }, opts)
}

export async function resetPassword(
  email: string,
  opts?: ApiCallOptions
) {
  return apiCall('POST', '/forgot-password', { email }, opts)
}

export async function getUser(
  token: string,
  opts?: ApiCallOptions
) {
  return apiCall('GET', '/user/me', undefined, { ...opts, token })
}

export async function createOrganization(
  name: string,
  token: string,
  opts?: ApiCallOptions
) {
  return apiCall(
    'POST',
    '/organization/create',
    { name },
    { ...opts, token }
  )
}

export async function inviteOrganizationMember(
  organizationId: string,
  email: string,
  role: string,
  token: string,
  opts?: ApiCallOptions
) {
  return apiCall(
    'POST',
    '/organization/invite-member',
    { organizationId, email, role },
    { ...opts, token }
  )
}

export async function listOrganizations(
  token: string,
  opts?: ApiCallOptions
) {
  return apiCall(
    'GET',
    '/organization/list',
    undefined,
    { ...opts, token }
  )
}
