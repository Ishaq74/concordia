import { describe, it, expect } from 'vitest';
import { createTestUser, loginTestUser } from '@tests/utils/auth-test-utils';
import { apiCall } from '@tests/utils/api-helpers';
import { securityPayloads } from '@tests/fixtures/security-payloads';

// RBAC/ABAC tests
describe('RBAC/ABAC', () => {
  it('refuse accès admin sans rôle', async () => {
    const user = await createTestUser({ role: 'user' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('GET', '/admin', undefined, { token });
    expect(res.status).toBe(403);
    expect(res.data.message).toMatch(/permission/i);
  });

  it('autorise accès admin avec rôle', async () => {
    const user = await createTestUser({ role: 'admin' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('GET', '/admin', undefined, { token });
    expect(res.status).toBe(200);
  });

  it('refuse escalade de privilège', async () => {
    const user = await createTestUser({ role: 'user' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('POST', '/admin/escalade', undefined, { token });
    expect(res.status).toBe(403);
  });
});

// XSS tests
describe('XSS', () => {
  it('rejette payload XSS dans formulaire', async () => {
    const user = await createTestUser({ role: 'user' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('POST', '/comments', { content: securityPayloads.xss[0] }, { token });
    expect(res.status).toBe(400);
    expect(res.data.message).toMatch(/invalid/i);
  });
});

// Injection tests
describe('Injection', () => {
  it('rejette payload SQLi', async () => {
    const user = await createTestUser({ role: 'user' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('POST', '/comments', { content: securityPayloads.sql[0] }, { token });
    expect(res.status).toBe(400);
  });

  it('rejette payload NoSQLi', async () => {
    const user = await createTestUser({ role: 'user' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('POST', '/comments', { content: securityPayloads.nosql[0] }, { token });
    expect(res.status).toBe(400);
  });
});

// Escalade tests
describe('Escalade', () => {
  it('refuse modification de rôle sans autorisation', async () => {
    const user = await createTestUser({ role: 'user' });
    const { token } = await loginTestUser(user.credentials.email, user.credentials.password);
    const res = await apiCall('POST', '/users/role', { role: 'admin' }, { token });
    expect(res.status).toBe(403);
  });
});
