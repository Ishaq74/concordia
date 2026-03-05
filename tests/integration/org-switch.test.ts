import { describe, it, expect } from 'vitest';
import { auth } from '@lib/auth/auth';

// Integration test for organization switching API

describe('Org switching API', () => {
  it('allows a user to switch active organization via API', async () => {
    // create a user and two orgs
    // user must be admin according to current server guard
    const ctx = await auth.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true, role: 'admin' });
    const user = await test.saveUser(userObj);
    const userId = user.id;
    const org1Obj = test.createOrganization({ name: 'First Org' });
    const org1 = await test.saveOrganization(org1Obj);
    const org2Obj = test.createOrganization({ name: 'Second Org' });
    const org2 = await test.saveOrganization(org2Obj);

    // login and obtain bearer token
    const { token } = await test.login({ userId });
    const headers = { Authorization: `Bearer ${token}` } as any;

    // switch to first org
    // call endpoint directly since auth.api may not expose helper in tests
    // use apiCall helper to reach the running server (API_BASE includes host)
    const { apiCall } = await import('@tests/utils/api-helpers');
    // endpoint is POST /api/admin/organizations with action payload
    const r1 = await apiCall('POST', '/admin/organizations', { action: 'set-active', organizationId: org1.id }, headers);
    expect(r1.status).toBe(200);
    const r2 = await apiCall('POST', '/admin/organizations', { action: 'set-active', organizationId: org2.id }, headers);
    expect(r2.status).toBe(200);
  });
});
