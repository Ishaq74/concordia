# Astro CSS Drizzle Better Auth

[EN](./README.md) | [**FR**](./README.fr.md) | [AR](./README.ar.md) | [ES](./README.es.md)

Une application web moderne construite avec Astro, CSS, Drizzle ORM et Better Auth.

_Ce README est généré automatiquement pour fournir un contexte complet à l'IA._

## Sommaire

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Authentification](#authentification)
- [Base de données](#base-de-données)
- [Variables d'environnement](#variables-denvironnement)
- [Tokens CSS and Styles](#tokens-css-and-styles)
- [Tests](#tests)

## Vue d'ensemble

Ce projet démontre une application web full-stack utilisant des technologies modernes.

## Fonctionnalités

⚡ **Astro** - Génération de sites statiques rapide
🎨 **CSS** - Styling moderne
🗄️ **Drizzle ORM** - Requêtes de base de données type-safe
🔐 **Better Auth** - Authentification avancée
🌍 **i18n** - Support multilingue

## Stack technique

- **@astrojs/check**: `^0.9.6`
- **@astrojs/mdx**: `^4.3.13`
- **@astrojs/node**: `^9.5.3`
- **@astrojs/vercel**: `^9.0.4`
- **@babel/preset-typescript**: `^7.28.5`
- **@iconify-json/circle-flags**: `^1.2.10`
- **@iconify-json/mdi**: `^1.2.3`
- **@iconify-json/openmoji**: `^1.2.21`
- **astro**: `^5.17.2`
- **astro-font**: `^1.1.0`
- **astro-icon**: `^1.1.5`
- **better-auth**: `^1.4.17`
- **dotenv**: `^17.2.3`
- **drizzle-orm**: `^0.45.1`
- **jose**: `^6.1.3`
- **nanoid**: `^5.1.6`
- **nodemailer**: `^7.0.12`
- **pg**: `^8.17.2`
- **typescript**: `^5.9.3`
- **validator**: `^13.15.26`

## Installation

```bash
npm install
- `npm run dev`: astro dev
- `npm run build`: astro build
- `npm run preview`: astro preview
- `npm run build:node`: astro build --node
- `npm run preview:node`: astro preview --node
- `npm run astro`: astro
- `npm run sonda:report`: node scripts/run-sonda.mjs ./dist ./reports
- `npm run readme:generate`: tsx scripts/readme-generate.ts
- `npm run db:check`: tsx scripts/db/db.check.ts
- `npm run db:compare`: tsx scripts/db/db.compare.ts
- `npm run syncdb:dev-to-prod`: tsx scripts/db/db.sync.ts dev-to-prod
- `npm run syncdb:prod-to-dev`: tsx scripts/db/db.sync.ts prod-to-dev
- `npm run db:migrate`: tsx scripts/db/db.migrate.ts
- `npm run db:generate`: tsx scripts/db/db.generate.ts
- `npm run db:seed`: tsx scripts/db/db.seed.ts
- `npm run smtp:check`: tsx src/lib/smtp/smtp.check.ts
- `npm run test`: vitest
- `npm run test:watch`: vitest --watch
- `npm run test:ui`: vitest --ui
- `npm run test:coverage`: vitest --coverage
- `npm run test:unit`: vitest run tests/unit
- `npm run test:integration`: vitest run tests/integration --maxWorkers 1 --no-file-parallelism
- `npm run test:e2e`: vitest run tests/e2e
- `npm run test:security`: vitest run tests/e2e/security.test.ts
- `npm run test:api`: vitest run tests/e2e/api-auth.test.ts
- `npm run test:all`: vitest run
- `npm run test:debug`: vitest --inspect-brk --inspect --single-thread
- `npm run test:ci`: vitest run --coverage
```

## Structure du projet

```text
- astro.config.mjs
- concordia-specs.md
- drizzle-dev.config.ts
- drizzle-prod.config.ts
- package.json
- playwright.config.ts
- pnpm-lock.yaml
- pnpm-workspace.yaml
- **public**
  - favicon.svg
  - **fonts**
    - **Bowlby_One_SC**
      - BowlbyOneSC-Regular.ttf
    - **Palanquin_Dark**
      - PalanquinDark-Bold.ttf
      - PalanquinDark-Medium.ttf
      - PalanquinDark-Regular.ttf
      - PalanquinDark-SemiBold.ttf
  - **images**
    - **avatars**
      - camille-dupond.png
      - lucas-martin.png
      - sarah-leroy.png
    - placeholder.jpg
- README.ar.md
- README.es.md
- README.fr.md
- README.md
- **reports**
  - sonda-report.html
- **scripts**
  - **db**
    - db.check.ts
    - db.compare.ts
    - db.generate.ts
    - db.migrate.ts
    - db.seed.ts
    - db.sync.ts
  - debug-auth-api.ts
  - debug-auth-login.ts
  - debug-check-permission.ts
  - debug-rate-limit.ts
  - **readme**
    - generateDatabase.ts
    - generateDeps.ts
    - generateScripts.ts
    - generateStructure.ts
    - generateStyles.ts
    - generateTests.ts
    - helpers.ts
    - i18n.ts
    - utils.ts
  - readme-generate.ts
  - run-sonda.mjs
- **src**
  - **actions**
    - blog.ts
    - comments.ts
    - index.ts
  - **components**
    - **modules**
      - **blog**
        - **cards**
          - AuthorCard.astro
          - PostCard.astro
        - **lists**
          - PostGrid.astro
        - **single**
          - CommentItem.astro
          - PostComments.astro
          - PostContent.astro
          - PostFooter.astro
          - PostHeader.astro
          - TableOfContents.astro
        - **ui**
          - CategoryBadge.astro
          - ImageWithFallback.astro
          - PostMeta.astro
          - ShareButtons.astro
          - StarRating.astro
    - **templates**
      - **auth**
        - AuthLayout.astro
        - forgot-password.client.ts
        - ForgotPasswordForm.astro
        - ResetPasswordForm.astro
        - SignInCard.astro
        - SignUpCard.astro
        - verify-email.client.ts
        - VerifyEmailCard.astro
      - **blog**
        - BlogLayout.astro
        - MainBlog.astro
        - navigation.ts
        - Sidebar.astro
        - TableOfContents.astro
      - **docs**
        - MainDoc.astro
        - navigation.ts
        - Sidebar.astro
        - TableOfContents.astro
      - **Footer**
        - Footer.astro
      - **Header**
        - Brand.astro
        - Header.astro
        - LangChooser.astro
        - Navigation.astro
        - ThemeSwitch.astro
        - User.astro
    - **Tools**
      - Flex.astro
      - Grid.astro
      - SmartBreadcrumb.astro
    - **ui**
      - **Accordion**
        - Accordion.astro
        - AccordionItem.astro
      - AdCard.astro
      - Alert.astro
      - ArticleCard.astro
      - **Avatar**
        - Avatar.astro
        - AvatarCard.astro
        - AvatarGroup.astro
      - Badge.astro
      - **Breadcrumb**
        - Breadcrumb.astro
        - BreadcrumbEllipsis.astro
        - BreadcrumbItem.astro
        - BreadcrumbLink.astro
        - BreadcrumbList.astro
        - BreadcrumbPage.astro
        - BreadcrumbSeparator.astro
        - index.ts
      - Button.astro
      - **Card**
        - Card.astro
        - CardContent.astro
        - CardDescription.astro
        - CardFooter.astro
        - CardHeader.astro
        - CardImage.astro
        - CardMeta.astro
      - **Dialog**
        - Dialog.astro
        - DialogClose.astro
        - DialogContent.astro
        - DialogDescription.astro
        - DialogFooter.astro
        - DialogHeader.astro
        - DialogTitle.astro
        - DialogTrigger.astro
      - Dropdown.astro
      - EventCard.astro
      - **Form**
        - Checkbox.astro
        - DatePicker.astro
        - FormCard.astro
        - FormGroup.astro
        - Input.astro
        - Label.astro
        - PasswordInput.astro
        - Radio.astro
        - Select.astro
        - Switch.astro
        - Textarea.astro
      - FundingCampaignCard.astro
      - Gallery.astro
      - GroupCard.astro
      - Kbd.astro
      - Link.astro
      - Map.astro
      - MenuDropdown.astro
      - Pagination.astro
      - PlaceCard.astro
      - ProductCard.astro
      - ProgressBar.astro
      - SearchBar.astro
      - SearchFilter.astro
      - ServiceCard.astro
      - **Sheet**
        - Sheet.astro
        - SheetClose.astro
        - SheetContent.astro
        - SheetDescription.astro
        - SheetFooter.astro
        - SheetHeader.astro
        - SheetTitle.astro
        - SheetTrigger.astro
      - Sheet.astro
      - Skeleton.astro
      - **Slider**
        - Slider.astro
        - SliderItem.astro
      - **Table**
        - Table.astro
        - TableBody.astro
        - TableCaption.astro
        - TableCell.astro
        - TableFoot.astro
        - TableHead.astro
        - TableHeader.astro
        - TableRow.astro
      - **Tabs**
        - Tab.astro
        - TabPanel.astro
        - Tabs.astro
      - ThreadCard.astro
      - Timeline.astro
      - Tooltip.astro
      - Video.astro
      - VolunteerProjectCard.astro
  - content.config.ts
  - **database**
    - **admin**
      - loaders.ts
    - **data**
      - 01-user.data.ts
      - 02-blog_authors.data.ts
      - 03-blog_categories.data.ts
      - 05-blog_media.data.ts
      - 06-blog_organization.data.ts
      - 07-blog_posts.data.ts
      - 07-blog_post_authors.data.ts
      - 10-blog_translations.data.ts
    - drizzle.ts
    - **loaders**
      - blog.ts
      - factory.ts
    - **migrations**
      - 0008_smiling_landau.sql
      - **meta**
        - 0008_snapshot.json
        - _journal.json
    - **schemas**
      - audit-log.schema.ts
      - auth-schema.ts
      - blog_authors.schema.ts
      - blog_categories.schema.ts
      - blog_comments.schema.ts
      - blog_media.schema.ts
      - blog_organization.schema.ts
      - blog_posts.schema.ts
      - blog_translations.schema.ts
      - comments.schema.ts
    - schemas.ts
  - env.d.ts
  - **i18n**
    - ar.json
    - en.json
    - es.json
    - fr.json
  - **layouts**
    - BaseLayout.astro
    - DashboardLayout.astro
    - DocLayout.astro
  - **lib**
    - **admin**
      - config.ts
      - history.ts
      - loaders.ts
      - organizations.ts
      - permissions.ts
      - policy-store.ts
      - users.ts
    - **auth**
      - auth-client.ts
      - auth.test.ts
      - auth.ts
      - permissions.test.ts
      - permissions.ts
      - roles.ts
      - validate-user.ts
    - **i18n**
      - locale-url.ts
    - **notifications**
      - notifications.ts
    - **smtp**
      - smtp.check.ts
      - smtp.ts
    - types.ts
    - **wallet**
      - wallet.ts
  - middleware.ts
  - **pages**
    - 404.astro
    - 500.astro
    - **api**
      - **admin**
        - moderate.ts
        - organizations.ts
        - roles.ts
        - users.ts
      - **auth**
        - [...all].ts
      - **auth-client**
        - forgot-password.ts
        - verification.ts
      - **profile**
        - index.ts
    - **ar**
      - index.astro
    - **en**
      - **docs**
        - **components**
          - accordion.astro
          - avatar.astro
          - breadcrumb.astro
          - gallery.astro
          - pagination.astro
          - progressbar.astro
          - skeleton.astro
          - slider.astro
          - timeline.astro
        - **design**
          - alert.astro
          - badge.astro
          - button.astro
          - card.astro
          - code.astro
          - dialog.astro
          - dropdown.astro
          - form.astro
          - index.astro
          - kbd.astro
          - link.astro
          - menudropdown.astro
          - sheet.astro
          - switch.astro
          - table.astro
          - tabs.astro
          - tooltip.astro
          - video.astro
        - **layouts**
          - base.astro
          - doc.astro
        - **templates**
          - footer.astro
          - header.astro
          - table-of-contents.astro
      - index.astro
    - **es**
      - index.astro
    - **fr**
      - **auth**
        - connexion.astro
        - inscription.astro
        - invitations.astro
        - legal.astro
        - mot-de-passe-oublie.astro
        - profil.astro
        - reinitialiser-mot-de-passe.astro
        - verifier-email.astro
      - **blog**
        - **auteur**
          - [slug].astro
        - index.astro
        - **[category]**
          - [slug].astro
        - [category].astro
      - **docs**
        - **components**
          - accordion.astro
          - avatar.astro
          - breadcrumb.astro
          - gallery.astro
          - pagination.astro
          - progressbar.astro
          - skeleton.astro
          - slider.astro
          - timeline.astro
        - **design**
          - alert.astro
          - badge.astro
          - button.astro
          - card.astro
          - code.astro
          - dialog.astro
          - dropdown.astro
          - form.astro
          - index.astro
          - kbd.astro
          - link.astro
          - menudropdown.astro
          - sheet.astro
          - switch.astro
          - table.astro
          - tabs.astro
          - tooltip.astro
          - video.astro
        - **layouts**
          - base.astro
          - doc.astro
        - **templates**
          - footer.astro
          - header.astro
          - table-of-contents.astro
      - index.astro
  - **styles**
    - base.css
    - **components**
      - futuristic.css
      - initial.css
      - modern.css
      - retro.css
    - global.css
    - **tokens**
      - colors.css
      - components.css
      - spacing.css
      - typography.css
- **tests**
  - **a11y**
    - a11y-performance.test.ts
    - a11y-utils.ts
  - **api**
  - **config**
    - test-db.ts
    - test-env.ts
  - **e2e**
    - critical-flows.test.ts
  - **fixtures**
    - auth-fixtures.ts
    - security-payloads.ts
  - **hooks**
  - **integration**
    - auth-emails.test.ts
    - auth-flow.test.ts
    - comments.test.ts
    - **loaders**
      - blog-loader.test.ts
  - **pages**
    - README.md
  - README.md
  - **security**
    - security.test.ts
  - setup.ts
  - **ssr**
    - ssr-hydration-errors.test.ts
    - ssr-utils.ts
  - **templates**
  - **ui**
    - AdCard.astro.test.ts
    - Alert.astro.test.ts
    - ArticleCard.astro.test.ts
    - Avatar.astro.test.ts
    - Badge.astro.test.ts
    - Breadcrumb.astro.test.ts
    - Button.astro.test.ts
    - Card.astro.test.ts
    - Dialog.astro.test.ts
    - Dropdown.astro.test.ts
    - EventCard.astro.test.ts
    - FundingCampaignCard.astro.test.ts
    - Gallery.astro.test.ts
    - GroupCard.astro.test.ts
    - Kbd.astro.test.ts
    - Link.astro.test.ts
    - Map.astro.test.ts
    - MenuDropdown.astro.test.ts
    - Pagination.astro.test.ts
    - PlaceCard.astro.test.ts
    - ProductCard.astro.test.ts
    - ProgressBar.astro.test.ts
    - ServiceCard.astro.test.ts
    - Sheet.astro.test.ts
    - Skeleton.astro.test.ts
    - ThreadCard.astro.test.ts
    - Timeline.astro.test.ts
    - Tooltip.astro.test.ts
  - **unit**
    - **loaders**
      - factory.test.ts
    - smtp.test.ts
    - validation.test.ts
  - **utils**
    - api-helpers.ts
    - auth-test-utils.ts
    - cleanup.ts
- tsconfig.json
- vitest.config.ts
```

### Alias TypeScript (tsconfig.json)

- `@/*` → `src/*`
- `@database/*` → `src/database/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@lib/*` → `src/lib/*`
- `@styles/*` → `src/styles/*`
- `@templates/*` → `src/components/templates/*`
- `@assets/*` → `src/assets/*`
- `@api/*` → `src/pages/api/*`
- `@images/*` → `public/images/*`
- `@smtp/*` → `src/lib/smtp/*`
- `@i18n/*` → `src/i18n/*`
- `@tests/*` → `tests/*`

## Authentification

Better Auth est configuré avec des plugins pour OAuth, gestion de sessions, et plus.

## Base de données

- **auth-schema.ts**
  - Table _user_ (const _user_)
    - Champ : _id_ `(text)`
    - Champ : _name_ `(text)`
    - Champ : _email_ `(text)`
    - Champ : _emailVerified_ `(boolean)`
    - Champ : _image_ `(text)`
    - Champ : _createdAt_ `(timestamp)`
    - Champ : _updatedAt_ `(timestamp)`
    - Champ : _username_ `(text)`
    - Champ : _displayUsername_ `(text)`
    - Champ : _role_ `(text)`
    - Champ : _banned_ `(boolean)`
    - Champ : _banReason_ `(text)`
    - Champ : _banExpires_ `(timestamp)`
  - Table _account_ (const _account_)
    - Champ : _id_ `(text)`
    - Champ : _accountId_ `(text)`
    - Champ : _providerId_ `(text)`
    - Champ : _userId_ `(text)`
  - Table _verification_ (const _verification_)
    - Champ : _id_ `(text)`
    - Champ : _identifier_ `(text)`
    - Champ : _value_ `(text)`
    - Champ : _expiresAt_ `(timestamp)`
    - Champ : _usedAt_ `(timestamp)`
    - Champ : _createdAt_ `(timestamp)`
    - Champ : _updatedAt_ `(timestamp)`
  - Table _organization_ (const _organization_)
    - Champ : _id_ `(text)`
    - Champ : _name_ `(text)`
    - Champ : _slug_ `(text)`
    - Champ : _logo_ `(text)`
    - Champ : _createdAt_ `(timestamp)`
    - Champ : _metadata_ `(text)`
  - Table _member_ (const _member_)
    - Champ : _id_ `(text)`
    - Champ : _organizationId_ `(text)`
  - Table _invitation_ (const _invitation_)
    - Champ : _id_ `(text)`
    - Champ : _organizationId_ `(text)`

## Variables d'environnement

- `USE_DB_TEST`
- `USE_PROD_DB`
- `DATABASE_URL_LOCAL`
- `DATABASE_URL_TEST`
- `DATABASE_URL_PROD`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `SMTP_PROVIDER`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `NODE_ENV`
- `RESEND_API_KEY`
- `PUBLIC_API_URL`

## Tokens CSS and Styles

### Tokens CSS

#### Colors

Variables: `244`

```css
--color-primary: #eab308;
--color-secondary: #8b5cf6;
--color-accent: #ec4899;
--color-success: #16a34a;
--color-warning: #f97316;
/* ... 239 autres variables */
```

#### Spacing

Variables: `28`

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
/* ... 23 autres variables */
```

#### Typography

Variables: `26`

```css
--font-family-sans: "Plus Jakarta Sans", "Inter", sans-serif;
--font-family-display: "Space Grotesk", sans-serif;
--font-family-mono: "Space Mono", monospace;
--font-size-base: 1rem;
--line-height-base: 1.5;
/* ... 21 autres variables */
```

#### Components

Variables: `78`

```css
--button-padding-y: var(--space-2);
--button-padding-x: var(--space-4);
--button-border-radius: var(--border-radius-md);
--button-border-width: 1px;
--button-bg: var(--button-default-bg);
/* ... 73 autres variables */
```

### Composants de style

Thèmes de styles disponibles :

- **Initial** (`initial.css`)
- **Modern** (`modern.css`)
- **Retro** (`retro.css`)
- **Futuristic** (`futuristic.css`)

### Styles de base

- `base.css`- `global.css`

## Tests

Les tests sont configurés avec Vitest (unitaires/intégration) et Playwright (E2E). Le dépôt inclut des fichiers de configuration, des helpers et des suites d'exemple pour l'auth, la base de données, les routes API et les flows UI.

### Recommended test configs and files

- **a11y**
  - a11y-performance.test.ts
  - a11y-utils.ts
- **api**
- **config**
  - test-db.ts
  - test-env.ts
- **e2e**
  - critical-flows.test.ts
- **fixtures**
  - auth-fixtures.ts
  - security-payloads.ts
- **hooks**
- **integration**
  - auth-emails.test.ts
  - auth-flow.test.ts
  - comments.test.ts
  - **loaders**
    - blog-loader.test.ts
- **pages**
  - README.md
- README.md
- **security**
  - security.test.ts
- setup.ts
- **ssr**
  - ssr-hydration-errors.test.ts
  - ssr-utils.ts
- **templates**
- **ui**
  - AdCard.astro.test.ts
  - Alert.astro.test.ts
  - ArticleCard.astro.test.ts
  - Avatar.astro.test.ts
  - Badge.astro.test.ts
  - Breadcrumb.astro.test.ts
  - Button.astro.test.ts
  - Card.astro.test.ts
  - Dialog.astro.test.ts
  - Dropdown.astro.test.ts
  - EventCard.astro.test.ts
  - FundingCampaignCard.astro.test.ts
  - Gallery.astro.test.ts
  - GroupCard.astro.test.ts
  - Kbd.astro.test.ts
  - Link.astro.test.ts
  - Map.astro.test.ts
  - MenuDropdown.astro.test.ts
  - Pagination.astro.test.ts
  - PlaceCard.astro.test.ts
  - ProductCard.astro.test.ts
  - ProgressBar.astro.test.ts
  - ServiceCard.astro.test.ts
  - Sheet.astro.test.ts
  - Skeleton.astro.test.ts
  - ThreadCard.astro.test.ts
  - Timeline.astro.test.ts
  - Tooltip.astro.test.ts
- **unit**
  - **loaders**
    - factory.test.ts
  - smtp.test.ts
  - validation.test.ts
- **utils**
  - api-helpers.ts
  - auth-test-utils.ts
  - cleanup.ts
- **src/lib**
- **admin**
  - config.ts
  - history.ts
  - loaders.ts
  - organizations.ts
  - permissions.ts
  - policy-store.ts
  - users.ts
- **auth**
  - auth-client.ts
  - auth.test.ts
  - auth.ts
  - permissions.test.ts
  - permissions.ts
  - roles.ts
  - validate-user.ts
- **i18n**
  - locale-url.ts
- **notifications**
  - notifications.ts
- **smtp**
  - smtp.check.ts
  - smtp.ts
- types.ts
- **wallet**
  - wallet.ts
- **src/database**
- **admin**
  - loaders.ts
- **data**
  - 01-user.data.ts
  - 02-blog_authors.data.ts
  - 03-blog_categories.data.ts
  - 05-blog_media.data.ts
  - 06-blog_organization.data.ts
  - 07-blog_posts.data.ts
  - 07-blog_post_authors.data.ts
  - 10-blog_translations.data.ts
- drizzle.ts
- **loaders**
  - blog.ts
  - factory.ts
- **migrations**
  - 0008_smiling_landau.sql
  - **meta**
    - 0008_snapshot.json
    - _journal.json
- **schemas**
  - audit-log.schema.ts
  - auth-schema.ts
  - blog_authors.schema.ts
  - blog_categories.schema.ts
  - blog_comments.schema.ts
  - blog_media.schema.ts
  - blog_organization.schema.ts
  - blog_posts.schema.ts
  - blog_translations.schema.ts
  - comments.schema.ts
- schemas.ts
- **src/pages/api**
- **admin**
  - moderate.ts
  - organizations.ts
  - roles.ts
  - users.ts
- **auth**
  - [...all].ts
- **auth-client**
  - forgot-password.ts
  - verification.ts
- **profile**
  - index.ts

#### Test file summaries

- `src\lib\auth\auth.test.ts`
  - **Auth - Security & Functionality**
  - **Inscription Sécurisée**
    - crée utilisateur avec password fort
    - rejète email homograph attack
    - limite longueur champs
  - **Password Security**
    - hash password différent pour même password
  - **Connexion Sécurisée**
    - JWT a claims sécurisés
    - .');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        expect(payload.sub ?? payload.userId ?? login.user.id).toBeDefined();
        expect(payload.iat ?? payload.issuedAt).toBeDefined();
      } else {
        // Session-based token (not JWT) — verify token and user exist
        expect(login.token).toBeDefined();
        expect(login.user.id).toBeDefined();
      }
    });

    it('rejète timing attack (temps similaire)
    - rate limit après 5 échecs
    - session unique par device
  - **Email Verification**
    - envoie email avec token sécurisé
    - token verification à usage unique
  - **Password Reset**
    - token reset expire
    - token reset à usage unique
    - notification email si password changé
  - **Logout & Session**
    - logout invalide token
    - session expire après inactivité
  - **Audit & Logging**
    - log création utilisateur
    - log échec connexion

- `src\lib\auth\permissions.test.ts`
  - **RBAC/ABAC Security**
  - **ABAC - Attribute Based**
    - owner: ressource own vs other
    - member: accès projet org uniquement
    - time-based restrictions
    - IP-based restrictions
  - **Privilege Escalation Prevention**
    - user ne peut pas s\'auto-promouvoir
    - owner ne peut pas supprimer owner
  - **Edge Cases**
    - rôle inexistant = deny
    - permission inexistante = deny
    - context manquant pour ABAC = deny

- `tests\a11y\a11y-performance.test.ts`
  - **Accessibilité**
  - **Performance**

- `tests\e2e\critical-flows.test.ts`
  - **Parcours critique - Connexion**
  - **Parcours critique - Inscription**
  - **Parcours critique - Multi-variant**
  - **Parcours critique - Erreurs serveur**

- `tests\integration\auth-emails.test.ts`
  - **BetterAuth Email Functions**
  - **Email Verification**
    - should have email verification config
    - should call sendVerificationEmail without error
    - should log mock SMTP when email verification is called
  - **Password Reset**
    - should have sendResetPassword config
    - should call sendResetPassword without error
    - should log mock SMTP when password reset is called

- `tests\integration\auth-flow.test.ts`
  - **Auth — critical integration tests**
    - sign-up creates user and audit log
    - sign-in returns token for valid credentials
    - sign-in with invalid password logs login_failed
    - duplicate sign-up is rejected

- `tests\integration\comments.test.ts`
  - **Comments actions (createComment)**
    - throws UNAUTHORIZED when no user in context
    - inserts comment into DB with correct fields (root comment)
    - inserts comment with parentId when reply

- `tests\integration\loaders\blog-loader.test.ts`
  - **loadBlogPosts (integration via mocked DB)**
    - transforms DB row into content store entries (slug-lang ids)
    - handles multiple translations and languages
    - logs error and continues if transformer throws
    - logs error on missing lang key in translation
    - logs error if two translations produce same id

- `tests\security\security.test.ts`
  - **RBAC/ABAC**
    - refuse accès admin sans rôle
    - autorise accès admin avec rôle
    - refuse escalade de privilège
  - **XSS**
    - rejette payload XSS dans formulaire
  - **Injection**
    - rejette payload SQLi
    - rejette payload NoSQLi
  - **Escalade**
    - refuse modification de rôle sans autorisation

- `tests\ssr\ssr-hydration-errors.test.ts`
  - **SSR rendering**
    - renders all pages correctly on server
    - renders with all variants and locales
  - **Hydration**
    - hydrates interactive islands only
  - **Server errors**
    - returns 500 for uncaught exceptions
    - returns 404 for unknown routes

- `tests\ui\AdCard.astro.test.ts`

- `tests\ui\Alert.astro.test.ts`

- `tests\ui\ArticleCard.astro.test.ts`

- `tests\ui\Avatar.astro.test.ts`
  - **Avatar.astro**
    - renders with default props and slot
    - applies variant and className props
    - renders alt text for accessibility

- `tests\ui\Badge.astro.test.ts`

- `tests\ui\Breadcrumb.astro.test.ts`
  - **Breadcrumb.astro**
    - renders breadcrumb items from slot
    - applies variant and className props
    - renders aria-label for accessibility

- `tests\ui\Button.astro.test.ts`

- `tests\ui\Card.astro.test.ts`
  - **Card.astro**
    - renders slot content and default classes
    - applies variant and color props
    - renders with role and aria-label for a11y

- `tests\ui\Dialog.astro.test.ts`
  - **Dialog.astro**
    - renders slot content and dialog role
    - applies variant and className props
    - renders aria-modal for accessibility

- `tests\ui\Dropdown.astro.test.ts`
  - **Dropdown.astro**
    - renders slot content and default classes
    - applies variant and color props
    - renders with aria-haspopup for accessibility

- `tests\ui\EventCard.astro.test.ts`

- `tests\ui\FundingCampaignCard.astro.test.ts`

- `tests\ui\Gallery.astro.test.ts`

- `tests\ui\GroupCard.astro.test.ts`

- `tests\ui\Kbd.astro.test.ts`

- `tests\ui\Link.astro.test.ts`

- `tests\ui\Map.astro.test.ts`

- `tests\ui\MenuDropdown.astro.test.ts`

- `tests\ui\Pagination.astro.test.ts`

- `tests\ui\PlaceCard.astro.test.ts`

- `tests\ui\ProductCard.astro.test.ts`

- `tests\ui\ProgressBar.astro.test.ts`

- `tests\ui\ServiceCard.astro.test.ts`

- `tests\ui\Sheet.astro.test.ts`

- `tests\ui\Skeleton.astro.test.ts`

- `tests\ui\ThreadCard.astro.test.ts`

- `tests\ui\Timeline.astro.test.ts`

- `tests\ui\Tooltip.astro.test.ts`

- `tests\unit\loaders\factory.test.ts`
  - **createTranslationLoader (unit)**
    - stores translated entries with id "slug-lang" and includes slug/lang in data
    - logs and continues when translations missing or empty
    - logs error and continues if transformer throws
    - handles multiple translations and languages
    - logs error on missing lang key in translation
    - logs error if two translations produce same id

- `tests\unit\smtp.test.ts`
  - **SmtpService Unit Tests**
  - **Basic Email Sending**
    - should send valid email
    - should send email with HTML
    - should send email with custom from
    - should send email with replyTo
  - **Email Validation**
    - should reject invalid recipient email
    - should reject invalid sender email
    - should require subject
    - should require content (text or html)
    - should reject subject longer than 998 chars
    - should accept valid email: <user@example.com>
  - **Security - XSS Protection**
  - **Security - SQL Injection**
  - **Security - Null Bytes**
    - should accept valid email without null byte: <user@example.com>
  - **Batch Operations**
    - should send batch emails
    - should batch with custom concurrency
    - should handle mixed valid and invalid emails in batch
  - **Connection Management**
    - should verify connection
    - should close connection
    - should return config
  - **Error Handling**
    - should handle timeout gracefully
    - should classify auth errors

- `tests\unit\validation.test.ts`
  - **Input Validation Unit Tests**
  - **Email Validation**
    - should accept valid email: <user@example.com>
  - **Password Validation**
  - **Username Validation**
    - should accept valid usernames
    - should reject invalid usernames
  - **Subject Line Validation**
    - should accept valid subjects
    - should reject empty subject
    - should reject oversized subject
  - **Null Byte Detection**
  - **SQL Injection Detection**
  - **XSS Detection**
  - **Command Injection Detection**
  - **Path Traversal Detection**
  - **LDAP Injection Detection**
  - **XML Injection Detection**
  - **Buffer Overflow Detection**
  - **NoSQL Injection Detection**
    - should detect NoSQL injection objects
  - **Unicode Normalization**
  - **Data Type Validation**
    - should validate email is string
    - should validate password is string
    - should reject email as non-string
    - should reject password as non-string
  - **Required Fields Validation**
    - should require email
    - should require password
    - should require username
    - should accept all required fields
  - **Whitespace Handling**
    - should trim whitespace from username
    - should reject username with only whitespace
    - should preserve internal whitespace
  - **Case Sensitivity**
    - should handle email case insensitivity
    - should handle password case sensitivity
  - **Special Characters**
    - should allow special characters in password
    - should allow dots in email local part
    - should reject special characters in username
