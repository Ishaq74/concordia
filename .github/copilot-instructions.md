# Concordia — AI Agent Workspace Instructions

> **MANDATORY**: Before any work, read `README.md` at the project root. It is auto-generated from live project state (`pnpm run readme:generate`) and contains the current dependencies, scripts, file tree, database schemas, environment variables, CSS tokens, and test inventories. This file (`copilot-instructions.md`) describes conventions and patterns; the README describes what currently exists.

## Overview

Astro 5.x SSR application with Better Auth, Drizzle ORM (PostgreSQL), multilingual routing (fr/en/ar/es), custom CSS design system, and comprehensive security. Package manager is **pnpm**. TypeScript throughout.

## Architecture

- **SSR-first**: `output: 'server'` in [astro.config.mjs](../astro.config.mjs). Default adapter is Vercel; Node.js standalone via `--node` flag.
- **Zero client JS by default**: All UI components are pure `.astro` files. Only auth forms use client-side TypeScript.
- **Islands Architecture**: No React/Vue/Svelte — interactivity is handled by inline scripts and client-side TS modules.
- **Multilingual routing**: 4 locales (`fr`, `en`, `ar`, `es`), all routes prefixed (`/fr/`, `/en/`…), RTL support for Arabic. Default locale is `fr`, root `/` redirects to `/fr/`.
- **Database-driven content**: Drizzle ORM + PostgreSQL for multilingual entries (ID format: `${slug}-${lang}`). Content Layer loader infrastructure to be implemented.
- **Auth system**: Better Auth with username, organization, and admin plugins. RBAC + ABAC permission system in [src/lib/auth/permissions.ts](../src/lib/auth/permissions.ts). Audit logging to `auditLog` table.
- **Styling**: Custom CSS design system using tokens (`tokens/colors.css`, `tokens/typography.css`, `tokens/spacing.css`, `tokens/components.css`) with 4 style variants: `initial`, `retro`, `modern`, `futuristic`.

## Path Aliases (tsconfig.json)

```
@/*           → src/*
@database/*   → src/database/*
@components/* → src/components/*
@layouts/*    → src/layouts/*
@lib/*        → src/lib/*
@styles/*     → src/styles/*
@templates/*  → src/components/templates/*
@assets/*     → src/assets/*
@api/*        → src/pages/api/*
@smtp/*       → src/lib/smtp/*
@i18n/*       → src/i18n/*
@tests/*      → tests/*
```

Always use these aliases in imports — never relative paths crossing `src/` boundaries.

## Build & Test Commands

```bash
pnpm dev              # Start dev server (port 4321)
pnpm build            # Build with Vercel adapter
pnpm build:node       # Build with Node.js standalone adapter
pnpm preview          # Preview Vercel build
pnpm preview:node     # Preview Node.js build

pnpm test             # Run vitest (interactive)
pnpm test:all         # Run all tests once
pnpm test:unit        # Unit tests only (tests/unit/)
pnpm test:integration # Integration tests only (tests/integration/)
pnpm test:e2e         # E2E tests only (tests/e2e/)
pnpm test:security    # Security-specific E2E tests
pnpm test:coverage    # Run with coverage report

pnpm db:generate      # Generate Drizzle migrations from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:seed          # Seed database from data files
pnpm db:check         # Validate schema against database
pnpm smtp:check       # Verify SMTP configuration
```

After any code change, run `pnpm astro check` to validate types.

## Project Conventions

### UI Components (`src/components/ui/`)

Every component follows the same prop pattern:

```astro
---
interface Props {
  variant?: 'initial' | 'retro' | 'modern' | 'futuristic'
  color?: 'default' | 'primary' | 'secondary' | 'accent' | 'error' // or status for Alert
  className?: string
  [key: string]: any // rest props spread onto root element
}
---
```

- Icons use `astro-icon`: `<Icon name="mdi:icon-name" />` with `@iconify-json/mdi`.
- Classes built from `variant-{variant}` and contextual prop.
- Accessibility: always include `role`, `aria-label`, semantic HTML. See `.github/instructions/a11y.instructions.md` for WCAG 2.2 AA rules.
- Never disable submit buttons — show error messages instead.

### Page Structure

Locale-specific directories under `src/pages/`:
```
src/pages/{locale}/           # index, auth/*, docs/*
src/pages/api/                # API routes (not locale-prefixed)
```

