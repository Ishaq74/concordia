# i18n Audit Report — `src/pages/[lang]/`

**Date:** 2025-01-XX  
**Branch:** `refactor/lang`  
**Total files audited:** 66 `.astro` files  
**Criteria:** (1) `getTranslations` usage, (2) Hardcoded strings, (3) `getLocalizedUrl` usage, (4) `Astro.params.lang` usage, (5) `console.log`, (6) Dynamic `import()` patterns

---

## Executive Summary

| Category | Files | getTranslations | getLocalizedUrl | Fully i18n compliant |
|---|---|---|---|---|
| Main pages (4) | 4 | 1/4 | 1/4 | 1/4 |
| Auth pages (8) | 8 | 8/8 | 7/8 | 0/8 (all have FR fallbacks) |
| Blog pages (4) | 4 | 1/4 | 0/4 | 0/4 |
| Organization pages (2) | 2 | 0/2 | 0/2 | 0/2 |
| Admin pages (5) | 5 | 5/5 | 0/5 | 0/5 |
| Admin Blog pages (8) | 8 | 1/8 | 0/8 | 0/8 |
| Docs pages (32) | 32 | 0/32 | 0/32 | 0/32 (documentation pages) |
| **TOTAL** | **66** | **16/66** | **8/66** | **1/66** |

**Only `index.astro` (homepage) is fully i18n compliant.**

---

## SEVERITY LEGEND

- 🔴 **CRITICAL** — No `getTranslations` import, all strings hardcoded
- 🟠 **HIGH** — Has `getTranslations` but many hardcoded strings remain
- 🟡 **MEDIUM** — Uses translations with French-only `??` fallbacks
- 🟢 **OK** — Properly internationalized
- ⚪ **INFO** — Documentation page (lower priority)

---

## 1. MAIN PAGES

### 🟢 `index.astro` (300 lines)

**Status:** Fully internationalized — reference implementation

- ✅ Imports `getTranslations` and `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`
- ✅ All UI text via `t.home.*` keys
- ✅ Links via `getLocalizedUrl()`
- ❌ No `console.log`
- ❌ No dynamic imports

**Minor:** Stat values ("150+", "2,000+", "30+", "45") are hardcoded numbers — could be data-driven but acceptable.

---

### 🔴 `about.astro` (214 lines)

**Status:** Zero i18n — all hardcoded English

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl` — uses `/${LANG}/blog` directly
- ✅ Uses `Astro.params.lang`

**Hardcoded strings (40+):**

| Line(s) | String | Suggested Key |
|---|---|---|
| ~20 | `"About — Concordia"` | `about.meta.title` |
| ~25 | `"Our Mission"` | `about.mission.title` |
| ~26 | `"Strengthening social bonds, locally."` | `about.mission.subtitle` |
| ~28 | `"Join the movement"` | `about.mission.cta` |
| ~30 | Section: `"Why Concordia?"` | `about.why.title` |
| ~31 | `"Technology serving human connection"` | `about.why.subtitle` |
| ~32-35 | `"Proximity"`, `"Solidarity"`, `"Commitment"`, `"Sustainability"` | `about.why.values.proximity`, `.solidarity`, `.commitment`, `.sustainability` |
| ~36-39 | `"Local Mapping"`, `"Mediation"`, `"Skills"`, `"Education & Health"` | `about.features.*` |
| ~40 | `"Our 4 Pillars"` | `about.pillars.title` |
| ~41 | `"The foundations of Concordia"` | `about.pillars.subtitle` |
| ~42 | `"Total Transparency"` | `about.pillars.transparency` |
| ~43 | `"Digital Ecology"` | `about.pillars.ecology` |
| ~44 | `"Inclusion for All"` | `about.pillars.inclusion` |
| ~45 | `"Our Core Values"` | `about.values.title` |
| ~46 | `"What we believe in"` | `about.values.subtitle` |
| ~47 | `"Our Impact"` | `about.impact.title` |
| ~48 | `"Numbers that speak"` | `about.impact.subtitle` |
| ~34 | `{ value: "12k+", label: "Mediations completed" }` | `about.impact.mediations` |
| ~35 | `{ value: "850", label: "Projects launched" }` | `about.impact.projects` |
| ~36 | `{ value: "45k", label: "Volunteer hours" }` | `about.impact.volunteers` |
| ~37 | `{ value: "94%", label: "Trust rate" }` | `about.impact.trust` |
| ~50 | `"Ready to make a difference?"` | `about.cta.title` |
| ~51 | `"Sign up"` | `about.cta.signup` |
| ~52 | `"Read the blog"` | `about.cta.blog` |

---

### 🔴 `contact.astro` (~200 lines)

**Status:** Zero i18n — all hardcoded English

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl` — uses `/${LANG}/blog`
- ✅ Uses `Astro.params.lang`

