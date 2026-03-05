export const TEST_ENV = {
  NODE_ENV: 'test',
  SMTP_MOCK: '1',
  BETTER_AUTH_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://test:test@localhost/test_db',
  // base url used by apiCall helper; we override after server starts in setup.ts
  TEST_BASE_URL: 'http://localhost:4321/api',
  JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
  BETTER_AUTH_SECRET: 'test-better-auth-secret-key-for-testing-only',
}

export function setupTestEnv() {
  Object.entries(TEST_ENV).forEach(([key, value]) => {
    process.env[key] = value
  })
}