French pages use French slugs (`connexion`, `inscription`, `mot-de-passe-oublie`).
English pages use English slugs (`sign-in`, `sign-up`, `forgot-password`). Refer to existing pages.

### API Routes

- Auth catch-all: `src/pages/api/auth/[...all].ts` — handles all Better Auth endpoints with security headers.
- All API routes set `export const prerender = false`.
- Security headers injected on every API response: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy.

### Database Schemas

- Barrel file: [src/database/schemas.ts](../src/database/schemas.ts) re-exports all schemas.
- Individual schemas in `src/database/schemas/*.ts`.
- Drizzle dev config reads the barrel file; prod config globs `schemas/**/*.ts`.
- Migration files in `src/database/migrations/` — sorted alphabetically, applied in order.

### i18n

- Flat JSON files in `src/i18n/` (`en.json`, `fr.json`, `ar.json`, `es.json`).
- Nested keys: `nav.*`, `services.*`, `blog.*`, `docs.*`, `footer.*`, `docsSidebar.*`.
- Locale resolved via `Astro.currentLocale || "fr"`.

### Auth & Security

- Input validation in [src/lib/auth/validate-user.ts](../src/lib/auth/validate-user.ts) checks 15+ attack vectors (XSS, SQLi, NoSQLi, command injection, path traversal, null bytes, unicode spoofing, template injection).
- RBAC roles: `admin`, `user`, `owner`, `member`.
- ABAC context-aware checks for resource ownership, org membership, privilege escalation prevention.
- Rate limiting: database-backed, 100 req/min global, 5 sign-in/15min, 10 sign-up/hour.
- SMTP mock mode in test: `SMTP_MOCK=1` or `NODE_ENV=test`.

### Testing

- **Framework**: Vitest (node environment, forks pool).
- **Setup**: [tests/setup.ts](../tests/setup.ts) mocks `nodemailer` and rate limiter; runs cleanup before/after all tests.
- **Coverage thresholds**: 85% lines, 85% functions, 80% branches.
- **Test utilities**:
  - [tests/utils/auth-test-utils.ts](../tests/utils/auth-test-utils.ts): `createTestUser()`, `loginTestUser()`, `generateUniqueEmail()`.
  - [tests/utils/api-helpers.ts](../tests/utils/api-helpers.ts): `apiCall()`, `signUp()`, `signIn()`, `verifyEmail()`.
  - [tests/utils/cleanup.ts](../tests/utils/cleanup.ts): Deletes `*@test.local` users and cascades.
- Test emails use `@test.local` domain. Test DB: `DATABASE_URL_TEST`.
- Security payloads in [tests/fixtures/security-payloads.ts](../tests/fixtures/security-payloads.ts).

### Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL_LOCAL` | Local dev PostgreSQL |
| `DATABASE_URL_PROD` | Production PostgreSQL |
| `DATABASE_URL_TEST` | Test PostgreSQL |
| `USE_PROD_DB` | `"true"` → connect prod |
| `USE_DB_TEST` | `"true"` → connect test |
| `BETTER_AUTH_URL` | Auth base URL |
| `BETTER_AUTH_SECRET` | Auth secret |
| `SITE` | Site URL for Astro |
| `SMTP_PROVIDER` | SMTP provider key |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials |
| `SMTP_FROM` | Default sender |
| `SMTP_MOCK` | `"1"` → mock mode |

## Database Script Workflows

All scripts in `scripts/db/` use `tsx` and respect `USE_PROD_DB` / `USE_DB_TEST` env vars.