**Hardcoded strings (25+):**

| Line(s) | String | Suggested Key |
|---|---|---|
| title | `"Contact — Concordia"` | `contact.meta.title` |
| — | `"Contact"` | `contact.title` |
| — | `"A question, a suggestion, a partnership?"` | `contact.subtitle` |
| — | `"Feel free to write to us..."` | `contact.description` |
| — | `"Send us a message"` | `contact.form.title` |
| — | `"Full name"` | `contact.form.name.label` |
| — | `"Your name"` (placeholder) | `contact.form.name.placeholder` |
| — | `"Email"` | `contact.form.email.label` |
| — | `"your@email.com"` (placeholder) | `contact.form.email.placeholder` |
| — | `"Subject"` | `contact.form.subject.label` |
| — | `"Choose a subject"` | `contact.form.subject.placeholder` |
| — | `"General question"`, `"Report a bug"`, `"Partnership"`, `"Press"`, `"Other"` | `contact.form.subject.options.*` |
| — | `"Message"` | `contact.form.message.label` |
| — | `"Describe your inquiry…"` | `contact.form.message.placeholder` |
| — | `"Send message"` | `contact.form.submit` |
| — | `"Address"` | `contact.info.address` |
| — | `"Availability"` | `contact.info.availability` |
| — | `"Mon–Fri, 9am–6pm"` | `contact.info.hours` |
| — | `"FAQ"` | `contact.faq.title` |
| — | `"Check our knowledge base..."` | `contact.faq.description` |
| — | `"Read the blog"` | `contact.cta.blog` |

---

### 🟢 `profile.astro` (7 lines)

**Status:** Simple redirect — no i18n issues

- Redirects to `/${lang}/auth/profile`
- ✅ Uses `Astro.params.lang`

---

## 2. AUTH PAGES

### 🟡 `auth/forgot-password.astro`

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**French-only `??` fallback strings:**

| String | Suggested Key |
|---|---|
| `"Mot de passe oublié ?"` | `auth.forgotPassword.title` |
| `"Adresse email requise."` | `auth.forgotPassword.emailRequired` |
| `"Aucun compte trouvé avec cet email."` | `auth.forgotPassword.noAccount` |
| `"Erreur lors de l'envoi de l'email."` | `auth.forgotPassword.sendError` |
| `"Trop de tentatives. Réessayez plus tard."` | `auth.forgotPassword.rateLimited` |
| `"Erreur serveur ou réponse inattendue."` | `auth.forgotPassword.serverError` |
| `"Email envoyé."` | `auth.forgotPassword.success` |

---

### 🟠 `auth/invitations.astro`

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`
- 🔴 **BUG (line ~33):** Hardcoded redirect to `/fr/connexion?callbackURL=...` — uses French locale `/fr/` regardless of current language!

**Hardcoded French strings (15+):**

| String | Suggested Key |
|---|---|
| `"Retour au profil"` | `auth.invitations.backToProfile` |
| `"Mon profil"` | `auth.invitations.myProfile` |
| `"Consultez et répondez à vos invitations d'organisation."` | `auth.invitations.subtitle` |
| `"Invitation acceptée."` | `auth.invitations.accepted` |
| `"Invitation refusée."` | `auth.invitations.rejected` |
| `"Aucune invitation en attente."` | `auth.invitations.empty` |
| `"Organisation"`, `"Rôle:"`, `"Expire:"`, `"Invité par:"` | `auth.invitations.table.*` |
| `"Accepter"`, `"Refuser"` | `auth.invitations.accept`, `.reject` |
| `"Erreur inattendue."` | `auth.invitations.error` |
| `"Action impossible."` | `auth.invitations.actionImpossible` |

---

### 🟠 `auth/legal.astro` (701 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded French strings (100+):** Entire legal content is hardcoded in French:

| String | Suggested Key Pattern |
|---|---|
| `"Obligatoire"` | `auth.legal.required` |
| `"Mentions Légales"` | `auth.legal.tabs.mentions` |
| `"Politique de Confidentialité"` | `auth.legal.tabs.privacy` |
| `"Conditions Générales de vente"` | `auth.legal.tabs.terms` |
| Full legal text paragraphs | `auth.legal.mentions.content`, `auth.legal.privacy.content`, `auth.legal.terms.content` — consider CMS or MDX |

> **Recommendation:** Legal text should be stored in locale-specific MDX/Markdown files or CMS, not in the Astro template.

---

### 🟡 `auth/profile.astro` (678 lines)

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Extensively uses `translations.auth.*` keys
- ⚠️ French fallback strings used systematically

**Key French fallbacks:**

| String | Key Used |
|---|---|
| `"Profil"` | `translations.auth?.profile?.title ?? "Profil"` |
| `"Vérifié"` | `translations.auth?.profile?.verified ?? "Vérifié"` |
| `"Membre depuis"` | `translations.auth?.profile?.memberSince ?? "Membre depuis"` |
| `"Partager"`, `"Contacter"` | via `translations.auth?.profile?.share` etc. |
| `"Statistiques"`, `"Organisations"`, `"Articles"` | via `translations.auth?.profile?.*` |

**Issue (line ~248):** Uses `/${lang}/admin/blog/articles/new` instead of `getLocalizedUrl()`.

---

### 🟡 `auth/reset-password.astro`

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**French fallbacks:** `"Réinitialiser le mot de passe"`, `"Les mots de passe ne correspondent pas."`, `"Erreur lors de la réinitialisation."`, `"Erreur serveur."`

---

### 🟡 `auth/sign-in.astro`

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**French fallbacks:** `"Connexion"`, `"Email ou mot de passe incorrect."`, `"Votre email n'est pas encore vérifié..."`, `"Trop de tentatives..."`, `"Erreur serveur ou réponse inattendue."`

---

### 🟡 `auth/sign-up.astro`

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`
- ⚠️ References undefined `verifyEmailPageUrl` variable (potential bug)

