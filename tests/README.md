# Test Suite Documentation

## Overview

Complete test suite for BetterAuth + Astro + Vitest with comprehensive security testing and integration tests.

## Structure
tests/
├── setup.ts                # Global setup & mocks
├── config/
│   ├── test-env.ts         # Test environment variables
│   └── test-db.ts          # Test database connection
├── fixtures/
│   ├── auth-fixtures.ts    # Test data fixtures
│   └── security-payloads.ts # Security test payloads
├── utils/
│   ├── auth-test-utils.ts  # Auth helper functions
│   ├── api-helpers.ts      # API call helpers
│   └── cleanup.ts          # Database cleanup
├── unit/
│   ├── smtp.test.ts        # SMTP service tests
│   └── validation.test.ts  # Input validation tests
├── integration/
│   ├── auth-emails.test.ts # BetterAuth email tests
│   ├── auth-flows.test.ts  # Auth flow tests
│   └── organization.test.ts # Organization tests
└── e2e/
    ├── security.test.ts    # Security E2E tests
    └── api-auth.test.ts    # API E2E tests

## Running Tests
```bash
# Run all tests
npm run test
# Watch mode
npm run test:watch
# UI mode
npm run test:ui
# Coverage
npm run test:coverage
# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security
npm run test:api
# Debug tests
npm run test:debug
# CI mode (with coverage)
npm run test:ci
```

## Test Coverage
- Unit Tests (tests/unit/)
  - SMTP Service: Email sending, validation, batch operations, error handling
  - Input Validation: Email, password, username, subject validation; security payload detection
- Integration Tests (tests/integration/)
  - Auth Emails: Verification, password reset, organization invitations
  - Auth Flows: Sign up, password reset, organization creation
  - Organizations: Organization creation, invitations, permissions
- E2E Tests (tests/e2e/)
  - Security: XSS, SQL injection, CSRF, rate limiting, input validation
  - API Auth: Sign up, sign in, email verification, password reset, organizations

## Key Features
- Security Testing
  - ✅ XSS Protection
  - ✅ SQL Injection Protection
  - ✅ CSRF Protection
  - ✅ Rate Limiting
  - ✅ Null Byte Injection
  - ✅ Buffer Overflow
  - ✅ Unicode Normalization
  - ✅ Command Injection
  - ✅ LDAP Injection
  - ✅ XML Injection
  - ✅ Path Traversal
  - ✅ NoSQL Injection
  - ✅ Token Security
  - ✅ Timing Attack Prevention
- Mocking
  - ✅ Nodemailer mocked (no real emails sent)
  - ✅ Rate limiter mocked
  - ✅ Database isolated for tests
  - ✅ All external calls controlled
- Test Utilities
  - generateUniqueEmail(): Generate unique test emails
  - generateUniqueUsername(): Generate unique test usernames
  - generateSecurePassword(): Generate secure test passwords
  - createTestUser(): Create test users with options
  - createTestOrganization(): Create test organizations
  - loginTestUser(): Login and get token
  - cleanupTestData(): Clean up database after tests
  - apiCall(): Make API calls with options
  - signUp(), signIn(), etc.: Convenience API methods
- Environment Variables
  - Test environment is configured in tests/config/test-env.ts
- Database Setup
  - Tests use isolated PostgreSQL database. Make sure to have:
    ```bash
    # Create test database
    createdb test_db
    # Run migrations
    # (if applicable for your setup)
    ```
- Writing New Tests
  - Unit Test Example
    ```ts
    import { describe, it, expect } from 'vitest'
    describe('My Feature', () => {
      it('should do something', () => {
        expect(true).toBe(true)
      })
    })
    ```
  - Integration Test Example
    ```ts
    import { describe, it, expect, beforeEach, afterEach } from 'vitest'
    import { createTestUser, cleanupTestData } from '@tests/utils/auth-test-utils'
    describe('My Feature', () => {
      beforeEach(async () => { /* Setup */ })
      afterEach(async () => { await cleanupTestData() })
      it('should work with user', async () => {
        const user = await createTestUser({})
        expect(user.user?.id).toBeDefined()
      })
    })
    ```
  - E2E Test Example
    ```ts
    import { describe, it, expect } from 'vitest'
    import { apiCall, signUp } from '@tests/utils/api-helpers'
    describe('My API', () => {
      it('should call endpoint', async () => {
        const res = await apiCall('GET', '/endpoint')
        expect(res.status).toBe(200)
      })
    })
    ```
- Coverage Thresholds
  - Lines: 85%
  - Functions: 85%
  - Branches: 80%
- Continuous Integration
  - Tests run automatically in CI with:
    - npm run test:ci
    - 2 retries per test in CI
    - Coverage report generated
    - All security tests included
- Troubleshooting
  - Tests timeout: Increase testTimeout in vitest.config.ts
  - Database errors: Ensure test database exists, run cleanup before tests, check DATABASE_URL in env
  - Mock not working: Verify mock in tests/setup.ts, check import paths, use vi.mocked() to access mocks
  - Flaky tests: Use beforeEach for setup, afterEach for cleanup, avoid hardcoded delays, use vi.waitFor() for async operations
- Performance
  - Unit tests: ~100ms
  - Integration tests: ~500ms-1s
  - E2E tests: ~1-2s
  - Total suite: ~5-10s
- Best Practices
  - ✅ Always cleanup after tests
  - ✅ Use unique test data generators
  - ✅ Test both success and failure cases
  - ✅ Use descriptive test names
  - ✅ Group related tests with describe
  - ✅ Mock external services
  - ✅ Test security thoroughly
  - ✅ Keep tests isolated
  - ✅ Use fixtures for common data
  - ✅ Document complex test scenarios
- Contributing
  - Write unit tests first
  - Add integration tests
  - Add E2E tests if user-facing
  - Ensure security tests cover new endpoints
  - Maintain 85%+ coverage
  - Update this README

## Resources
- [Vitest Documentation](https://vitest.dev)
- [Better Auth Documentation](https://better-auth.com)
- [Astro Documentation](https://docs.astro.build)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## Maintainers
For issues or questions about tests, contact the development team.
