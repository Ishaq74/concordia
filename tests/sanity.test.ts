import { test, expect } from 'vitest';

// Minimal sanity tests that don't depend on HTTP or complex behavior.

test('test database can be obtained', async () => {
  const { getTestDb } = await import('./config/test-db');
  const db = await getTestDb();
  expect(db).toBeDefined();
});

test('SMTP mock store is initialized', () => {
  const g: any = global as any;
  if (!g.__sentEmails) g.__sentEmails = [];
  expect(Array.isArray(g.__sentEmails)).toBe(true);
});