**French fallbacks** throughout registration form.

---

### 🟡 `auth/verify-email.astro`

- ✅ Imports `getTranslations` + `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**French fallbacks** in `clientStrings` object.

---

## 3. BLOG PAGES

### 🟡 `blog/index.astro` (361 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl` — uses `/${lang}/blog/...` string interpolation
- ✅ Uses `Astro.params.lang`

**French fallback strings (15+):**

| String | Suggested Key |
|---|---|
| `"Blog"` | `blog.title` |
| `"Reportages, portraits et nouvelles..."` | `blog.subtitle` |
| `"Article à la une"` | `blog.featured` |
| `"Filtrer par catégorie"` | `blog.filterByCategory` |
| `"Tout"` | `blog.all` |
| `"Articles mis en avant"` | `blog.featuredArticles` |
| `"À la une"` | `blog.spotlight` |
| `"Tous les articles"` | `blog.allArticles` |
| `"Aucun article disponible..."` | `blog.noArticles` |
| `"Restez informé"` | `blog.newsletter.title` |
| `"Adresse email"` | `blog.newsletter.emailLabel` |
| `"votre@email.com"` | `blog.newsletter.placeholder` |
| `"S'abonner"` | `blog.newsletter.subscribe` |

---

### 🔴 `blog/[category].astro` (477 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl` — uses `/${LANG}/blog/...`
- ✅ Uses `Astro.params.lang`
- 🔴 **BUG (line ~98):** Breadcrumb `{ label: "Blog", href: "/blog" }` — missing language prefix!

**Hardcoded English strings (15+):**

| Line(s) | String | Suggested Key |
|---|---|---|
| — | `"All articles in the ${name} category"` | `blog.category.allArticles` |
| — | `"Discover the projects and ideas..."` | `blog.category.subtitle` |
| ~98 | `"Blog"` (breadcrumb) | `blog.breadcrumb.blog` |
| — | `"Featured"` | `blog.category.featured` |
| — | `"Recent articles"` | `blog.category.recent` |
| — | `"No other articles in this category..."` | `blog.category.empty` |
| — | `"Categories"` | `blog.category.sidebar.categories` |
| — | `"Popular tags"` | `blog.category.sidebar.tags` |
| — | `"Newsletter"` | `blog.newsletter.title` |
| — | `"Get the latest articles delivered..."` | `blog.newsletter.description` |
| — | `"your@email.com"`, `"Subscribe"` | `blog.newsletter.*` |

---

### 🔴 `blog/[category]/[slug].astro` (521 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl` — uses `/${LANG}/...`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings (10+):**

| String | Suggested Key |
|---|---|
| `"Home"` (breadcrumb) | `common.breadcrumb.home` |
| `"Blog"` (breadcrumb) | `common.breadcrumb.blog` |
| `"Author"` | `blog.article.author` |
| `"View profile"` | `blog.article.viewProfile` |
| `"Table of Contents"` | `blog.article.toc` |
| `"Related articles"` | `blog.article.related` |
| `"Newsletter"` | `blog.newsletter.title` |
| `"Don't miss any article, subscribe now!"` | `blog.newsletter.description` |
| `"Share this article"` | `blog.article.share` |

