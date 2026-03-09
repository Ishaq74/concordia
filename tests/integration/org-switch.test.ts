import { describe, it, expect } from 'vitest';

// Integration test for organization switching via Better Auth's internal API

describe('Org switching API', () => {
  it('allows a user to switch active organization', async () => {
    const { auth } = await import('@lib/auth/auth');
    const ctx = await auth.$context;
    const test = ctx.test;
    const userObj = test.createUser({ emailVerified: true });
    const user = await test.saveUser(userObj);
    const userId = user.id;
    const org1Obj = test.createOrganization({ name: 'First Org' });
    const org1 = await test.saveOrganization(org1Obj);
    const org2Obj = test.createOrganization({ name: 'Second Org' });
    const org2 = await test.saveOrganization(org2Obj);

    // Add user as member of both orgs
    await test.addMember({ userId, organizationId: org1.id as string, role: 'admin' });
    await test.addMember({ userId, organizationId: org2.id as string, role: 'member' });

    const { headers } = await test.login({ userId });

    // Switch to first org via internal API
    const r1 = await auth.api.setActiveOrganization({ headers, body: { organizationId: org1.id as string } });
    expect(r1).toBeDefined();
    
    // Switch to second org
    const r2 = await auth.api.setActiveOrganization({ headers, body: { organizationId: org2.id as string } });
    expect(r2).toBeDefined();
  });
});
