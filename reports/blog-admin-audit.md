# Blog Admin Pages — Comprehensive Audit Report

> **Purpose**: Document every UX pattern, component, data flow, and convention used across all 11 blog admin pages so the services admin pages can match this quality exactly.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Shared Conventions](#2-shared-conventions)
3. [Page-by-Page Audit](#3-page-by-page-audit)
   - 3.1 [articles/index.astro](#31-articlesindexastro-597-lines)
   - 3.2 [articles/new.astro](#32-articlesnewastro-705-lines)
   - 3.3 [articles/[id]/edit.astro](#33-articlesideditastro-759-lines)
   - 3.4 [categories/index.astro](#34-categoriesindexastro-525-lines)
   - 3.5 [categories/new.astro](#35-categoriesnewastro-596-lines)
   - 3.6 [categories/[id]/edit.astro](#36-categoriesideditastro-727-lines)
   - 3.7 [authors/index.astro](#37-authorsindexastro-420-lines)
   - 3.8 [authors/new.astro](#38-authorsnewastro-521-lines)
   - 3.9 [authors/[id]/edit.astro](#39-authorsideditastro-607-lines)
   - 3.10 [comments/index.astro](#310-commentsindexastro-483-lines)
   - 3.11 [media/index.astro](#311-mediaindexastro-978-lines)
4. [Component Inventory](#4-component-inventory)
5. [i18n Key Catalog](#5-i18n-key-catalog)
6. [CSS Pattern Library](#6-css-pattern-library)
7. [Checklist for Services Pages](#7-checklist-for-services-pages)

---

## 1. Architecture Overview

| Aspect | Convention |
|---|---|
| **Rendering** | `export const prerender = false` — all pages are SSR |
| **Layout** | `AdminLayout.astro` with `activeSection` prop (e.g. `"blog-articles"`) |
| **Database** | Drizzle ORM via `getDrizzle()` from `@database/drizzle`, schemas from `@database/schemas` |
| **i18n** | `getTranslations(lang)` from `@i18n/translations`, 4 locales: `fr 🇫🇷`, `en 🇬🇧`, `es 🇪🇸`, `ar 🇸🇦` |
| **API endpoints** | All mutations POST JSON to `/api/admin/blog/{resource}` with `{ action, ...data }` |
| **Client-side libs** | `@lib/admin/toast` (showToast), `@lib/admin/markdown-editor` (initMarkdownEditors, getEditorValue), `@lib/admin/media-picker` (openMediaPicker) |
| **Page types** | 3 archetypes: **Listing** (index), **Creation** (new), **Editing** (edit) |

### AdminLayout Nav Structure

The `AdminLayout` sidebar organizes navigation into groups. Blog section keys:
- `blog-articles`, `blog-categories`, `blog-authors`, `blog-media`, `blog-comments`

Services section keys (for reference):
- `services`, `services-categories`, `services-bookings`

---

## 2. Shared Conventions

### 2.1 Page Header Pattern

Every page uses this header structure:

```html
<div class="admin-page-header">
  <div class="admin-page-title-row">
    <div class="admin-page-title-group">
      <!-- Optional back-link on edit/new pages -->
      <a href="..." class="back-link"><Icon name="mdi:arrow-left" /></a>
      <div>
        <h1>{title} <Badge ...>{count}</Badge></h1>
        <p class="admin-page-subtitle">{subtitle}</p>
      </div>
    </div>
    <!-- Actions: "New" button on listings, "View on site" on edit pages -->
    <div class="admin-page-actions">...</div>
  </div>
</div>
```

### 2.2 i18n Data Bridge Pattern

All client-side JS accesses translations via a hidden `div#i18n-js` with `data-*` attributes:

```html
<div id="i18n-js" hidden
  data-confirm-delete={t.adminBlog?.js?.confirmDelete ?? "Fallback text"}
  data-deleted={t.adminBlog?.js?.deleted ?? "Fallback text"}
  data-network-error={t.adminBlog?.js?.networkError ?? "Erreur réseau."}
  ...
></div>
```

Client-side access:
```js
const i18n = document.getElementById("i18n-js")?.dataset ?? {};
// Usage: i18n.confirmDelete, i18n.deleted, i18n.networkError
```

### 2.3 API Mutation Pattern

All mutations use the same POST pattern:

```js
const res = await fetch("/api/admin/blog/{resource}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "create"|"update"|"delete"|"publish"|"unpublish"|"duplicate", ...payload }),
});
const data = await res.json();
if (data.ok || data.id) {
  showToast(successMessage, "success");
  setTimeout(() => window.location.reload() || redirect, 800-1000);
} else {
  showToast(data.error || fallbackError, "error");
}
```

### 2.4 Slug Generation

All create/edit forms share the same slugify utility:
```js
const slugify = (text) => text
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
```

Auto-slug from the French field value. A "generate" button (`.slug-btn`) triggers manual regeneration. On new pages, typing in the slug field disables auto-slug (`autoSlug = false`).

### 2.5 Locale Tabs

Multilingual forms use tabbed panels:

```html
<div class="locale-tabs" role="tablist">
  <button class="locale-tab active" data-locale="fr">🇫🇷 FR</button>
  <button class="locale-tab" data-locale="en">🇬🇧 EN</button>
  <button class="locale-tab" data-locale="es">🇪🇸 ES</button>
  <button class="locale-tab" data-locale="ar">🇸🇦 AR</button>
</div>
<div class="locale-panel active" data-locale-panel="fr">...</div>
<div class="locale-panel" data-locale-panel="en">...</div>
...
```

On edit pages, a green dot (`.locale-dot`) appears next to locales that have existing translations.

Client-side tab switching:
```js
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    panels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
    document.querySelector(`[data-locale-panel="${tab.dataset.locale}"]`)?.classList.add("active");
  });
});
```

### 2.6 Image Upload Pattern

Three entry points, all channeled through `openMediaPicker()`:

1. **"Library" button** (`#btn-pick-media`) → `openMediaPicker()` opens the `MediaPickerModal`
2. **"Upload" file input** (`#image-input`) → captures file, calls `openMediaPicker({ file })`
3. **Drag & drop** on `.upload-zone` → captures dropped file, calls `openMediaPicker({ file })`

Result callback:
```js
function setCoverPreview(id, url) {
  hiddenIdInput.value = id;
  hiddenUrlInput.value = url;
  previewImg.src = url;
  previewContainer.style.display = "block";
}
```

Remove button clears the hidden inputs and hides preview.

### 2.7 Form Data Collection

Multilingual fields are collected with a `collect(prefix)` helper:
```js
const collect = (prefix) => {
  const obj = {};
  ["fr", "en", "es", "ar"].forEach((loc) => {
    const v = document.getElementById(`${prefix}-${loc}`)?.value.trim();
    if (v) obj[loc] = v;
  });
  return Object.keys(obj).length > 0 ? obj : null;
};
```

### 2.8 Toast Notifications

Three types: `"success"`, `"error"`, `"warning"`. Always imported from `@lib/admin/toast`.

### 2.9 Responsive Breakpoints

Two breakpoints used consistently:
- **900px**: Form layout switches from 2-column to 1-column (`form-layout` grid)
- **768px**: Listing filters/stats stack vertically, table becomes scrollable
- **480px**: Titles shrink, buttons go full-width, tabs get horizontal scroll

---

## 3. Page-by-Page Audit

---

### 3.1 `articles/index.astro` (597 lines)

**Purpose**: Article listing with full filtering, stats, and inline actions.

#### Imports

| Import | Source |
|---|---|
| `AdminLayout` | `@layouts/AdminLayout.astro` |
| `Card`, `CardContent` | `@components/ui/Card` |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `@components/ui/Table` |
| `Badge` | `@components/ui/Badge` |
| `Button` | `@components/ui/Button` |
| `Input` | `@components/ui/Form/Input.astro` |
| `Select` | `@components/ui/Form/Select.astro` |
| `Label` | `@components/ui/Form/Label.astro` |
| `Pagination` | `@components/ui/Pagination.astro` |
| `Icon` | `astro-icon/components` |
| `getDrizzle` | `@database/drizzle` |
| Schemas | `blogPosts`, `blogTranslations`, `blogPostAuthors`, `blogAuthors`, `blogPostCategories`, `blogCategories` |
| Drizzle ops | `count`, `eq`, `desc`, `ilike`, `inArray`, `and` |
| `getTranslations` | `@i18n/translations` |

#### Data Fetching (Frontmatter)

1. **URL params parsed**: `page`, `q` (search), `status`, `featured`, `home`, `blog`, `category`
2. **Dynamic `where` conditions**: Builds an array of Drizzle conditions, combined with `and()`
3. **Category filter**: Pre-query gets `postIds` from `blogPostCategories`, then adds `inArray(blogPosts.id, postIds)` condition
4. **Main query**: `select().from(blogPosts).where(...).orderBy(desc(createdAt)).limit(20).offset(...)`
5. **Auxiliary data maps**:
   - `translationsMap`: `Map<postId, {locale, headline}[]>` from `blogTranslations`
   - `authorsMap`: `Map<postId, authorName[]>` from join of `blogPostAuthors` + `blogAuthors`
   - `postCategoriesMap`: `Map<postId, {categoryId, name}[]>` from join of `blogPostCategories` + `blogCategories`
6. **Stats queries (4 separate count queries)**:
   - Published count (`status = 'published'`)
   - Draft count (`status = 'draft'`)
   - Featured count (`isFeatured = true`)
   - Home count (`displayInHome = true`)
7. **Categories list**: All categories for the filter dropdown

#### Layout & Template

```
┌─────────────────────────────────────────────────────┐
│ Header: "Articles" + Badge(total) + [+ New Article] │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │Published │ │  Drafts  │ │ Featured │ │   Home   ││
│ │    42    │ │    12    │ │     8    │ │     5    ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│ Stats cards (clickable filter links, .active state) │
├─────────────────────────────────────────────────────┤
│ Filters Card:                                       │
│ Row 1: [Search...] [Status ▼] [Category ▼]         │
│ Row 2: [Featured ▼] [Home ▼] [Blog ▼] [Filter] [×]│
├─────────────────────────────────────────────────────┤
│ Table (7 columns):                                  │
│ Article | Categories | Author | Status | Flags |    │
│ Date | Actions                                      │
│ ─── rows ───                                        │
├─────────────────────────────────────────────────────┤
│ Pagination                                          │
└─────────────────────────────────────────────────────┘
```

#### Table Columns Detail

| # | Column | Content | Notes |
|---|---|---|---|
| 1 | **Article** | Headline as link to edit page + `<code class="slug-code">` slug | First translation's headline, link: `/{lang}/admin/blog/articles/{id}/edit` |
| 2 | **Categories** | Flex-wrapped `<a>` tag chips linking to `?category={id}` | Each chip acts as a filter link |
| 3 | **Author(s)** | Comma-joined author names or "—" | From `authorsMap` |
| 4 | **Status** | `<Badge variant={...}>` | `published` → success, `draft` → warning, `scheduled` → info, `archived` → default |
| 5 | **Flags** | Multiple `<Badge>`s in a flex container | `isFeatured` → warning "⭐ Featured", `displayInHome` → success "🏠 Home", `displayInBlog` → info "📰 Blog" |
| 6 | **Date** | Published date (bold) + created date (muted) | `toLocaleDateString()` with `currentLocale` |
| 7 | **Actions** | 4 icon buttons | Edit (link), Duplicate, Publish/Unpublish, Delete |

#### Action Buttons (7th column)

| Button | Class | Variant | Behavior |
|---|---|---|---|
| **Edit** | `.btn-action--edit` | `<a>` link | Navigates to `/{lang}/admin/blog/articles/{id}/edit` |
| **Duplicate** | `data-action="duplicate"` | Button | `confirm()` → POST `{ action: "duplicate", id }` → reload |
| **Publish** | `data-action="publish"` | `.action-btn--publish` (green) | POST `{ action: "publish", id }` → reload |
| **Unpublish** | `data-action="unpublish"` | `.action-btn--unpublish` (orange) | POST `{ action: "unpublish", id }` → reload |
| **Delete** | `data-action="delete"` | `.action-btn--delete` (red) | `confirm()` → POST `{ action: "delete", id }` → reload |

#### Client-side JavaScript

- Event delegation on `[data-action]` buttons
- Each action: disable button → fetch POST → `showToast` → `setTimeout(reload, 1000)` on success
- On error: show error toast, re-enable button

#### i18n Keys (in hidden div)

```
data-confirm-delete, data-article-deleted, data-confirm-duplicate, data-article-duplicated,
data-article-published, data-article-unpublished, data-unknown-error, data-network-error
```

#### CSS Classes

`.stats-grid` (4-col), `.stat-card` (with `.active`), `.stat-icon--{primary,success,warning,accent}`, `.stat-value`, `.stat-label`, `.admin-filters-card`, `.admin-filters-form`, `.admin-filters-row`, `.admin-filter-field`, `.filter-search` (flex:2), `.admin-filter-actions`, `.admin-filter-reset`, `.table-responsive`, `.article-title-cell`, `.slug-code`, `.category-tags`, `.category-tag`, `.visibility-badges`, `.action-buttons`, `.action-btn` (with `--publish`, `--unpublish`, `--delete`, `--duplicate` color variants), `.empty-state`, `.empty-state-icon`, `.btn-create-empty`, `.admin-pagination`

---

### 3.2 `articles/new.astro` (705 lines)

**Purpose**: Article creation form with multilingual content, cover image, and publishing controls.

#### Imports

| Import | Source |
|---|---|
| `AdminLayout` | `@layouts/AdminLayout.astro` |
| `Card`, `CardHeader`, `CardContent` | `@components/ui/Card` |
| `Input` | `@components/ui/Form/Input.astro` |
| `Select` | `@components/ui/Form/Select.astro` |
| `Label` | `@components/ui/Form/Label.astro` |
| `Textarea` | `@components/ui/Form/Textarea.astro` |
| `Switch` | `@components/ui/Form/Switch.astro` |
| `Checkbox` | `@components/ui/Form/Checkbox.astro` |
| `MarkdownEditor` | `@components/admin/MarkdownEditor.astro` |
| `MediaPickerModal` | `@components/admin/MediaPickerModal.astro` |
| `Icon` | `astro-icon/components` |
| `getDrizzle` | `@database/drizzle` |
| Schemas | `blogCategories`, `blogAuthors` |
| `getTranslations` | `@i18n/translations` |

#### Data Fetching

- `allCategories` from `blogCategories`
- `allAuthors` from `blogAuthors`

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: ← back + "New Article"                         │
├────────────────────────────────┬────────────────────────┤
│ MAIN COLUMN (1fr)              │ SIDEBAR (340px)        │
│                                │                        │
│ ┌────────────────────────────┐ │ ┌────────────────────┐ │
│ │ Multilingual Content Card  │ │ │ Publishing Card    │ │
│ │ [FR|EN|ES|AR] locale tabs  │ │ │ • slug + generate  │ │
│ │ Per locale:                │ │ │ • status Select    │ │
│ │  • headline (Input)        │ │ │ • main language    │ │
│ │  • alt-headline (Input)    │ │ │ • Switches:        │ │
│ │  • excerpt (Textarea r=3)  │ │ │   ☐ Featured       │ │
│ │  • body (MarkdownEditor    │ │ │   ☐ Home           │ │
│ │         rows=16)           │ │ │   ☑ Blog (default) │ │
│ │  ▶ SEO Section (details)   │ │ │   ☑ Comments (def) │ │
│ │    • seo-title             │ │ └────────────────────┘ │
│ │    • seo-description       │ │                        │
│ │    • seo-keywords          │ │ ┌────────────────────┐ │
│ └────────────────────────────┘ │ │ Categories Card    │ │
│                                │ │ ☐ Category 1       │ │
│ ┌────────────────────────────┐ │ │ ☐ Category 2       │ │
│ │ Cover Image Card           │ │ │ ☐ Category 3       │ │
│ │ [Library] or [Upload]      │ │ └────────────────────┘ │
│ │ + image preview            │ │                        │
│ └────────────────────────────┘ │ ┌────────────────────┐ │
│                                │ │ Authors Card       │ │
│                                │ │ ☐ Author 1         │ │
│                                │ │ ☐ Author 2         │ │
│                                │ └────────────────────┘ │
│                                │                        │
│                                │ ┌────────────────────┐ │
│                                │ │ Metadata Card      │ │
│                                │ │ Reading time (min)  │ │
│                                │ │ License (Input)     │ │
│                                │ └────────────────────┘ │
├────────────────────────────────┴────────────────────────┤
│ Action Bar: [Cancel] [Save Draft] [Publish]             │
└─────────────────────────────────────────────────────────┘
│ <MediaPickerModal /> + <div#i18n-js hidden />           │
```

#### Form Submission Flow

1. "Save Draft" button → calls `collectData("draft")` (sets `status: "draft"`)
2. "Publish" button → calls `collectData("published")` (sets `status: "published"`)
3. `collectData()` syncs markdown editors (`editor.codemirror.save()`), validates FR headline is required, builds payload with all multilingual `collect()` calls
4. `submitArticle()` POSTs to `/api/admin/blog/articles` with `action: "create"`
5. On success: redirect to `/{lang}/admin/blog/articles/{id}/edit`

#### Payload Shape

```json
{
  "action": "create",
  "slug": "...",
  "headline": { "fr": "...", "en": "..." },
  "alternativeHeadline": { "fr": "..." },
  "excerpt": { "fr": "..." },
  "body": { "fr": "..." },
  "seoTitle": { "fr": "..." },
  "seoDescription": { "fr": "..." },
  "seoKeywords": { "fr": "..." },
  "coverMediaId": "uuid",
  "coverMediaUrl": "/uploads/...",
  "status": "draft",
  "inLanguage": "fr",
  "isFeatured": false,
  "displayInHome": false,
  "displayInBlog": true,
  "allowComments": true,
  "categoryIds": ["uuid1", "uuid2"],
  "authorIds": ["uuid1"],
  "readingTime": "5",
  "license": ""
}
```

#### i18n Keys

```
data-title-required, data-article-created, data-unknown-error, data-network-error
```

#### CSS Grid

- `.form-layout`: `grid-template-columns: 1fr 340px; gap: 1.5rem`
- `.form-main`: flexbox column
- `.form-sidebar`: flexbox column, `position: sticky; top: 1rem`
- At `≤ 900px`: single column, sidebar becomes static

---

### 3.3 `articles/[id]/edit.astro` (759 lines)

**Purpose**: Article editing — same form as `new.astro` but pre-populated with existing data.

#### Key Differences from new.astro

| Aspect | new.astro | edit.astro |
|---|---|---|
| **Data loading** | Just categories + authors | Article + translations + authors + categories + media |
| **Pre-population** | Empty fields | `value={existingData}` on all inputs |
| **Locale dots** | No dots | Green `.locale-dot` for locales with translations |
| **Cover image** | Empty upload zone | Shows existing cover if any |
| **Header actions** | — | "View on site" link |
| **Action bar** | "Save Draft" + "Publish" | Single "Save" button |
| **Danger zone** | — | Collapsible `<details>` with delete button |
| **API action** | `action: "create"` | `action: "update"` with `id` |
| **Success behavior** | Redirect to edit page | `window.location.reload()` |
| **Delete handler** | — | Separate delete flow with redirect to listing |

#### Additional Data Fetching

```js
// Article by ID
const article = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();

// All translations for this article
const translationRows = await db.select().from(blogTranslations).where(eq(blogTranslations.postId, id));
const translationsMap = new Map(); // locale → { headline, altHeadline, excerpt, body, seo... }

// Associated authors & categories
const postAuthorRows = ...; // pre-checked checkboxes
const postCategoryRows = ...;

// Cover media
const postMediaRows = ...; // from blogPostMedia

// Frontend URL computation
const frontendUrl = `/${lang}/blog/${firstCategorySlug}/${article.slug}`;
```

#### Danger Zone Card

```html
<Card class="danger-card" elevation="sm">
  <CardContent>
    <details class="danger-details">
      <summary class="danger-toggle">
        <Icon name="mdi:alert" class="danger-icon" />
        {t.adminBlog?.dangerZone ?? "Danger"}
      </summary>
      <div class="danger-content">
        <p class="danger-text">{warning text}</p>
        <Button id="btn-delete" variant="danger">{Delete}</Button>
      </div>
    </details>
  </CardContent>
</Card>
```

#### Additional i18n Keys

```
data-article-saved, data-error-save, data-confirm-delete-permanent, 
data-article-deleted, data-error-delete, data-network-error-short
```

---

### 3.4 `categories/index.astro` (525 lines)

**Purpose**: Categories listing with filtering and inline delete.

#### Imports

Same pattern as articles/index but with category schemas: `blogCategories`, `blogPostCategories`.

#### Data Fetching

1. **URL params**: `page`, `q`, `featured`, `home`, `blog`, `menu`, `parent` (includes special value `"root"` for `parentId IS NULL`)
2. **Dynamic conditions**: Same `and()` pattern
3. **Stats queries (5)**:
   - Total count
   - Featured count
   - Home count
   - Menu count
   - Root categories count (`parentId IS NULL`)
4. **Article count per category**: groupBy query on `blogPostCategories`
5. **All categories**: loaded for parent resolution

#### Stats Grid

5 cards (vs 4 for articles): Total, Featured, Home, Menu, Root

#### Table Columns

| # | Column | Content |
|---|---|---|
| 1 | **Category** | Name (bold) + slug (code) + description (truncated, muted) |
| 2 | **Articles** | Count `<Badge>` |
| 3 | **Visibility** | Multiple `<Badge>`s: Featured, Home, Blog, Menu |
| 4 | **Parent** | Link to parent's edit page or "Root" text |
| 5 | **Image** | Icon indicator or dash |
| 6 | **Date** | Created + modified dates |
| 7 | **Actions** | Edit link + Delete button |

#### Actions

- Only Edit and Delete (no duplicate/publish/unpublish)
- Delete: `confirm()` → POST `{ action: "delete", id }` to `/api/admin/blog/categories`

#### i18n Keys

```
data-confirm-delete-cat, data-cat-deleted, data-unknown-error, data-network-error
```

---

### 3.5 `categories/new.astro` (596 lines)

**Purpose**: Category creation form.

#### Layout

Same 2-column layout as articles/new but with category-specific fields:

**Main column**:
1. **Multilingual card**: Per locale: name (Input), description (MarkdownEditor minimal rows=4), SEO section (seoTitle, seoDesc, seoKeywords, canonicalUrl)
2. **Featured image card**: Same upload zone pattern (Library + Upload + drag-drop via `openMediaPicker`)

**Sidebar**:
1. **Settings card**: slug + generate button (`.slug-row`), parent category (Select dropdown), switch group (isFeatured, displayInHome, displayInBlog default on, displayInMenu default on)
2. **Action bar**: Cancel + Create button

#### Payload Shape

```json
{
  "action": "create",
  "slug": "...",
  "parentId": "uuid|null",
  "name": { "fr": "...", "en": "..." },
  "description": { "fr": "..." },
  "seoTitle": { "fr": "..." },
  "seoDescription": { "fr": "..." },
  "seoKeywords": { "fr": "..." },
  "canonicalUrl": { "fr": "..." },
  "isFeatured": false,
  "displayInHome": false,
  "displayInBlog": true,
  "displayInMenu": true,
  "featuredImageId": "uuid",
  "featuredImageUrl": "/uploads/..."
}
```

#### i18n Keys

```
data-name-required, data-slug-required, data-cat-created, data-unknown-error, data-network-error
```

---

### 3.6 `categories/[id]/edit.astro` (727 lines)

**Purpose**: Category editing — pre-populated form with danger zone.

#### Key Differences from new.astro

- Loads category by ID + article count + featured image from `blogMedia` + parent options excluding self
- Header shows: category name, slug badge, article count badge, featured badge, "View on site" link
- Uses `extractLocalizedObj()` helper to parse JSON locale objects from the DB record
- Parent dropdown excludes self (to prevent circular references)
- Has danger zone card as collapsible `<details>` with article count warning text
- API action: `action: "update"` with `id: categoryId`
- Delete handler redirects to listing page

#### Unique Template Elements

- Header `title-meta` row: slug code badge + article count badge + featured badge
- Danger zone warning: "This category contains {n} article(s). Deleting it will remove all associations."
- Save feedback section (`.save-feedback`) with checkmark icon

#### i18n Keys

```
data-slug-required, data-cat-saved, data-save-error, data-network-error,
data-confirm-delete-cat, data-cat-deleted, data-delete-error
```

---

### 3.7 `authors/index.astro` (420 lines)

**Purpose**: Authors listing with filtering.

#### Data Fetching

1. **URL params**: `page`, `q`, `featured`, `home`, `blog`
2. **Stats (4)**: Total, Featured, Home, Blog
3. **Article count per author**: groupBy on `blogPostAuthors`

#### Table Columns

| # | Column | Content |
|---|---|---|
| 1 | **Author** | Avatar (36px circle img or fallback icon) + name (bold) + featured badge + bio (truncated, muted) |
| 2 | **Slug** | `<code class="slug-code">` |
| 3 | **Email** | Email text |
| 4 | **Articles** | Count `<Badge>` |
| 5 | **Visibility** | Home/Blog badges or "Hidden" text |
| 6 | **Created** | Date |
| 7 | **Actions** | Edit link + Delete button |

#### Unique CSS

- `.author-cell` — flex layout for avatar + info
- `.author-avatar` — 36px circle image
- `.author-avatar-fallback` — 36px circle with icon placeholder
- `.author-name`, `.author-bio`, `.author-email` — text styles

#### i18n Keys

```
data-confirm-delete-author, data-author-deleted, data-unknown-error, data-network-error
```

---

### 3.8 `authors/new.astro` (521 lines)

**Purpose**: Author creation form.

#### Layout

**Main column**:
1. **Multilingual card**: Per locale: displayName (Input), givenName + familyName (2-col `.form-row--2`), jobTitle (Input), bio (MarkdownEditor minimal), SEO section (seoTitle, seoDesc, seoKeywords, canonicalUrl)
2. **Contact & Social card**: email + website (2-col), sameAs (Textarea — social media URLs, one per line)
3. **Avatar card**: Same upload zone pattern

**Sidebar**:
1. **Settings card**: slug + generate button, organization (Select from `blogOrganizations`), switches (isFeatured, displayInHome, displayInBlog default on)
2. **Action bar**: Cancel + Save button

#### Unique Data

- `blogOrganizations` loaded for the organization dropdown
- `sameAs` field: Textarea lines → split to array on submission

#### Payload Shape

```json
{
  "action": "create",
  "slug": "...",
  "displayName": { "fr": "...", "en": "..." },
  "givenName": { "fr": "..." },
  "familyName": { "fr": "..." },
  "jobTitle": { "fr": "..." },
  "bio": { "fr": "..." },
  "email": "...",
  "website": "...",
  "sameAs": ["https://twitter.com/...", "https://github.com/..."],
  "avatarId": "uuid",
  "avatarUrl": "/uploads/...",
  "worksForId": "uuid",
  "isFeatured": false,
  "displayInHome": false,
  "displayInBlog": true,
  "seoTitle": { "fr": "..." },
  "seoDescription": { "fr": "..." },
  "seoKeywords": { "fr": "..." },
  "canonicalUrl": { "fr": "..." }
}
```

#### i18n Keys

```
data-name-required, data-slug-required, data-author-created, data-unknown-error, data-network-error
```

---

### 3.9 `authors/[id]/edit.astro` (607 lines)

**Purpose**: Author editing — pre-populated with existing data + danger zone.

#### Key Differences from new.astro

| Aspect | Detail |
|---|---|
| **Data loading** | Author by ID + article count + organizations |
| **Header** | Back link + title + slug Badge + article count Badge + "View on site" link |
| **Pre-population** | Uses `getLocalizedValue()` helper for JSON locale fields |
| **sameAs** | Pre-filled textarea with `(author.sameAs || []).join("\n")` |
| **Avatar** | Shows existing avatar if `avatarUrl` is present |
| **Danger zone** | Separate `Card class="danger-card"` (NOT collapsible details — differs from categories) |
| **Metadata card** | Shows ID, Created date, Modified date |
| **API action** | `action: "update"` with `id: authorId` |
| **Delete** | Redirects to `pathname.replace(/${id}/edit, "")` |

#### i18n Keys

```
data-slug-required, data-author-saved, data-save-error, data-network-error,
data-confirm-delete-author, data-author-deleted, data-delete-error
```

---

### 3.10 `comments/index.astro` (483 lines)

**Purpose**: Comments moderation listing — **fundamentally different pattern** from other listings.

#### Key Architectural Differences

| Aspect | Other Listings | Comments |
|---|---|---|
| **Create button** | "New {resource}" button | None — comments come from users |
| **Stats display** | Stat cards grid | Summary chips (inline flex) |
| **Actions** | Client-side JS `fetch()` | Server-side `<form>` POST |
| **Action target** | `/api/admin/blog/{resource}` | `/{lang}/api/admin/moderate` |
| **Filters** | Multiple dropdowns | Status chips + optional postType Select |

#### Summary Chips

```html
<div class="comments-summary">
  <a class="summary-chip {active}" href="?status=pending">
    <Icon name="mdi:clock" class="chip-icon" /> Pending <Badge variant="warning">{count}</Badge>
  </a>
  <a class="summary-chip {active}" href="?status=approved">
    <Icon name="mdi:check" class="chip-icon" /> Approved <Badge variant="success">{count}</Badge>
  </a>
  <a class="summary-chip {active}" href="?status=rejected">
    <Icon name="mdi:close" class="chip-icon" /> Rejected <Badge variant="error">{count}</Badge>
  </a>
  <a class="summary-chip-reset" href="?">All</a>
</div>
```

#### Table Columns

| # | Column | Content |
|---|---|---|
| 1 | **Author** | Name (`.comment-author-name`) + email (`.comment-author-email`) |
| 2 | **Content** | Truncated to 100 chars (`.comment-excerpt`) |
| 3 | **Article** | Slug as `<code class="slug-code">` |
| 4 | **Type** | `<Badge>` |
| 5 | **Status** | Colored `<Badge>` (pending→warning, approved→success, rejected→error) |
| 6 | **Rating** | Star icon + `/5` or dash |
| 7 | **Language** | `<Badge>` |
| 8 | **Date** | Formatted date |
| 9 | **Actions** | Approve/Reject form buttons |

#### Action Pattern (SERVER-SIDE FORMS)

```html
<form method="POST" action="/{lang}/api/admin/moderate" class="inline-form">
  <input type="hidden" name="entity" value="comment" />
  <input type="hidden" name="entityId" value={comment.id} />
  <input type="hidden" name="action" value="approve" />
  <Button type="submit" variant="success" size="sm">Approve</Button>
</form>
```

**No client-side JavaScript** for actions — uses native HTML form submission.

#### i18n Keys

All in template only (no `#i18n-js` div needed).

---

### 3.11 `media/index.astro` (978 lines)

**Purpose**: Media library — **fully client-side rendered SPA-like page**.

#### Fundamental Architecture Difference

| Aspect | Standard Pages | Media Page |
|---|---|---|
| **Rendering** | Server-side data → Astro template | Empty shell → client JS fetches & renders |
| **Data loading** | Drizzle queries in frontmatter | `fetch("/api/admin/blog/media?...")` in client JS |
| **Pagination** | `<Pagination>` component | Client-rendered buttons |
| **Template** | Full data-driven HTML | Placeholder containers (`#media-grid`, `#pagination`) |
| **Search** | URL param `?q=` with page reload | Debounced input (300ms) → `loadMedia()` |
| **Create flow** | Separate `/new` page | Inline upload section in same page |

#### Imports (Minimal)

```js
import AdminLayout from "@layouts/AdminLayout.astro";
import { Card, CardContent } from "@components/ui/Card";
import { Icon } from "astro-icon/components";
import { getTranslations } from "@i18n/translations";
```

No database imports, no schema imports, no Drizzle.

#### Template Structure

```
┌──────────────────────────────────────────────────────┐
│ Header: "Media Library" + [Upload] button            │
├──────────────────────────────────────────────────────┤
│ Toolbar Card:                                        │
│ [🔍 Search...] [Type: All ▼]                        │
├──────────────────────────────────────────────────────┤
│ Upload Section (hideable):                           │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Drop zone (dashed border)                        │ │
│ │ [Upload icon] Drag files here or click           │ │
│ │ <input type="file" multiple hidden>              │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Pre-upload Metadata Form (hidden by default)     │ │
│ │ [Preview img] | Filename [_____.ext]             │ │
│ │               | Alt text [________]              │ │
│ │               | Caption  [________]              │ │
│ │               | Description [_____]              │ │
│ │               | [Cancel] [Skip] [Upload]         │ │
│ └──────────────────────────────────────────────────┘ │
│ [Progress bar] Upload 2/5...                         │
├──────────────────────────────────────────────────────┤
│ Media Grid (client-rendered):                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│ │     │ │     │ │     │ │     │ │     │           │
│ │ img │ │ img │ │ img │ │ img │ │ img │           │
│ │     │ │     │ │     │ │     │ │     │           │
│ │name │ │name │ │name │ │name │ │name │           │
│ │date │ │date │ │date │ │date │ │date │           │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │
│ ... auto-fill grid minmax(175px, 1fr)                │
├──────────────────────────────────────────────────────┤
│ Pagination (client-rendered): [‹] [1] [2] [3] [›]   │
└──────────────────────────────────────────────────────┘

Detail Overlay (fixed, right-side panel):
┌────────────────────────────────┐
│ Detail × Close                 │
├────────────────────────────────┤
│ [Full image preview]           │
│                                │
│ Filename: photo-1.jpg          │
│ Type: image/jpeg               │
│ Date: 25 mars 2025             │
│ URL: [/uploads/...] [📋]      │
│                                │
│ Alt text:  [________________]  │
│ Caption:   [________________]  │
│ Description: [______________]  │
│              [______________]  │
├────────────────────────────────┤
│ [🗑 Delete]         [Save]     │
└────────────────────────────────┘
```

#### Client-side TypeScript Interfaces

```ts
interface MediaItem {
  id: string;
  url: string;
  type: string;
  encodingFormat: string;
  alt: Record<string, string>;
  caption: Record<string, string>;
  description: Record<string, string>;
  createdAt: string;
}

interface MediaListResponse {
  media: MediaItem[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### Client Functions

| Function | Purpose |
|---|---|
| `loadMedia()` | Fetches API, renders media grid cards, calls `renderPagination()` |
| `renderPagination(data)` | Builds prev/numbered/next buttons, attaches click → `loadMedia()` |
| `showPreUploadForm(file)` | Shows metadata form with image preview, slugified filename |
| `hidePreUploadForm()` | Hides metadata form, shows upload zone |
| `uploadFiles(files)` | Batch upload with progress bar, FormData POST |
| `uploadFileWithMeta(file, name, alt, caption, desc)` | Single upload with metadata fields appended to FormData |
| `openDetail(item)` | Opens right-side panel with media info + editable fields |
| `closeDetail()` | Hides overlay |
| `saveMetadata()` | POST `{ action: "update", id, alt, caption, description }` |
| `deleteMedia()` | `confirm()` → POST `{ action: "delete", id }` |

#### Upload Flow

1. File selected (via click or drag-drop)
2. If `multiple` on file input: directly calls `uploadFiles(files)` (batch, no metadata form)
3. If single file via trigger button or drop: calls `showPreUploadForm(file)` → user fills metadata → user clicks "Upload" → `uploadFileWithMeta()`, OR "Skip" → `uploadFiles()`, OR "Cancel" → back to upload zone

#### i18n Keys

```
data-loading, data-no-media, data-load-error, data-upload-error,
data-network-error, data-files-uploaded, data-meta-saved, data-meta-error,
data-confirm-delete-media, data-media-deleted, data-unknown-error,
data-prev-page, data-next-page, data-media-count
```

---

## 4. Component Inventory

### UI Components Used

| Component | Used In | Props |
|---|---|---|
| `AdminLayout` | All pages | `title`, `activeSection`, `lang` |
| `Card` | All pages | `elevation="sm"`, `class="danger-card"` |
| `CardHeader` | new/edit pages | — |
| `CardContent` | All pages | — |
| `Table` | All index pages | — |
| `TableHeader` | All index pages | — |
| `TableBody` | All index pages | — |
| `TableRow` | All index pages | — |
| `TableHead` | All index pages | — |
| `TableCell` | All index pages | — |
| `Badge` | All pages | `variant`: default/success/warning/error/info |
| `Button` | All pages | `variant`: default/primary/danger/success, `size`: sm |
| `Pagination` | articles/index, categories/index, authors/index | `currentPage`, `totalPages`, `baseUrl` |
| `Input` | All new/edit pages | `id`, `type`, `value`, `placeholder` |
| `Select` | All pages | `id` + `<option>` children |
| `Label` | All pages | `for` |
| `Textarea` | new/edit pages | `id`, `rows`, `value` |
| `Switch` | new/edit pages | `id`, `checked` |
| `Checkbox` | articles new/edit | `id`, `value`, `checked` |
| `Icon` | All pages | `name` (Iconify format: `mdi:...`) |
| `MarkdownEditor` | new/edit pages | `id`, `rows`, `value`, `minimal` |
| `MediaPickerModal` | new/edit pages | (no props) |

### Admin-Specific Components

| Component | Path | Purpose |
|---|---|---|
| `MarkdownEditor` | `@components/admin/MarkdownEditor.astro` | Wraps CodeMirror-based markdown editor |
| `MediaPickerModal` | `@components/admin/MediaPickerModal.astro` | Modal for browsing/uploading media |
| `AdminToast` | `@components/admin/AdminToast.astro` | Toast notification container (likely in AdminLayout) |

### Client-side Libraries

| Library | Path | Exports |
|---|---|---|
| `@lib/admin/toast` | — | `showToast(message, type)` |
| `@lib/admin/markdown-editor` | — | `initMarkdownEditors()`, `getEditorValue(id)` |
| `@lib/admin/media-picker` | — | `openMediaPicker(options?)` |

---

## 5. i18n Key Catalog

### Template-side Keys (accessed via `t.adminBlog?.`)

These are the main i18n namespace paths used:

```
t.adminBlog?.articles?.title
t.adminBlog?.articles?.subtitle
t.adminBlog?.articles?.newArticle
t.adminBlog?.articles?.searchPlaceholder
t.adminBlog?.articles?.filterByStatus
t.adminBlog?.articles?.filterByCategory
t.adminBlog?.articles?.allStatuses
t.adminBlog?.articles?.allCategories
t.adminBlog?.articles?.filterByFeatured
t.adminBlog?.articles?.filterByHome
t.adminBlog?.articles?.filterByBlog
t.adminBlog?.articles?.filter
t.adminBlog?.articles?.resetFilters
t.adminBlog?.articles?.published
t.adminBlog?.articles?.drafts
t.adminBlog?.articles?.featured
t.adminBlog?.articles?.home
t.adminBlog?.articles?.noArticles
t.adminBlog?.articles?.createFirst
t.adminBlog?.articles?.createdOn
t.adminBlog?.articles?.publishedOn

t.adminBlog?.categories?.title / subtitle / newCategory / ...
t.adminBlog?.categories?.articles / menu / parent / root / modifiedOn

t.adminBlog?.authors?.title / subtitle / newAuthor / ...
t.adminBlog?.authors?.articles / hidden

t.adminBlog?.comments?.title / subtitle / ...
t.adminBlog?.comments?.pending / approved / rejected / all
t.adminBlog?.comments?.approve / reject

t.adminBlog?.media?.title / subtitle / upload / ...
t.adminBlog?.media?.searchPlaceholder / allTypes / dragDrop / ...

t.adminBlog?.common?.edit / delete / actions / status / date / slug / ...
t.adminBlog?.common?.yes / no / all
t.adminBlog?.dangerZone
```

### Client-side Keys (via `data-*` attributes)

```
// Articles
confirmDelete, articleDeleted, confirmDuplicate, articleDuplicated,
articlePublished, articleUnpublished, titleRequired, articleCreated,
articleSaved, errorSave, confirmDeletePermanent, errorDelete

// Categories
confirmDeleteCat, catDeleted, nameRequired, slugRequired, catCreated,
catSaved, saveError, deleteError

// Authors
confirmDeleteAuthor, authorDeleted, nameRequired, slugRequired,
authorCreated, authorSaved, saveError, deleteError

// Media
loading, noMedia, loadError, uploadError, filesUploaded, metaSaved,
metaError, confirmDeleteMedia, mediaDeleted, prevPage, nextPage, mediaCount

// Shared
unknownError, networkError, networkErrorShort
```

---

## 6. CSS Pattern Library

### Layout Classes

| Class | Definition | Used In |
|---|---|---|
| `.admin-page-header` | `margin-bottom: 1.5rem` | All pages |
| `.admin-page-title-row` | Flex, space-between, wrap | All pages |
| `.admin-page-title-group` | Flex, center-aligned, gap | All pages |
| `.admin-page-actions` | Flex, gap | Edit pages |
| `.admin-page-subtitle` | Muted, 0.9375rem | All pages |
| `.form-layout` | Grid `1fr 340px`, gap 1.5rem | All new/edit pages |
| `.form-main` | Flex column, gap 1rem | All new/edit pages |
| `.form-sidebar` | Flex column, gap 1rem, sticky top 1rem | All new/edit pages |

### Stat Cards (Listings)

| Class | Definition |
|---|---|
| `.stats-grid` | Grid, `repeat(auto-fit, minmax(160px, 1fr))` |
| `.stat-card` | Flex, bordered, rounded, hoverable, `.active` state |
| `.stat-icon` | 2rem × 2rem |
| `.stat-icon--primary` | Primary color (gold) |
| `.stat-icon--success` | Green |
| `.stat-icon--warning` | Orange |
| `.stat-icon--accent` | Purple |
| `.stat-value` | 1.5rem, 800 weight |
| `.stat-label` | 0.75rem, muted |

### Filter Bar (Listings)

| Class | Definition |
|---|---|
| `.admin-filters-card` | `margin-bottom: 1rem` |
| `.admin-filters-form` | Flex column, gap |
| `.admin-filters-row` | Flex wrap, gap |
| `.admin-filter-field` | Flex column, `min-width: 140px`, `flex: 1` |
| `.filter-search` | `flex: 2`, `min-width: 200px` |
| `.admin-filter-actions` | Flex, center-aligned |
| `.admin-filter-reset` | Underline link, muted |

### Table (Listings)

| Class | Definition |
|---|---|
| `.table-responsive` | `overflow-x: auto` |
| `.slug-code` | Monospace, inset background, small padding |
| `.visibility-badges` | Flex wrap, gap 0.25rem |
| `.action-buttons` | Flex, gap 0.25rem |
| `.btn-action` | 2rem × 2rem, bordered, centered icon |
| `.btn-action--edit:hover` | Gold color |
| `.btn-action--delete:hover` | Red color + red border |

### Form Controls (New/Edit)

| Class | Definition |
|---|---|
| `.locale-tabs` | Flex, bottom border 2px |
| `.locale-tab` | Tab button with border-bottom highlight, `.active` gold |
| `.locale-flag` | 1rem emoji |
| `.locale-dot` | 6px green circle (edit pages, existing translations) |
| `.locale-panel` | `display: none`, `.active` `display: block` |
| `.form-field` | `margin-bottom: 0.75rem` |
| `.form-row--2` | 2-column grid |
| `.field-hint` | Small muted text |
| `.seo-section` | Bordered collapsible container |
| `.seo-toggle` | Summary clickable row |
| `.slug-row` | Flex: input + generate button |
| `.slug-btn` | 2.25rem square icon button |
| `.switch-group` | Flex column, border-top separator |
| `.switch-item` | Flex, center-aligned |
| `.checkbox-list` | Flex column, gap |
| `.card-title-row` | Flex, icon + text |
| `.card-title-icon` | 1.125rem, primary color |

### Upload Zone (New/Edit)

| Class | Definition |
|---|---|
| `.upload-zone` | Dashed 2px border, rounded, hover/dragover highlight |
| `.upload-actions-row` | Flex center, gap, padding |
| `.btn-pick-media` | Bordered button, primary color |
| `.upload-separator` | "ou" italic text |
| `.btn-upload-file` | Bordered button, neutral |
| `.upload-file-input` | Visually hidden (clip rect) |
| `.upload-preview` | Relative container |
| `.upload-preview img` | 100% width, 200px height, cover |
| `.upload-remove` | Absolute top-right, dark circle, hover red |

### Action Bar (New/Edit)

| Class | Definition |
|---|---|
| `.action-bar` | Flex, end-justified, bordered card-like |
| `.action-cancel` | Muted link |

### Danger Zone (Edit only)

| Class | Definition |
|---|---|
| `.danger-card` | `border-color: red !important` |
| `.danger-details` / `.danger-toggle` | Collapsible summary (categories) |
| `.danger-text` | Small muted paragraph |
| `.danger-content` | Margin-top container |
| `.card-title-danger .card-title-icon` | Red icon |

### Buttons (Common)

| Class | Definition |
|---|---|
| `.btn-create` | Primary gold, inline-flex, link style |
| `.btn-view-site` | Outlined primary, small |
| `.back-link` | Icon-only, muted, hover inset bg |

### Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `≤ 900px` | Form layout → 1 column, sidebar static, 2-col form rows → 1 col |
| `≤ 768px` | Stats grid → 2 columns, filters stack, table scrollable, title row stacks |
| `≤ 480px` | Stats grid → 1 column, title shrinks, buttons full-width, tabs scroll horizontally |

---

## 7. Checklist for Services Pages

When building services admin pages, ensure each page follows these patterns:

### Index/Listing Pages

- [ ] `export const prerender = false`
- [ ] `AdminLayout` with correct `activeSection`
- [ ] Page header: title + Badge count + "New" button link
- [ ] Stats grid: 4-5 clickable stat cards with icon, value, label, `.active` state
- [ ] Filter card: search input (flex:2) + relevant dropdowns + Filter button + Reset link
- [ ] All filters work via URL params with full-page reload
- [ ] Table with `.table-responsive` wrapper
- [ ] Appropriate columns with Badge variants for status/visibility
- [ ] Action buttons: Edit (link) + relevant state change buttons + Delete
- [ ] Delete: `confirm()` dialog → POST → showToast → reload
- [ ] Empty state: icon + message + "Create first one" CTA link
- [ ] Pagination component
- [ ] Hidden `#i18n-js` div with all client JS strings
- [ ] Scoped `<style>` with all pattern CSS classes
- [ ] Responsive at 768px and 480px

### New/Create Pages

- [ ] Back link in header
- [ ] 2-column grid layout: `.form-layout` = `1fr 340px`
- [ ] Main column: Multilingual content card with locale tabs (FR/EN/ES/AR)
- [ ] Per locale: relevant text fields + SEO collapsible section
- [ ] Image upload card: Library button + Upload input + drag-drop + preview + remove
- [ ] Sidebar: Settings card (slug + generate button + status/config dropdowns + switches)
- [ ] Sidebar: Related entities as checkbox lists (if applicable)
- [ ] Action bar: Cancel link + primary action button(s)
- [ ] MediaPickerModal component
- [ ] Client JS: locale tabs, auto-slug, image upload via openMediaPicker, form submission
- [ ] Validation: French field required, slug required
- [ ] Submit → POST with `action: "create"` → redirect to edit page on success
- [ ] Scoped styles with responsive breakpoints at 900px and 480px

### Edit Pages

- [ ] All features from "New" page PLUS:
- [ ] Load entity by ID + related data
- [ ] Pre-populate all fields with existing values
- [ ] Green dots on locale tabs with existing translations
- [ ] Header: back link + title + slug Badge + related count Badge + "View on site" link
- [ ] Single "Save" button (not draft/publish split)
- [ ] Submit → POST with `action: "update"` + `id` → reload on success
- [ ] Danger zone card: collapsible or separate card with delete button
- [ ] Delete handler: confirm → POST delete → redirect to listing
- [ ] Metadata card in sidebar: ID, created date, modified date

### Special Page Variants

- **Moderation listing (like comments)**: No "New" button, summary chips instead of stat cards, form-based actions (server-side POST) for approve/reject
- **SPA media library**: Minimal server HTML, client-side fetch/render, inline upload with metadata form, detail overlay panel for view/edit/delete

---

*Report generated from full audit of all 11 blog admin page files, AdminLayout, and supporting components.*