---

### 🔴 `blog/author/[slug].astro` (367 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings (15+):**

| String | Suggested Key |
|---|---|
| `"${author.name} — Author"` (title) | `blog.author.metaTitle` |
| `"Home"`, `"Blog"` (breadcrumbs) | `common.breadcrumb.*` |
| `"Author"` (badge) | `blog.author.badge` |
| `"Article/Articles"`, `"Category/Categories"` | `blog.author.stats.*` |
| `"Latest article"` | `blog.author.latestArticle` |
| `"Published articles"` | `blog.author.publishedArticles` |
| `"This author has not published any articles yet."` | `blog.author.noArticles` |
| `"Trust & Transparency"` | `blog.author.trust.title` |
| `"Verified profile"` | `blog.author.trust.verified` |
| `"Articles reviewed by the editorial team"` | `blog.author.trust.reviewed` |
| `"Active community member"` | `blog.author.trust.active` |
| `"Specialties"` | `blog.author.specialties` |
| `"No specialties listed."` | `blog.author.noSpecialties` |

---

## 4. ORGANIZATION PAGES

### 🔴 `organizations/index.astro` (281 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings (10+):**

| String | Suggested Key |
|---|---|
| `"Organizations"` | `organizations.title` |
| `"Discover the organizations that bring Concordia to life"` | `organizations.subtitle` |
| `"No organizations registered at the moment."` | `organizations.empty` |
| `"Featured"` | `organizations.featured` |
| `"members"` | `organizations.members` |
| `"Since {year}"` | `organizations.since` |
| `"Social link"` | `organizations.socialLink` |
| `"Discover"` | `organizations.discover` |

---

### 🔴 `organizations/[slug].astro` (734 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl` — uses `/${LANG}/...`
- ✅ Uses `Astro.params.lang`
- 🔴 **BUG:** Breadcrumb `{ label: "Organizations", href: "/organizations" }` — missing language prefix!

**Hardcoded English strings (30+):**

| String | Suggested Key |
|---|---|
| `"Organization"` | `org.badge` |
| `"Organizations"` (breadcrumb) | `org.breadcrumb` |
| `"Featured"` | `org.featured` |
| `"Founded in"` | `org.foundedIn` |
| `"members"` | `org.members` |
| `"About"` | `org.about` |
| `"Areas of expertise"` | `org.expertise` |
| `"Services offered"` | `org.services` |
| `"The Team"` | `org.team` |
| `"Recent articles"` | `org.recentArticles` |
| `"View all articles"` | `org.viewAllArticles` |
| `"Contact"` | `org.contact` |
| `"Statistics"` | `org.statistics` |
| `"reviews"`, `"Comments"`, `"Shares"`, `"Likes"` | `org.stats.*` |
| `"Authors"` | `org.authors` |
| `"Areas served"` | `org.areasServed` |
| `"Languages"` | `org.languages` |
| `"Founders"` | `org.founders` |
| `"Departments"` | `org.departments` |
| `"Transparency & Policies"` | `org.transparency.title` |
| `"Editorial charter"`, `"Ethics policy"`, `"Corrections policy"`, `"Diversity policy"`, `"Funding & ownership"` | `org.transparency.*` |

---

## 5. ADMIN PAGES

### 🟠 `admin/index.astro` (338 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl` — uses `/${currentLocale}/admin/...`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings despite having translations:**

| String | Suggested Key |
|---|---|
| `"Published articles"` | `admin.stats.published` |
| `"Drafts"` | `admin.stats.drafts` |
| `"Pending comments"` | `admin.stats.pendingComments` |
| `"Welcome,"` | `admin.welcome` |
| `"Administrator"` | `admin.role.administrator` |
| `"Latest articles"` | `admin.latestArticles` |
| `"View all"` | `admin.viewAll` |
| `"No articles yet."` | `admin.noArticles` |
| `"No recent activity."` | `admin.noActivity` |

---

### 🟠 `admin/audit/index.astro` (360 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings:**

| String | Suggested Key |
|---|---|
| `"entries"` | `admin.audit.entries` |
| `"Full history of administrative actions."` | `admin.audit.subtitle` |
| `"Filter by action"` | `admin.audit.filterByAction` |
| `"All actions"` | `admin.audit.allActions` |
| `"Filter"`, `"Reset"` | `admin.common.filter`, `.reset` |
| `"No entries in the log."` | `admin.audit.empty` |
| `"Date"`, `"Action"`, `"User"`, `"Target"`, `"IP"`, `"Details"`, `"View"` | `admin.audit.table.*` |

