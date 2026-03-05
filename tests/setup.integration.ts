// tests/setup.integration.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { auth } from '@/lib/auth/auth';
import type { TestHelpers } from 'better-auth/plugins';
import { db } from '@/database/drizzle';
import { pg } from '@/database/drizzle';

// Extension du contexte Vitest pour accès helpers

declare module 'vitest' {
  interface TestContext {
    auth: typeof auth;
    testUtils: TestHelpers;
  }
}

let testUtils: TestHelpers;

beforeAll(async () => {
  const ctx = await auth.$context;
  testUtils = ctx.test;
  // Nettoyage initial
  await db.execute(sql`TRUNCATE TABLE users, organizations, members, sessions CASCADE`);
});

afterEach(async () => {
  // Cleanup après chaque test pour isolation
  await db.execute(sql`TRUNCATE TABLE users, organizations, members, sessions CASCADE`);
});

afterAll(async () => {
  await pg.end();
});

// Helper global pour accès rapide
export { testUtils };