### Migration (`pnpm db:migrate`)
- Custom runner (not Drizzle Kit's built-in migrate).
- Tracking table: `__drizzle_migrations` (auto-created).
- Reads `.sql` files from `src/database/migrations/`, sorted alphabetically.
- Each SQL statement runs in its own transaction. Duplicate-object errors (`42P07`, `42710`, `42701`) are silently ignored.
- After applying: records migration ID in tracking table.

### Generation (`pnpm db:generate`)
- Detects schema files in `src/database/schemas/` not re-exported by the barrel file — prompts to add missing exports.
- Selects `drizzle-dev.config.ts` or `drizzle-prod.config.ts` based on `USE_PROD_DB`.
- Runs `drizzle-kit generate` then diffs before/after to report new migration files.
- Follow up with `pnpm db:migrate` if migrations were generated.

### Seeding (`pnpm db:seed`)
- Scans `src/lib/database/data/` for `*.data.ts` files (prefix like `01-` controls order, stripped for matching).
- Matches data files to schemas in `src/lib/database/schemas/` by basename.
- Inserts with `onConflictDoNothing()` — no upsert/update.

### Sync (`pnpm syncdb:dev-to-prod` | `pnpm syncdb:prod-to-dev`)
- Full unidirectional copy: TRUNCATE + CASCADE on target, row-by-row INSERT from source.
- `dev-to-prod` requires typing `oui` to confirm (destructive).

### Check (`pnpm db:check`)
- Validates connection URL format, connects, lists tables and constraints.
- Reports specific PostgreSQL error codes (DB not found, auth failure).

### Compare (`pnpm db:compare`)
- 4-step comparison of local vs prod: table structure → column structure → data (JSON equality, up to 5 diffs/table) → expected table list validation.
- Hardcoded expected tables — update the script when schema evolves.

## Template Components

### Auth Templates (`src/components/templates/auth/`)

| Component | Role |
|---|---|
| `AuthLayout.astro` | Centered wrapper shell. Props: `translations`. Renders `<slot />`. |
| `SignInCard.astro` | Sign-in form card |
| `SignUpCard.astro` | Sign-up form card |
| `ForgotPasswordForm.astro` | Forgot password form |
| `ResetPasswordForm.astro` | Reset password form |
| `VerifyEmailCard.astro` | Email verification card |
| `verify-email.client.ts` | Client-side TS for verification flow |
| `forgot-password.client.ts` | Client-side TS for forgot password flow |

### Docs Templates (`src/components/templates/docs/`)

| Component | Role |
|---|---|
| `MainDoc.astro` | Article wrapper. Props: `variant`. Applies `variant-${variant}` on `<article>`. |
| `Sidebar.astro` | Navigation sidebar |
| `TableOfContents.astro` | In-page TOC |
| `navigation.ts` | Navigation data structure and helpers |

### Header Templates (`src/components/templates/Header/`)

| Component | Role |
|---|---|
| `Header.astro` | Orchestrator. Props: `variant`, `fixed`, `lang`. Composes all sub-components. Desktop vs mobile (≤1024px → `Sheet` drawer). |
| `Brand.astro` | Logo/brand link |
| `Navigation.astro` | Nav links + dropdowns. Resolves locale via `Astro.currentLocale`, dynamic JSON import for translations, `getRelativeLocaleUrl()` for links. |
| `LangChooser.astro` | Locale switcher dropdown with flag emojis for all 4 locales. |
| `ThemeSwitch.astro` | Dark/light toggle |
| `User.astro` | Auth state from `Astro.locals.user`. Shows `Avatar` + dropdown if authenticated, sign-in link otherwise. |

### Footer Template (`src/components/templates/Footer/`)

`Footer.astro` — Props: `variant`, `config` (granular show/hide: `showSocial`, `showNavPrimary`, `showContactInfo`, `showLegalInfo`, `showAddress`, `showCopyright`). Uses same i18n pattern: dynamic JSON import + `getRelativeLocaleUrl()`.

### i18n Pattern in Templates

All templates follow this pattern:
```typescript
const currentLocale = Astro.currentLocale || "fr";
const t = await import(`../../../i18n/${currentLocale}.json`);
```
Links use `getRelativeLocaleUrl(currentLocale, path)` from `astro:i18n`.

## CSS Variant System

### Architecture & Cascade

```
tokens/colors.css     ─┐
tokens/typography.css  ├→ base.css (imports tokens + initial.css + reset)
tokens/spacing.css     │
tokens/components.css ─┘
                         ↓
global.css → base.css + retro.css + modern.css + futuristic.css
```

### Variant Class Naming

**The variant class is applied directly on the component element, NOT as a parent wrapper.**

```css
/* Pattern: element.{variant} or .component.{variant} */
button.retro { ... }
button.retro.primary { ... }
.card.modern { ... }
.badge.futuristic.accent { ... }
```

- `initial` — bare element selectors (`button { }`, `input { }`). No `.initial` class needed.
- `retro`, `modern`, `futuristic` — applied as direct CSS classes on the element.
- Color variants (`primary`, `secondary`, `accent`, `error`) are additional classes on the same element.

**Full class example**: a retro primary button → `class="retro primary"` on `<button>`.

**Exception**: `MainDoc.astro` uses `variant-${variant}` on its wrapper div (e.g., `variant-retro`).

### Token Files

| File | Contents |
|---|---|
| `tokens/colors.css` | `:root` light + `:root[data-theme="dark"]` dark. Primary/secondary/accent, bg/text/border, per-component colors for all 4 variants. |
| `tokens/typography.css` | Font families (sans/display/mono), heading/body sizes, per-variant link tokens. |
| `tokens/spacing.css` | `--space-1` through `--space-10`, border radii, shadow scale, retro/futuristic-specific tokens. |
| `tokens/components.css` | Per-component dimension/layout tokens (button padding, card radius, badge sizing, etc.). |

### Dark Theme

`:root[data-theme="dark"]` in `tokens/colors.css` overrides all color tokens including variant-specific ones. Toggled via `data-theme` attribute on `<html>` (persisted in `localStorage`).

### Variant Token Consumption

```css
/* Tokens (colors.css) */
--retro-button-bg: var(--bg-default);
--retro-shadow-color: #000000;
--futuristic-glow: rgba(79, 70, 229, 0.5);

/* Consumed in variant files */
button.retro {
  background-color: var(--retro-button-bg);
  box-shadow: var(--retro-shadow-offset) var(--retro-shadow-offset) 0 0 var(--retro-shadow-color);
}
```

## Content Layer Loader

### Factory: `createTranslationLoader()` in [src/database/loaders/factory.ts](../src/database/loaders/factory.ts)

Generic Astro Content Layer loader for multilingual database content.

```markdown
## Content Layer Loader (Planned)

Infrastructure for a custom Content Layer loader for multilingual database content is planned. Implementation will include:

- Generic `createTranslationLoader()` factory function to handle Drizzle-sourced content with translations.
- Entry format: `id: "${slug}-${lang}"` (e.g., `"my-post-fr"`).
- Non-fatal error handling: missing translations and transformer exceptions are logged and skipped.
- Integration with `content.config.ts` pending implementation.
```

- **`fetcher`**: Returns parent entities with populated `translations` array (from Drizzle `with` query).
- **`transformer`**: Receives entity (without translations) + single translation row → returns data shape.
- **`langField`**: Key on the translation object containing the language code. Defaults to `"inLanguage"`.

### Store Entry Format

```typescript
store.set({
  id: `${entity.slug}-${lang}`,   // e.g., "my-post-fr"
  data: { ...transformedData, slug: entity.slug, lang },
});
```

### Error Handling
All errors are non-fatal — missing translations, empty arrays, transformer exceptions are logged and skipped. The loader continues processing remaining entities.

### Status
The factory is defined and exported but not yet wired into a `content.config.ts`. It is infrastructure ready for content collections.

## Documentation System

### Architecture

The docs are a **component design system documentation site** built into the application itself. Every UI component, layout, and template has its own doc page with live demos, props tables, and code examples.

**Composition chain:**
```
DocLayout (3-column grid: sidebar | content | TOC)
  └── BaseLayout (full HTML document)
        └── <div class="doc-layout {variant}">
              ├── Sidebar (left, sticky)
              ├── MainDoc (center, <slot />, max-width 800px)
              └── Auto-generated TOC (right, sticky)
```

**Grid breakpoints:** 3 columns at >1200px, 2 columns (no TOC) at ≤1200px, single column at ≤768px.

### Page Structure

Docs exist in two locales only: `en` and `fr`. No `es`/`ar` docs.

```
src/pages/{locale}/docs/
├── design/         # 18 pages — UI atoms: alert, badge, button, card, code, dialog,
│                   #   dropdown, form, kbd, link, menudropdown, sheet, switch,
│                   #   table, tabs, tooltip, video + index
├── components/     # 9 pages — composites: accordion, avatar, breadcrumb, gallery,
│                   #   pagination, progressbar, skeleton, slider, timeline
├── layouts/        # 2 pages — base, doc
└── templates/      # 3 pages — footer, header, table-of-contents
```

**Content localization**: Full hand-written translations per locale. Each `.astro` file in `fr/docs/` is a manually-written French version of its `en/docs/` counterpart. This is **not** key-based — it is full file duplication with human translation.

### Doc Page Template

Every doc page follows this pattern:

```astro
---
import DocLayout from "@layouts/DocLayout.astro";
import { Code } from "astro:components";
// + UI component imports for live demos
// + Table imports for props documentation
---

<DocLayout title="Component Name" description="..." variant="initial">
  <h1 id="component-name">Component Name</h1>
  <p>Introduction</p>

  <h2 id="installation">Installation</h2>
  <Code lang="astro" code={`import ...`} />

  <h2 id="props">Props</h2>
  <Table striped><!-- props table using the project's own Table component --></Table>

  <h2 id="variants">Variants</h2>
  <!-- Live demos rendering actual components in all 4 variants -->
  <Component variant="initial" ... />
  <Component variant="retro" ... />
  <Component variant="modern" ... />
  <Component variant="futuristic" ... />
  <Code lang="astro" code={`<!-- code example -->`} />

  <h2 id="accessibility">Accessibility</h2>
  <h2 id="best-practices">Best Practices</h2>
</DocLayout>
```

**Conventions:**
- Live component demos render actual instances (not screenshots) in all 4 variants.
- Code examples use Astro's built-in `<Code>` component with template literals.
- Props tables use the project's own `Table` UI component (dogfooding).
- All `<h2>`/`<h3>` must have `id` attributes — DocLayout auto-extracts them for the right-column TOC.
- All current pages pass `variant="initial"` to DocLayout.

### Navigation

Hardcoded in [src/components/templates/docs/navigation.ts](../src/components/templates/docs/navigation.ts) — not filesystem-derived.

`getDocNavConfig(locale, t)` returns 8 sections:

| Section | i18n Key | Items |
|---|---|---|
| Getting Started | `docsSidebar.gettingStarted` | 1 (design index) |
| UI Atoms | `docsSidebar.uiAtoms` | 8 (alert, badge, button, input, kbd, link, switch, tooltip) |
| UI Blocks | `docsSidebar.uiBlocks` | 10 (accordion, avatar, breadcrumb, card, dialog, dropdown, form, tabs, toast, video) |
| UI Data | `docsSidebar.uiData` | 7 (code, pagination, progressbar, skeleton, table, timeline, sheet) |
| UI with JavaScript | `docsSidebar.uiWithJavascript` | 3 (gallery, dropdown, slider) |
| Variants | `docsSidebar.variants` | 4 (initial, retro, modern, futuristic) |
| Layouts | `docsSidebar.layouts` | 2 (base, doc) |
| Templates | `docsSidebar.templates` | 3 (footer, header, table-of-contents) |

**Note:** Navigation groups items semantically (Atoms / Blocks / Data / JS-dependent), not by directory. Components from both `design/` and `components/` can appear in the same nav group.

Sidebar labels and section titles are translated via `docsSidebar.*` keys in the i18n JSON files (38 keys in both `en.json` and `fr.json`).

### Dual TOC System

DocLayout provides **two TOC mechanisms**:

1. **Auto-generated right-column TOC** — DocLayout extracts `<h2>`/`<h3>` headings with `id` attributes from slot content via regex, renders a sticky aside.
2. **Manual inline `<TableOfContents>`** component — [src/components/templates/docs/TableOfContents.astro](../src/components/templates/docs/TableOfContents.astro) accepts `items: { label, href }[]`, renders inside page content with heavy per-variant styling (retro monospace, modern gradient blur, futuristic neon glow with scanning animation).

Some pages use both; some use only the auto-generated one.

### Docs Styling

No external docs CSS files — all docs styling is **scoped** inside template components:
- [DocLayout.astro](../src/layouts/DocLayout.astro): grid layout, right TOC styles
- [Sidebar.astro](../src/components/templates/docs/Sidebar.astro): navigation, active state, variant-specific styles (retro border/shadow, modern pill radius, futuristic glow)
- [TableOfContents.astro](../src/components/templates/docs/TableOfContents.astro): 305 lines of variant-aware styling
- [MainDoc.astro](../src/components/templates/docs/MainDoc.astro): `variant-${variant}` class on `<article>`, max-width 800px

The live component demos are styled by the global variant CSS files (`initial.css`, `retro.css`, `modern.css`, `futuristic.css`).

### Known Gaps

- **Missing pages**: `variants/` subdirectory pages (initial, retro, modern, futuristic), `input`, `toast` — navigation links to them but pages don't exist.
- **Hardcoded French in DocLayout**: Right-column TOC title says `"Sur cette page"` regardless of locale.
- **Unused i18n keys**: `docs.common.*` keys exist in `fr.json` (`docs.common.installation`, `docs.common.props`, etc.) but are not referenced by doc pages.

## Auto-Generated README

**`pnpm run readme:generate`** produces 4 README files from live project state. This is the primary mechanism to keep AI context up-to-date after any structural change.

### Output Files

| File | Language |
|---|---|
| `README.md` | English (default) |
| `README.fr.md` | French |
| `README.ar.md` | Arabic |
| `README.es.md` | Spanish |

### Generated Sections (in order)

| Section | Source | Generator |
|---|---|---|
| Overview | Hardcoded i18n translations | `i18n.ts` |
| Features | Hardcoded i18n translations | `i18n.ts` |
| Tech Stack | `package.json` → `dependencies` | `generateDeps.ts` |
| Installation / Scripts | `package.json` → `scripts` | `generateScripts.ts` |
| Project Structure | Recursive filesystem scan | `generateStructure.ts` |
| TypeScript Aliases | `tsconfig.json` → `compilerOptions.paths` | `generateStructure.ts` |
| Authentication | Hardcoded i18n translations | `i18n.ts` |
| Database | Regex parsing of `src/database/schemas/*.ts` | `generateDatabase.ts` |
| Environment Variables | `.env.example` (key extraction) | `generateEnv()` |
| CSS Tokens & Styles | Filesystem scan of `src/styles/tokens/` + `components/` | `generateStyles.ts` |
| Testing | Walks `tests/` + `src/` for `*.test.*` / `*.spec.*`, extracts `describe`/`it` titles | `generateTests.ts` |

### How It Works

- Entry: [scripts/readme-generate.ts](../scripts/readme-generate.ts) iterates over `['en', 'fr', 'ar', 'es']`.
- Each generator reads live data (filesystem, `package.json`, schema files, CSS tokens).
- TOC is auto-generated by regex-scanning `## ` headings from the assembled content.
- Multilingual: section headings and descriptions are translated in [scripts/readme/i18n.ts](../scripts/readme/i18n.ts). Data-derived sections (deps, structure, schemas, env, tests) are identical across locales.
- Helpers in [scripts/readme/helpers.ts](../scripts/readme/helpers.ts) (`githubSlug()` for anchor links) and [scripts/readme/utils.ts](../scripts/readme/utils.ts) (`PATHS`, `listTree()`, `readFile()`).

### When to Run

Run `pnpm run readme:generate` after:
- Adding/removing dependencies
- Adding/removing/renaming files or directories
- Changing database schemas
- Adding/removing CSS tokens or variant files
- Adding/removing test files
- Any structural change that an AI agent should know about

### Relationship to This File

- **`copilot-instructions.md`** (this file): manually curated, describes architecture decisions, conventions, prop patterns, auth model, testing rules — knowledge that cannot be auto-extracted.
- **`README.{lang}.md`**: auto-generated snapshot of what physically exists — dependencies, file tree, schema fields, CSS tokens, test inventories. Always current after running the script.

Both are complementary. The README reflects the **current state**; this file describes **how to work with it**.

## Key Files Reference

| Purpose | File |
|---|---|
| Astro config | [astro.config.mjs](../astro.config.mjs) |
| DB connection (singleton) | [src/database/drizzle.ts](../src/database/drizzle.ts) |
| Schema barrel | [src/database/schemas.ts](../src/database/schemas.ts) |
| Auth server | [src/lib/auth/auth.ts](../src/lib/auth/auth.ts) |
| Auth client | [src/lib/auth/auth-client.ts](../src/lib/auth/auth-client.ts) |
| Permissions (RBAC+ABAC) | [src/lib/auth/permissions.ts](../src/lib/auth/permissions.ts) |
| Input validation | [src/lib/auth/validate-user.ts](../src/lib/auth/validate-user.ts) |
| SMTP service | [src/lib/smtp/smtp.ts](../src/lib/smtp/smtp.ts) |
| Content loader factory | [src/database/loaders/factory.ts](../src/database/loaders/factory.ts) |
| Base layout | [src/layouts/BaseLayout.astro](../src/layouts/BaseLayout.astro) |
| CSS entry | [src/styles/global.css](../src/styles/global.css) |
| Test setup | [tests/setup.ts](../tests/setup.ts) |
| README generator | [scripts/readme-generate.ts](../scripts/readme-generate.ts) |
| README i18n | [scripts/readme/i18n.ts](../scripts/readme/i18n.ts) |