---

### 🟠 `admin/config/index.astro` (384 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl` — uses `${adminBase}/...`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings:**

| String | Suggested Key |
|---|---|
| `"General administration settings and role management."` | `admin.config.subtitle` |
| `"Overview"` | `admin.config.overview` |
| `"Total users"`, `"Administrators"`, `"Banned users"` | `admin.config.stats.*` |
| `"Roles and permissions"` | `admin.config.roles.title` |
| `"Full access to administration"`, `"Content and comments moderation"` etc. | `admin.config.roles.descriptions.*` |
| `"Security"` | `admin.config.security.title` |
| Security checklist items | `admin.config.security.items.*` |
| `"Quick actions"` | `admin.config.quickActions.title` |
| `"Manage users"`, `"Moderate content"`, `"View logs"`, `"Manage articles"` | `admin.config.quickActions.*` |

---

### 🟠 `admin/moderation/index.astro` (391 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings:**

| String | Suggested Key |
|---|---|
| `"Moderate visitor comments."` | `admin.moderation.subtitle` |
| `"Pending"`, `"Approved"`, `"Rejected"` | `admin.moderation.status.*` |
| `"Show all"` | `admin.moderation.showAll` |
| `"No comments to moderate."` | `admin.moderation.empty` |
| `"Author"`, `"Comment"`, `"Article"`, `"Status"`, `"Date"`, `"Actions"` | `admin.moderation.table.*` |
| `"Approve"`, `"Reject"` | `admin.moderation.approve`, `.reject` |

---

### 🟠 `admin/users/index.astro` (396 lines)

- ✅ Imports `getTranslations`
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings:**

| String | Suggested Key |
|---|---|
| `"total"` | `admin.users.total` |
| `"Manage user accounts, roles and access."` | `admin.users.subtitle` |
| `"Search"` | `admin.users.search` |
| `"Name, email or username…"` (placeholder) | `admin.users.searchPlaceholder` |
| `"Role"`, `"All roles"` | `admin.users.roleFilter.*` |
| `"Filter"`, `"Reset"` | `admin.common.filter`, `.reset` |
| `"No user found."` | `admin.users.empty` |
| `"User"`, `"Email"`, `"Status"`, `"Registration"`, `"Actions"` | `admin.users.table.*` |
| `"Active"`, `"Unverified"`, `"Banned"` | `admin.users.status.*` |

---

## 6. ADMIN BLOG PAGES

### 🔴 `admin/blog/articles/index.astro` (584 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings:**

| String | Suggested Key |
|---|---|
| `"Articles"` | `admin.blog.articles.title` |
| `"result"` / `"results"` | `admin.common.result` |
| `"New article"` | `admin.blog.articles.new` |
| `"Published"`, `"Draft"`, `"Scheduled"`, `"Archived"` | `admin.blog.status.*` |
| Column headers | `admin.blog.articles.table.*` |

---

### 🔴 `admin/blog/articles/new.astro` (694 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings (20+):**

| String | Suggested Key |
|---|---|
| `"New article"` | `admin.blog.articles.new.title` |
| `"Create an article with its translations..."` | `admin.blog.articles.new.subtitle` |
| `"Multilingual content"` | `admin.blog.form.multilingual` |
| `"Title *"` | `admin.blog.form.titleLabel` |
| `"Subtitle"` | `admin.blog.form.subtitle` |
| `"Excerpt *"` | `admin.blog.form.excerpt` |
| `"Content (Markdown) *"` | `admin.blog.form.content` |
| `"SEO Title"`, `"SEO Description"`, `"SEO Keywords"` | `admin.blog.form.seo.*` |
| `"Cover image"` | `admin.blog.form.coverImage` |
| `"Library"`, `"or"`, `"Upload"` | `admin.blog.form.media.*` |
| `"Publishing"` | `admin.blog.form.publishing` |
| `"Slug *"` | `admin.blog.form.slug` |
| `"Status"` | `admin.blog.form.status` |
| `"Main language"` | `admin.blog.form.mainLanguage` |
| `"Draft"`, `"Published"`, `"Scheduled"`, `"Archived"` | `admin.blog.status.*` |

---

### 🔴 `admin/blog/articles/[id]/edit.astro` (745 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Same hardcoded English as `new.astro` plus:**

