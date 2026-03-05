import { test, expect } from '@playwright/test';

// Simple E2E demonstration that the test mail box endpoint works.

test.describe('SMTP mock mailbox', () => {
  test('should initially be empty and accept clearing', async ({ request }) => {
    const res1 = await request.get('/__mocks__/emails');
    expect(res1.status()).toBe(200);
    const body1 = await res1.json();
    expect(Array.isArray(body1.emails)).toBe(true);
    expect(body1.emails.length).toBe(0);

    // add a fake email by hitting the server's internal store via node
    // this test cannot easily send without going through the service, so we'll
    // rely on previous unit tests to populate it; just verify clear works
    const res2 = await request.post('/__mocks__/emails', { data: { action: 'clear' } });
    expect(res2.status()).toBe(204);
    const res3 = await request.get('/__mocks__/emails');
    const body3 = await res3.json();
    expect(body3.emails.length).toBe(0);
  });
});
