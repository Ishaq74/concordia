# Copilot Instructions for Concordia Repository

## Build, Test, and Lint Commands

- **Build (Astro):**
  - `pnpm build` — Production build
  - `pnpm build:node` — Node standalone build
  - `pnpm preview` — Preview build locally
- **Development:**
  - `pnpm dev` — Start Astro dev server
- **Database (Drizzle ORM):**
  - `pnpm db:check` — Validate schema
  - `pnpm db:compare` — Compare dev/prod schemas
  - `pnpm db:migrate` — Apply migrations
  - `pnpm db:generate` — Generate types
  - `pnpm db:seed` — Seed test data
  - `pnpm syncdb:dev-to-prod` / `pnpm syncdb:prod-to-dev` — Sync databases
- **Testing:**
  - `pnpm test` — Run all tests (Vitest)
  - `pnpm test:unit` — Unit tests
  - `pnpm test:integration` — Integration tests
  - `pnpm test:e2e` — End-to-end tests (Playwright)
  - `pnpm test:api` — Better Auth API tests
  - `pnpm test:security` — Security tests
  - `pnpm test:all` — All tests
  - `pnpm test:ci` — CI mode with coverage
  - `pnpm test:debug` — Debug tests
  - `pnpm test -- --testNamePattern="pattern"` — Run tests by name
- **Linting:**
  - `pnpm lint` — Run ESLint (if configured)

## High-Level Architecture

- **Astro** is used for frontend and SSR, with adapters for Node and Vercel.
- **Drizzle ORM** manages PostgreSQL schemas, migrations, and type generation.
- **Better Auth** provides authentication, session, RBAC/ABAC, and organization management.
- **Blog** and **Services** modules are CRUD-enabled, multi-locale, and organization-scoped.
- **i18n** supports fr, en, ar, es with slug mapping, RTL, and prefix routing.
- **Design System**: 37+ UI components, 4 themes, documented in `src/components`.
- **Security**: Extensive test coverage for XSS, SQLi, CSRF, rate limiting, and more.
- **Testing**: Vitest for unit/integration, Playwright for E2E, mocks for SMTP and DB, isolated test DB.

## Key Conventions

- **Scripts:** Always use `pnpm` for running scripts.
- **TypeScript Paths:** Use aliases like `@lib/*`, `@database/*`, `@components/*` (see `tsconfig.json`).
- **Mocks:** SMTP and DB are mocked in tests; real services require explicit unmocking.
- **Test Mailbox:** E2E tests access `/__mocks__/emails` endpoint for email assertions.
- **Schema Organization:** All DB schemas are in `src/database/schemas/`, exported via `schemas.ts`.
- **Locale Default:** French (`fr`) is the default locale; routing is prefixed.
- **Admin API:** Admin actions are wrapped via Better Auth plugins and typed interfaces.
- **Security:** ESLint restricts direct imports of `nodemailer` and `pg` in app code.
- **Coverage:** Maintain 85%+ coverage; use `withTestTransaction` for DB isolation.

## AI Assistant Configs

- Documentation and operational scope for agents (e.g., Vladimir) is strictly limited to `.github/docs/*` and internal docs.

---

This file summarizes build/test commands, architecture, and conventions for Copilot and other AI assistants. Would you like to configure Playwright MCP server or adjust any section?