| String | Suggested Key |
|---|---|
| `"Edit article"` | `admin.blog.articles.edit.title` |
| `"View on site"` | `admin.blog.articles.edit.viewOnSite` |

---

### 🔴 `admin/blog/authors/index.astro` (410 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English strings:**

| String | Suggested Key |
|---|---|
| `"Authors"` | `admin.blog.authors.title` |
| `"result"` / `"results"` | `admin.common.result` |
| `"New author"` | `admin.blog.authors.new` |
| `"Total"`, `"Featured"` | `admin.blog.authors.stats.*` |
| `"Search"`, `"Slug, name…"` | `admin.common.search` |
| `"No author found."` | `admin.blog.authors.empty` |
| `"Create an author"` | `admin.blog.authors.createCta` |

---

### 🔴 `admin/blog/authors/new.astro` (513 lines)

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded English/mixed strings:**

| String | Suggested Key |
|---|---|
| `"New author"` | `admin.blog.authors.new.title` |
| `"Create a multilingual author profile..."` | `admin.blog.authors.new.subtitle` |
| `"Display name *"` | `admin.blog.form.displayName` |
| `"First name"`, `"Last name"` | `admin.blog.form.firstName`, `.lastName` |
| `"Title / Role"` | `admin.blog.form.titleRole` |
| `"Biography"` | `admin.blog.form.biography` |
| `"Contact & social"` | `admin.blog.form.contactSocial` |
| `"Email"`, `"Website"` | `admin.blog.form.email`, `.website` |
| `"Social profiles (one per line)"` | `admin.blog.form.socialProfiles` |
| `"Photo / Avatar"` | `admin.blog.form.avatar` |
| `"Settings"` | `admin.blog.form.settings` |

---

### 🔴 `admin/blog/authors/[id]/edit.astro` (595 lines) — ⚠️ FRENCH

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded FRENCH strings (language mismatch with authors/new.astro which is English!):**

| String | Suggested Key |
|---|---|
| `"Modifier l'auteur"` | `admin.blog.authors.edit.title` |
| `"Voir sur le site"` | `admin.blog.authors.edit.viewOnSite` |
| `"Mettez à jour le profil..."` | `admin.blog.authors.edit.subtitle` |
| `"Contenu multilingue"` | `admin.blog.form.multilingual` |
| `"Nom affiché *"` | `admin.blog.form.displayName` |
| `"Prénom"`, `"Nom de famille"` | `admin.blog.form.firstName`, `.lastName` |
| `"Titre / Poste"` | `admin.blog.form.titleRole` |
| `"Biographie"` | `admin.blog.form.biography` |
| `"Contact & réseaux"` | `admin.blog.form.contactSocial` |
| `"Site web"` | `admin.blog.form.website` |
| `"Profils sociaux (un par ligne)"` | `admin.blog.form.socialProfiles` |

---

### 🔴 `admin/blog/categories/index.astro` (523 lines) — ⚠️ FRENCH

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded FRENCH strings:**

| String | Suggested Key |
|---|---|
| `"Catégories"` | `admin.blog.categories.title` |
| `"résultat"` / `"résultats"` | `admin.common.result` |
| `"Nouvelle catégorie"` | `admin.blog.categories.new` |
| `"Organisez les articles par catégories thématiques..."` | `admin.blog.categories.subtitle` |
| `"Accueil"`, `"Menu"`, `"Racine"` | `admin.blog.categories.tree.*` |
| `"Rechercher"`, `"Slug, nom…"` | `admin.common.search` |
| `"Toutes"`, `"Oui"`, `"Non"` | `admin.common.all`, `.yes`, `.no` |

---

### 🔴 `admin/blog/categories/new.astro` (588 lines) — ⚠️ FRENCH

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded FRENCH strings:**

| String | Suggested Key |
|---|---|
| `"Nouvelle catégorie"` | `admin.blog.categories.new.title` |
| `"Créez une catégorie avec des noms et descriptions multilingues..."` | `admin.blog.categories.new.subtitle` |
| `"Contenu multilingue"` | `admin.blog.form.multilingual` |
| `"Nom de la catégorie *"` | `admin.blog.form.categoryName` |
| `"Description"` | `admin.blog.form.description` |
| `"Image de couverture"` | `admin.blog.form.coverImage` |
| `"Bibliothèque"`, `"ou"`, `"Uploader"` | `admin.blog.form.media.*` |
| `"Aperçu"` | `admin.blog.form.preview` |
| `"Retirer l'image"` | `admin.blog.form.removeImage` |
| `"Paramètres"` | `admin.blog.form.settings` |
| `"Slug *"` | `admin.blog.form.slug` |
| `"Générer depuis le nom FR"` | `admin.blog.form.generateSlug` |
| `"Catégorie parente"` | `admin.blog.form.parentCategory` |
| `"Aucune (racine)"` | `admin.blog.form.noParent` |

---

### 🔴 `admin/blog/categories/[id]/edit.astro` (714 lines) — ⚠️ FRENCH

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Same hardcoded FRENCH as `categories/new.astro` plus:**

| String | Suggested Key |
|---|---|
| `"Modifier —"` | `admin.blog.categories.edit.title` |
| `"Voir sur le site"` | `admin.blog.categories.edit.viewOnSite` |

---

### 🔴 `admin/blog/comments/index.astro` (481 lines) — ⚠️ FRENCH

- ❌ NO `getTranslations` import
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded FRENCH strings:**

| String | Suggested Key |
|---|---|
| `"Commentaires"` (title) | `admin.blog.comments.title` |
| `"Vue d'ensemble et gestion de tous les commentaires."` | `admin.blog.comments.subtitle` |
| `"En attente"` | `admin.blog.comments.pending` |
| `"Approuvés"` | `admin.blog.comments.approved` |
| `"Rejetés"` | `admin.blog.comments.rejected` |
| `"Tout afficher"` | `admin.blog.comments.showAll` |
| `"Type de contenu"` | `admin.blog.comments.contentType` |
| `"Tous"` | `admin.common.all` |
| `"Filtrer"` | `admin.common.filter` |
| `"Aucun commentaire trouvé."` | `admin.blog.comments.empty` |
| `"Auteur"`, `"Contenu"`, `"Article"`, `"Type"`, `"Statut"`, `"Note"`, `"Langue"`, `"Date"`, `"Actions"` | `admin.blog.comments.table.*` |
| Status labels in `statusLabel()`: `"Approuvé"`, `"Rejeté"`, `"En attente"` | `admin.blog.status.*` |
| `"OK"`, `"Non"` (action buttons) | `admin.blog.comments.approve`, `.reject` |

---

### 🟠 `admin/blog/media/index.astro` (955 lines) — ⚠️ FRENCH

- ✅ Imports `getTranslations` (but does NOT use it!)
- ❌ NO `getLocalizedUrl`
- ✅ Uses `Astro.params.lang`

**Hardcoded FRENCH strings (30+):**

| String | Suggested Key |
|---|---|
| `"Bibliothèque de médias"` | `admin.blog.media.title` |
| `"Uploader"` | `admin.blog.media.upload` |
| `"Gérez les images et fichiers du blog."` | `admin.blog.media.subtitle` |
| `"Rechercher par nom de fichier…"` | `admin.blog.media.searchPlaceholder` |
| `"Tous les types"`, `"Images"`, `"Vidéos"`, `"Audio"` | `admin.blog.media.typeFilter.*` |
| `"Glissez vos fichiers ici ou cliquez pour parcourir"` | `admin.blog.media.dropzone` |
| `"JPEG, PNG, WebP, AVIF, GIF, SVG — Max 10 Mo par fichier"` | `admin.blog.media.formats` |
| `"Nom du fichier"` | `admin.blog.media.filename` |
| `"Texte alternatif (alt)"` | `admin.blog.media.altText` |
| `"Légende"`, `"Description"` | `admin.blog.media.caption`, `.description` |
| `"Annuler"`, `"Uploader sans métadonnées"` | `admin.blog.media.cancel`, `.skipMeta` |
| `"Upload en cours…"` | `admin.blog.media.uploading` |
| `"Chargement…"` | `admin.common.loading` |
| `"Détails du média"` | `admin.blog.media.details` |
| `"Fichier"`, `"Type"`, `"Date"`, `"URL"` | `admin.blog.media.meta.*` |
| `"Texte alternatif (FR)"`, `"Légende (FR)"`, `"Description (FR)"` | `admin.blog.media.fields.*` |
| `"Supprimer"` | `admin.common.delete` |
| `"Enregistrer"` | `admin.common.save` |

---

## 7. DOCS PAGES (32 files)

**Status:** ⚪ Technical documentation — lower i18n priority

All 32 docs pages follow the same pattern:
- ✅ Use `Astro.params.lang`
- ❌ None import `getTranslations`
- ❌ None use `getLocalizedUrl`
- All contain hardcoded English documentation text (component names, prop descriptions, usage examples)

**Files:**
- `docs/components/` (9): accordion, avatar, breadcrumb, gallery, pagination, progressbar, skeleton, slider, timeline
- `docs/design/` (18): alert, badge, button, card, code, dialog, dropdown, form, index, kbd, link, menudropdown, sheet, switch, table, tabs, tooltip, video
- `docs/layouts/` (2): base, doc
- `docs/templates/` (3): footer, header, table-of-contents

**Note:** `docs/design/code.astro` line 13 contains a `console.log` — this is inside a code example, not real logging.

**Recommendation:** These pages could be internationalized in a later phase. The text is technical documentation rather than user-facing content.

---

## CROSS-CUTTING ISSUES

### 1. 🔴 Broken Breadcrumb Links (Missing Language Prefix)

| File | Line | Broken Link |
|---|---|---|
| `blog/[category].astro` | ~98 | `{ label: "Blog", href: "/blog" }` |
| `organizations/[slug].astro` | — | `{ label: "Organizations", href: "/organizations" }` |

These breadcrumbs navigate to `/blog` and `/organizations` without the `/${lang}/` prefix, resulting in 404 errors.

### 2. 🔴 Hardcoded Locale in Redirect

| File | Line | Issue |
|---|---|---|
| `auth/invitations.astro` | ~33 | Redirects to `/fr/connexion` regardless of current locale |

### 3. 🟠 Language Inconsistency in Admin Pages

Admin blog pages have an inconsistent mix of languages:

| Language | Files |
|---|---|
| **English** | articles/index, articles/new, articles/edit, authors/index, authors/new |
| **French** | authors/edit, categories/index, categories/new, categories/edit, comments/index, media/index |

This indicates the pages were built at different times without a consistent i18n strategy.

### 4. 🟡 `getLocalizedUrl` Not Used for Internal Links

58 of 66 files do NOT use `getLocalizedUrl()`. Most construct URLs via string interpolation:
```
`/${lang}/blog/...`        // Common pattern
`/${currentLocale}/admin/...`  // Admin pattern
```
While functionally correct, this bypasses any centralized route management.

### 5. 🟡 French `??` Fallbacks in Auth Pages

All 8 auth pages use the pattern:
```js
translations.auth?.signIn?.title ?? "Connexion"
```
The fallback strings are always in French. If a translation key is missing, non-French users see French text.

### 6. ⚪ `console.log` — 1 occurrence

Only in `docs/design/code.astro` line 13 — inside a code example, not actual logging. **No action needed.**

### 7. ⚪ Dynamic `import()` — 0 occurrences

No dynamic import patterns found in any of the 66 files.

---

## PRIORITY ACTION PLAN

### Phase 1 — Critical Bugs (Immediate)
1. **Fix `auth/invitations.astro` line ~33** — Replace `/fr/connexion` with `/${lang}/connexion` or use `getLocalizedUrl()`
2. **Fix breadcrumbs** in `blog/[category].astro` and `organizations/[slug].astro` — add `/${lang}` prefix

### Phase 2 — High-Impact Public Pages
3. **`about.astro`** — Add `getTranslations`, extract all 40+ strings
4. **`contact.astro`** — Add `getTranslations`, extract all 25+ strings
5. **`blog/[category].astro`** — Add `getTranslations`, extract 15+ strings
6. **`blog/[category]/[slug].astro`** — Add `getTranslations`, extract 10+ strings
7. **`blog/author/[slug].astro`** — Add `getTranslations`, extract 15+ strings
8. **`organizations/index.astro`** — Add `getTranslations`, extract 10+ strings
9. **`organizations/[slug].astro`** — Add `getTranslations`, extract 30+ strings

### Phase 3 — Admin Pages
10. Add `getTranslations` to all 7 admin blog pages that lack it
11. Replace hardcoded strings in all 5 admin pages that partially use translations
12. Standardize language (currently mixed EN/FR)

### Phase 4 — Auth Page Fallbacks
13. Ensure all translation keys exist in all locale JSON files
14. Replace French `??` fallbacks with proper translations or neutral defaults

### Phase 5 — Documentation (Optional)
15. Internationalize docs/ pages if needed for multilingual documentation

---

## ESTIMATED WORK

| Phase | Files | Strings to Extract | Effort |
|---|---|---|---|
| Phase 1 (Bugs) | 3 | 3 fixes | 30 min |
| Phase 2 (Public) | 7 | ~145 strings | 2-3 days |
| Phase 3 (Admin) | 12 | ~120 strings | 2-3 days |
| Phase 4 (Fallbacks) | 8 | ~60 keys to verify | 1 day |
| Phase 5 (Docs) | 32 | ~500+ strings | 1-2 weeks |
| **Total** | **66** | **~830+ strings** | **~2 weeks** |
