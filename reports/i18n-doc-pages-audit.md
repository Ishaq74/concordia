# Comprehensive i18n Audit Report — Doc Pages

> **Generated for branch:** `refactor/lang`  
> **Scope:** All 38 `.astro` files under `src/pages/[lang]/docs/`  
> **Navigation file:** `src/components/templates/docs/navigation.ts`

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 CRITICAL | 4 files | Entire page in French (no i18n at all) |
| 🟠 HIGH | 34 files | Hardcoded section headings (h2/h3) |
| 🟠 HIGH | 30+ files | Props table description cells hardcoded |
| 🟠 HIGH | 25+ files | TableOfContents labels hardcoded |
| 🟡 MEDIUM | 20+ files | Instructional paragraphs hardcoded |
| 🟡 MEDIUM | 15+ files | Demo content in only one language |
| 🟢 LOW | 1 file | Tag mismatch (`</Button>` vs `</ButtonComponent>`) |

**navigation.ts**: ✅ Fully translated — no issues.

---

## 🔴 CRITICAL — Files Entirely/Mostly in French

These files have nearly ALL visible text hardcoded in French. They need a complete i18n pass.

### 1. `design/sheet.astro` (529 lines)

**i18n frontmatter:** Has `d`, `p` but almost nothing uses them.

| Line(s) | Hardcoded Text | Suggested Key |
|---------|----------------|---------------|
| 31 | `"Panneau coulissant accessible en pur CSS sans JavaScript"` (description fallback) | `p.description` |
| 35 | `"Le composant Sheet crée un panneau coulissant..."` (intro fallback) | `p.intro` |
| 38 | Alert content in French | `p.alertZeroJs` |
| 42-50 | TOC labels: `"Utilisation basique"`, `"Couleurs"`, `"Côtés d'ouverture"`, `"Accessibilité"` | `p.toc.*` |
| 51 | `title={d.tableOfContents ?? "Table des matières"}` | OK pattern but French fallback |
| 65-90 | Props descriptions in French: `"ID unique pour le checkbox caché"`, `"Variante de style visuel"`, `"Classes CSS supplémentaires"` | `p.props.*` |
| 96 | `"Utilisation basique"` | `d.basicUsage` |
| 100-140 | All demo button/sheet text in French: `"Ouvrir le Sheet"`, `"Titre du Sheet"`, `"Fermer"`, `"Contenu..."` | `p.demo.*` |
| 155 | `<h2 id="colors">Couleurs des boutons</h2>` | `p.buttonColors` |
| 160-250 | Color button labels: `"Bouton Default"`, `"Bouton Primary"`, `"Couleur par défaut"`, `"Couleur primaire"` | `p.colors.*` |
| 320-330 | Side headings: `"Droit (par défaut)"`, `"Gauche"`, `"Haut"`, `"Bas"` | `p.sides.*` |
| 330-400 | All side demo labels: `"Ouvrir depuis la droite"`, `"Sheet droit"`, `"S'ouvre depuis la droite"`, `"Contenu depuis la droite..."` etc. | `p.sideDemo.*` |
| 430-450 | API table descriptions in French: `"ID du checkbox (doit correspondre à Sheet.id)"`, `"Côté depuis lequel le sheet glisse"` | `p.apiProps.*` |
| 470-475 | `"Accessibilité"` fallback, Alert in French | Already correct pattern, French fallback |
| 477-495 | Accessibility list in French: `"Pure CSS : Aucun JavaScript requis..."`, `"Checkbox pattern..."`, `"Pseudo-classe :has()..."` | `p.a11yItems` |
| 497-510 | "Comment ça marche ?" section entirely in French | `p.howItWorks` |
| 515-520 | Alert "Avantages" in French | `p.advantages` |

### 2. `templates/header.astro` (174 lines)

**i18n frontmatter:** Has `d`, `p` for headerTemplate.

| Line(s) | Hardcoded Text | Suggested Key |
|---------|----------------|---------------|
| 44-48 | TOC labels: `"Included Components"`, `"Usage"`, `"Props"`, `"Variants"`, `"Responsive"` — mixed EN fallback but href in French: `#composants`, `#utilisation` | `p.toc.*` |
| 49 | `title="Table of Contents"` | `d.tableOfContents` |
| 52 | `<h2 id="composants">Composants inclus</h2>` — **French heading** | `p.includedComponents` |
| 54 | `<p>Le Header est composé de plusieurs sous-composants :</p>` — French | `p.headerComposition` |
| 56-60 | `<li>` items in French: `"Brand - Logo et nom du site..."`, `"Navigation - Menu principal..."`, `"ThemeSwitch - Bouton pour changer..."`, `"LangChooser - Dropdown pour changer..."` | `p.subComponents.*` |
| 63 | `<h2 id="utilisation">Utilisation</h2>` — French | `d.usage` |
| 73-75 | Alert in French: `"✅ Auto-inclus : Le Header est automatiquement inclus..."` | `p.alertAutoIncluded` |
| 85 | `d.default ?? "Défaut"` — French fallback | Should be `"Default"` |
| 91-101 | Props descriptions in French: `"Style visuel du header"`, `"Header fixe en haut (sticky)"`, `"Classes CSS supplémentaires"` | `p.propsDesc.*` |
| 106 | `<p>Le Header supporte les 4 variants visuels :</p>` — French | `p.variantsIntro` |
| 115-122 | Variant descriptions in French: `"Design épuré avec background subtle et border légère"`, `"Style rétro avec bordures épaisses..."`, `"Design moderne avec glassmorphism..."`, `"Style futuriste avec gradients néon..."` | `p.variantDesc.*` |
| 126 | `<p>Le Header s'adapte automatiquement...</p>` — French | `p.responsiveIntro` |
| 128-132 | Responsive items in French: `"Desktop : Navigation horizontale complète"`, `"Tablet : Navigation compacte..."`, `"Mobile : Menu hamburger..."` | `p.responsive.*` |
| 138-148 | "Fonctionnalités" list items in French | `p.features.*` |
| 150-153 | Alert in French: `"🌍 Multilingue : Le Header détecte automatiquement..."` | `p.alertMultilingual` |

### 3. `layouts/base.astro` (342 lines)

**i18n frontmatter:** Has `d`, `p` for baseLayout.

| Line(s) | Hardcoded Text | Suggested Key |
|---------|----------------|---------------|
| 40-47 | TOC labels mixed: `"Usage"`, `"Props"`, `"Features"`, `"Example"`, `"SEO and Metadata"`, `"Theme Management"` — href in French: `#utilisation`, `#fonctionnalites`, `#exemple`, `#seo`, `#theme` | `p.toc.*` |
| 49 | `title="Table of Contents"` | `d.tableOfContents` |
| 51 | `<h2 id="utilisation">Utilisation</h2>` — French | `d.usage` |
| 72 | `d.default ?? "Défaut"` — French fallback | Should be `"Default"` |
| 77-140 | ALL props descriptions in French: `"Titre de la page (format: SiteTitle > PageTitle)"`, `"Description meta pour SEO"`, `"Mots-clés meta pour SEO"`, `"Auteur de la page"`, `"Image Open Graph pour réseaux sociaux"`, `"URL canonique de la page"`, `"Langue de la page (fr, en, es, ar)"`, `"Direction du texte"`, `"Directives pour robots d'indexation"`, `"URLs à précharger"`, `"Fichiers CSS additionnels"`, `"Fichiers JavaScript additionnels"`, `"Nom du fichier favicon"`, `"Chemin vers le manifest PWA"`, `"Icône Apple Touch"` | `p.propsDesc.*` |
| 143 | `<h2 id="fonctionnalites">Fonctionnalités</h2>` — French | `p.features` |
| 146-195 | All feature Card content in French: `"🎨 Gestion du thème"`, `"Switch automatique light/dark..."`, `"🌍 Multilingue"`, `"Support natif de 4 langues..."`, `"🔍 SEO Optimisé"`, `"Métadonnées complètes..."`, `"⚡ Performance"`, `"Préchargement DNS..."`, `"♿ Accessibilité"`, `"HTML sémantique..."`, `"📱 Responsive"`, `"Design entièrement responsive..."` | `p.featureCards.*` |
| 198 | `<h2 id="exemple">Exemple complet</h2>` — French | `p.fullExample` |
| 224 | `<h2 id="seo">SEO et Métadonnées</h2>` — French | `p.seoTitle` |
| 226 | `<p>Le BaseLayout génère automatiquement :</p>` — French | `p.seoIntro` |
| 228-240 | All SEO list items in French | `p.seoItems.*` |
| 242-244 | Alert in French: `"💡 Astuce SEO : Toujours définir un title..."` | `p.alertSeo` |
| 247 | `<h2 id="theme">Gestion du thème</h2>` — French | `p.themeTitle` |
| 249-274 | All theme paragraphs in French | `p.theme.*` |
| 300-310 | `<h2>Structure HTML</h2>` + paragraph in French | `p.htmlStructure` |
| 322-326 | Alert in French: `"📦 Composants inclus : Le BaseLayout inclut..."` | `p.alertIncluded` |
| 328-338 | Font section in French: `"Polices"`, `"Le layout charge automatiquement 2 familles..."`, list items in French, Alert in French | `p.fonts.*` |

### 4. `templates/footer.astro` (~95 lines)

**i18n frontmatter:** Has `d`, `p` for footerTemplate.

| Line(s) | Hardcoded Text | Suggested Key |
|---------|----------------|---------------|
| 26 | `<h2>Utilisation</h2>` — French heading (no i18n key) | `d.usage` |
| 36 | Alert in French: `"✅ Auto-inclus : Le Footer est automatiquement inclus..."` | `p.alertAutoIncluded` |
| 39 | `<h2>Contenu</h2>` — French | `p.content` |
| 41-48 | Content list entirely in French: `"Informations entreprise (nom, description, SIRET)"`, `"Coordonnées de contact..."`, `"Liens légaux..."`, `"Liens réseaux sociaux"`, `"Copyright automatique avec année"`, `"Multilingue avec traductions i18n"` | `p.contentItems.*` |
| 50 | `<h2>Structure</h2>` — French heading | `p.structure` |
| 78 | `<h2>{d.customization ?? "Personnalisation"}</h2>` — French fallback | `"Customization"` |
| 80 | `<p>Pour personnaliser le footer, modifiez les traductions...</p>` — French | `p.customizationIntro` |

---

## 🟠 HIGH — Hardcoded Section Headings

Almost every file has `<h2>` and `<h3>` tags with hardcoded English text instead of using `d.*` or `p.*` keys. This is the most widespread issue.

### Pattern: Headings that should use `d.*` common keys

These headings appear across many files and should use the existing common translation keys:

| Heading Text | Should Use | Files Affected |
|-------------|-----------|----------------|
| `<h2>Basic Examples</h2>` | `d.basicExamples` | alert, badge, link |
| `<h2>Variants</h2>` | `{d.variants}` ✅ (many already use it) | — |
| `<h2>Advanced options</h2>` | `d.advancedOptions` | pagination |
| `<h2>With labels</h2>` | `p.withLabels` | progressbar |
| `<h2>Custom sizes</h2>` | `p.customSizes` | skeleton |
| `<h2>Multiple skeletons</h2>` | `p.multiple` | skeleton |
| `<h2>Compositions</h2>` | `p.compositions` | skeleton |
| `<h2>Auto Scroll</h2>` | `p.autoScroll` | slider |
| `<h2>Smart logic</h2>` | `p.smartLogic` | pagination |
| `<h2>Full example</h2>` | `p.fullExample` | pagination |
| `<h2>Usage with Astro</h2>` | `p.usageWithAstro` | pagination |
| `<h2>Responsive</h2>` | `p.responsive` | table, timeline |
| `<h2>Data examples</h2>` | `p.dataExamples` | timeline |
| `<h2>Available components</h2>` | `p.availableComponents` | table, tabs, form |
| `<h2>Technical details</h2>` | `p.technicalDetails` | tabs |
| `<h2>Pure CSS Architecture</h2>` | `p.cssPureArchitecture` | gallery, dropdown |

### Per-File Hardcoded Headings (non-French files)

#### `design/alert.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 106 | `<h2 id="basic-examples">Basic Examples</h2>` | `d.basicExamples` |
| 108 | `<h3 id="statuses">Different statuses</h3>` | `p.differentStatuses` |
| 135 | `<h3 id="with-title">With title</h3>` | `p.withTitle` |
| 153 | `<h3 id="with-slot">With custom content (slot)</h3>` | `p.withSlot` |
| 178-180 | `<h3>Initial (Default)</h3>`, `<h3>Retro</h3>`, `<h3>Modern</h3>`, `<h3>Futuristic</h3>` | `d.variantInitial`, `d.variantRetro`, `d.variantModern`, `d.variantFuturistic` |
| 231 | `<h2 id="with-icons">With custom icons</h2>` | `p.withCustomIcons` |
| 253 | `<h2 id="dismissible">Dismissible alerts</h2>` | `p.dismissible` |
| 274 | `<h3 id="success-notification">Success notification</h3>` | `p.successNotification` |
| 293 | `<h3 id="error-message">Error message</h3>` | `p.errorMessage` |
| 305 | `<h3 id="important-warning">Important warning</h3>` | `p.importantWarning` |
| 323 | `<h3 id="system-info">System information</h3>` | `p.systemInfo` |

#### `design/badge.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 85 | `<h2 id="basic-examples">Basic Examples</h2>` | `d.basicExamples` |
| 87 | `<h3 id="simple-badges">Simple Badges</h3>` | `p.simpleBadges` |
| 99 | `<h3 id="with-slot">With slot</h3>` | `p.withSlot` |
| 155 | `<h2 id="dismissible">Dismissible badges</h2>` | `p.dismissible` |
| 177 | `<h3 id="counters">Counters</h3>` | `p.counters` |
| 196 | `<h3 id="statuses">Statuses</h3>` | `p.statuses` |
| 210 | `<h3 id="tags">Tags</h3>` | `p.tags` |
| 230 | `<h3 id="versions">Versions</h3>` | `p.versions` |
| 244 | `<h2 id="combinations">Variants + colors combinations</h2>` | `p.combinations` |

#### `design/button.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 87 | `<h2 id="variants">The 4 Variants</h2>` | `d.variants` |
| 89-93 | `<h3>Initial (Default)</h3>`, `<h3>Retro</h3>`, etc. | `d.variant*` |
| 170 | `<h2 id="types">Button Types</h2>` | `p.buttonTypes` |
| 185 | `<h2 id="icons">Buttons with Icons</h2>` | `p.buttonsWithIcons` |
| 187 | `<h3>Icon on Left</h3>` | `p.iconOnLeft` |
| 236 | `<h3>Icon on Right</h3>` | `p.iconOnRight` |
| 282 | `<h3>Icon-Only Button</h3>` | `p.iconOnlyButton` |
| 320 | `<h2 id="states">Button States</h2>` | `p.buttonStates` |
| 322 | `<h3>Disabled</h3>` | `d.disabled` |
| 340 | `<h2 id="examples">Usage Examples</h2>` | `d.examples` |
| 342 | `<h3>Login Form</h3>` | `p.loginForm` |
| 380 | `<h3>Action Buttons</h3>` | `p.actionButtons` |
| 404 | `<h3>Navigation Buttons</h3>` | `p.navigationButtons` |
| 436 | `<h2 id="best-practices">Best Practices</h2>` — should use `{d.bestPractices}` | `d.bestPractices` |
| 446 | `<h2 id="css">CSS Customization</h2>` | `p.cssCustomization` |
| 452 | `<h3>CSS Variables Used</h3>` | `p.cssVariables` |
| 464 | `<h2>Comparison with Link</h2>` | `p.comparisonWithLink` |

#### `design/card.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~200 | `<h2 id="elevations">Elevations</h2>` | `p.elevations` |
| ~250 | `<h2 id="interactive-card">Interactive</h2>` | `p.interactive` |
| ~350 | `<h2 id="aspect-ratios">Aspect Ratios</h2>` | `p.aspectRatios` |
| ~400 | `<h2 id="custom-meta">Custom meta</h2>` | `p.customMeta` |
| ~450 | `<h2 id="footer-alignment">Footer alignment</h2>` | `p.footerAlignment` |

#### `design/code.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 56 | `<h1 id="code-component">Code Component</h1>` | `p.title` (NOT using `{p.title}` pattern!) |
| 58-60 | Paragraph hardcoded | `p.intro` |
| ~80 | `Basic usage`, `TypeScript`, `HTML`, `CSS`, `Inline code`, `Shiki themes`, `Line wrapping`, `Resources` | `p.*` section keys |

#### `design/dialog.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| TOC | `"Installation"`, `"Basic usage"`, `"Variants"`, `"Sizes"`, `"With form"`, `"External trigger"`, `"API Reference"` | `p.toc.*` |
| ~120 | `<h2>Basic usage</h2>` and other sections | `d.basicUsage` |
| 263 | `"Fermer"` — **French** in button | Demo content |
| ~281 | `"Edit Profile"` form with labels `"Name"`, `"Email"` | Demo content |
| ~350 | `"Native features"` | `p.nativeFeatures` |

#### `design/dropdown.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 24-60 | Menu items: `"Profile"`, `"Settings"`, `"Messages"` etc. | Demo content (OK) |
| ~180 | `<h2 id="recursive">Recursive Menus (multi-level)</h2>` | `p.recursiveMenus` |
| ~250 | `<h2 id="features">Features</h2>` | `p.features` |
| ~300 | `"Menu with links"`, `"Disabled items"`, `"Long menu with scroll"` | `p.*` |
| ~400 | `"Responsive & Smart Positioning"` | `p.responsive` |
| ~450 | `"Pure CSS Architecture"` | `p.cssArchitecture` |

#### `design/form.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 67 | `<h2 id="formcard">FormCard</h2>` | `p.formCard` |
| 69-71 | Paragraph text | `p.formCardIntro` |
| 73 | `<h3>Props</h3>` | `d.props` |
| 98 | `<h3>Examples - All variants</h3>` | `p.examplesAllVariants` |
| ~200 | `<h2 id="input">Input</h2>` | `p.input` |
| ~300 | `<h2 id="password">PasswordInput</h2>` | `p.password` |
| ~400 | `<h2 id="textarea">Textarea</h2>` | `p.textarea` |
| ~540 | `<h2 id="select">Select</h2>` | `p.select` |
| ~600 | `<h2 id="checkbox">Checkbox</h2>` | `p.checkbox` |
| ~650 | `<h2 id="radio">Radio</h2>` | `p.radio` |
| ~720 | `<h2 id="switch">Switch</h2>` | `p.switch` |
| ~760 | `<h2 id="datepicker">DatePicker</h2>` | `p.datepicker` |
| ~810 | `<h2 id="accessibility">FULL Accessibility</h2>` | `d.accessibility` |

#### `design/kbd.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~50 | `<h2>Quick demo</h2>` | `p.quickDemo` |
| ~100 | `<h2 id="shortcuts">Keyboard shortcuts</h2>` | `p.keyboardShortcuts` |
| ~150 | `<h2 id="symbols">Symbols and special keys</h2>` | `p.symbolsSpecialKeys` |
| ~200 | `"Command documentation"`, `"Editor shortcuts"`, `"Form instructions"`, `"Search interface"`, `"Global search"` | `p.*` |
| ~150 | `"Spécial"` — **French** label in symbols section | Bug |

#### `design/link.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 39 | `<p>The component is available in` | `d.componentAvailableIn` |
| ~100 | `<h2>Basic Examples</h2>` | `d.basicExamples` |
| ~105 | `<h3>Simple Link</h3>` | `p.simpleLink` |
| ~115 | `<h3>With Icon</h3>` | `p.withIcon` |
| ~150 | `<h2>Variants - Link Style</h2>` | `p.variantsLinkStyle` |
| ~200 | `<h2>Variants - Button Style</h2>` | `p.variantsButtonStyle` |
| ~250 | `<h2>Buttons with Icons</h2>` | `p.buttonsWithIcons` |
| ~300 | `<h2>External Links</h2>` | `p.externalLinks` |
| ~330 | `<h2>HTML Button</h2>` | `p.htmlButton` |
| ~370 | `<h2>In a Navigation</h2>` | `p.inNavigation` |

#### `design/menudropdown.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~100 | `<h2 id="features">"Master" Features (Zero-JS)</h2>` | `p.masterFeatures` |
| ~150 | Feature list items | `p.featureItems.*` |

#### `design/table.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~50 | `<h2>Quick demo</h2>` | `p.quickDemo` |
| ~330 | `<h2 id="responsive">Responsive (horizontal scroll)</h2>` | `p.responsive` |
| ~400 | `<h2 id="variants">All variants</h2>` | `d.variants` |
| ~560 | `<h2 id="components">Available components</h2>` | `p.availableComponents` |
| ~630 | `<h2 id="examples">Advanced examples</h2>` | `p.advancedExamples` |

#### `design/tabs.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~50 | `<h2>Interactive demo</h2>` | `p.interactiveDemo` |
| ~430 | `<h2>Technical details</h2>` | `p.technicalDetails` |
| ~460 | `<h2>Available components</h2>` | `p.availableComponents` |

#### `design/tooltip.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~300 | `<h2>Best Practices</h2>` | `d.bestPractices` |
| ~320 | `<h2>Full Example</h2>` | `p.fullExample` |

#### `components/pagination.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 120 | `<h3>Automatic edge case handling</h3>` | `p.autoEdgeCases` |
| 157 | `<h3>Initial (défaut)</h3>` — **French** | `d.variantInitial` |
| 250 | `<h2 id="options">Advanced options</h2>` | `p.advancedOptions` |
| 252 | `<h3>With first/last page buttons</h3>` | `p.withFirstLast` |
| 260 | `<h3>Without previous/next buttons</h3>` | `p.withoutPrevNext` |
| 268 | `<h3>More visible pages (siblingCount)</h3>` | `p.moreSiblings` |
| 305 | `<h3>Smart display with "..."</h3>` | `p.smartEllipsis` |
| 335 | `<h3>Custom URL</h3>` | `p.customUrl` |
| 365 | `<h2>Smart logic</h2>` | `p.smartLogic` |
| 385 | `<h2>Full example</h2>` | `p.fullExample` |
| 410 | `<h2>Usage with Astro</h2>` | `p.usageWithAstro` |

#### `components/progressbar.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 214 | `<h2 id="labels">With labels</h2>` | `p.withLabels` |
| 216 | `<h3>Automatic percentage</h3>` | `p.autoPercentage` |
| 224 | `<h3>Custom label</h3>` | `p.customLabel` |
| 246 | `<h3>With stripes</h3>` | `p.withStripes` |
| 257 | `<h3>Animated stripes</h3>` | `p.animatedStripes` |
| 265 | `<h3>Combinations</h3>` | `p.combinations` |

#### `components/skeleton.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 154 | `<h3>Rectangular (default)</h3>` | `p.rectangular` |
| 163 | `<h3>Circular</h3>` | `p.circular` |
| 177 | `<h3>Rounded</h3>` | `p.rounded` |
| 186 | `<h2 id="sizes">Custom sizes</h2>` | `p.customSizes` |
| 202 | `<h2 id="multiple">Multiple skeletons</h2>` | `p.multiple` |
| 218 | `<h2 id="compositions">Compositions</h2>` | `p.compositions` |
| 221 | `<h3>Card Skeleton</h3>` | `p.cardSkeleton` |
| 244 | `<h3>User Profile Skeleton</h3>` | `p.profileSkeleton` |
| 268 | `<h3>List Skeleton</h3>` | `p.listSkeleton` |
| 307 | `<h3>Without animation</h3>` | `p.withoutAnimation` |

#### `components/slider.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 69 | `title="Table of Contents"` — NOT using `d.tableOfContents` | `d.tableOfContents` |
| 122 | `<h3 id="initial">Initial (Default)</h3>` | `d.variantInitial` |
| 156 | `<h3 id="retro">Retro</h3>` | `d.variantRetro` |
| 187 | `<h3 id="modern">Modern</h3>` | `d.variantModern` |
| 213 | `<h3 id="futuristic">Futuristic</h3>` | `d.variantFuturistic` |
| 248 | `<h3>Primary</h3>`, `<h3>Secondary</h3>`, `<h3>Accent</h3>` | `d.colorPrimary`, etc. |
| 300 | `<h2 id="auto-scroll">Auto Scroll</h2>` | `p.autoScroll` |
| 340 | `<h3>Custom Gap and Width</h3>` | `p.customGapWidth` |
| 370 | `<h3>Without Controls</h3>` | `p.withoutControls` |
| 395 | `<h3>Slider Props</h3>` | `p.sliderProps` |
| 460 | `<h3>SliderItem Props</h3>` | `p.sliderItemProps` |
| 475 | `<h3>Features</h3>` | `p.features` |
| 492 | `<h3>Accessibility</h3>` | `d.accessibility` |
| 500 | `<h3>Performance</h3>` | `p.performance` |

#### `components/timeline.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 90 | `<h2 id="vertical">Vertical orientation</h2>` | `p.verticalOrientation` |
| 107 | `<h2 id="horizontal">Horizontal orientation</h2>` | `p.horizontalOrientation` |
| 124 | `<h2 id="alternate">Alternate orientation (Zigzag)</h2>` | `p.alternateOrientation` |
| 141 | `<h2 id="shapes">Icon shapes</h2>` | `p.iconShapes` |
| 145 | `<h3>Circle (Default)</h3>`, `<h3>Square</h3>`, `<h3>Diamond</h3>`, `<h3>Hexagon</h3>` | `p.shape*` |
| 210 | `<h3>Retro variant</h3>`, `<h3>Modern variant</h3>`, `<h3>Futuristic variant</h3>` | `d.variant*` |
| 260 | `<h3>Alternate with variants</h3>` | `p.alternateWithVariants` |
| 340 | `<h3>TimelineEvent Interface</h3>` | `p.eventInterface` |
| 355 | `<h2>Responsive</h2>` | `p.responsive` |
| 375 | `<h2>Data examples</h2>` | `p.dataExamples` |

#### `components/accordion.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~300+ | `<h3>With Modern variant</h3>`, `<h3>With Futuristic variant</h3>` | `p.*Variant` |
| ~370 | `<h2 id="single">Single mode (only one open)</h2>` | `p.singleMode` |

#### `components/breadcrumb.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~380 | `<h2 id="separators">Custom separators</h2>` | `p.customSeparators` |
| ~400 | `<h3>Default separator (/)</h3>`, `<h3>With chevron</h3>`, `<h3>With icon</h3>`, `<h3>With double arrow</h3>`, `<h3>With dot</h3>` | `p.separator*` |
| ~530 | `<h2 id="ellipsis">With ellipsis</h2>` | `p.withEllipsis` |
| ~630 | `<h2>Exemple complet</h2>` — **French** | `p.fullExample` |

#### `layouts/doc.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| ~100 | `<h2 id="features">Features</h2>` | `p.features` |
| ~180 | `<h2 id="example">Full example</h2>` | `p.fullExample` |
| ~220 | `<h2 id="sidebar">Navigation sidebar</h2>` | `p.sidebar` |
| ~240 | `<h2 id="toc">Automatic table of contents</h2>` | `p.autoToc` |
| ~275 | `<h2>Layout structure</h2>` | `p.layoutStructure` |
| ~295 | `<h2>Responsive grid layout</h2>` | `p.responsiveGrid` |

#### `templates/table-of-contents.astro`
| Line | Text | Suggested Key |
|------|------|---------------|
| 54 | `title="Table of Contents"` | `d.tableOfContents` |
| ~150 | `<h3>Long Table of Contents</h3>` | `p.longToc` |
| ~165 | `title="Complete Summary"` | `p.completeSummary` |
| ~175 | `<h3>Custom Title</h3>` | `p.customTitle` |
| ~200 | `<h3>Features</h3>` | `p.features` |
| ~220 | `<h3>Best Practices</h3>` | `d.bestPractices` |

---

## 🟠 HIGH — Props Table Descriptions Hardcoded

Nearly every file has a `<Table>` for props documentation where the Description column cells are hardcoded strings (either English or French). The table headers correctly use `d.prop`, `d.type`, `d.default`, `d.description`, but the actual description values do not.

### Files with hardcoded props descriptions

| File | Example descriptions (all hardcoded) |
|------|--------------------------------------|
| `design/alert.astro` | "Visual style of the alert", "Severity level", "Alert title", "Alert message", "Custom icon", "Show a close button", "Additional CSS classes" |
| `design/badge.astro` | "Badge visual style", "Badge color", "Badge text", "Icon and position", "Shows a close button", "Accessibility label" |
| `design/button.astro` | All props descriptions hardcoded |
| `design/card.astro` | "Visual style", "Shadow depth", "Hover/focus effects", "Custom CSS classes", "Image URL", "Alt text" |
| `design/code.astro` | All props descriptions hardcoded |
| `design/dialog.astro` | All API Reference descriptions hardcoded |
| `design/dropdown.astro` | All props descriptions hardcoded |
| `design/form.astro` | All FormCard/Input/etc. props descriptions hardcoded |
| `design/kbd.astro` | All props descriptions hardcoded |
| `design/link.astro` | All props descriptions hardcoded |
| `design/menudropdown.astro` | All props descriptions hardcoded |
| `design/sheet.astro` | **In French**: "ID unique pour le checkbox caché", etc. |
| `design/switch.astro` | All props descriptions hardcoded |
| `design/table.astro` | All props descriptions hardcoded |
| `design/tabs.astro` | All props descriptions hardcoded |
| `design/tooltip.astro` | All props descriptions hardcoded |
| `design/video.astro` | All props descriptions hardcoded |
| `components/accordion.astro` | All props descriptions hardcoded |
| `components/avatar.astro` | **Mixed French/English**: "Classes CSS supplémentaires" |
| `components/breadcrumb.astro` | All API descriptions hardcoded |
| `components/gallery.astro` | All props descriptions hardcoded |
| `components/pagination.astro` | "Current page (1-based, required)", "Total number of pages", "Base URL for links", etc. |
| `components/progressbar.astro` | "The visual style of the progress bar", "The current progress value", etc. (note "Requis" in French for default column) |
| `components/skeleton.astro` | "The visual style of the skeleton", "Custom width", "Renders as a circle", etc. |
| `components/slider.astro` | "Visual style of the slider", "Color scheme", "Space between items", etc. — also uses `<TableHeader>` inside `<TableHead>` (swapped nesting!) |
| `components/timeline.astro` | "Array of events to display", "Visual style of the timeline", etc. |
| `templates/header.astro` | **In French**: "Style visuel du header", "Header fixe en haut (sticky)", "Classes CSS supplémentaires" |
| `layouts/base.astro` | **All in French**: "Titre de la page", "Description meta pour SEO", etc. |
| `layouts/doc.astro` | "Documentation page title", "Page meta description", "Visual style of the documentation" |
| `templates/table-of-contents.astro` | "List of navigation items", "Component title", "Visual style of the component" |

**Suggested approach:** Create `p.propsDesc.*` keys per component, e.g.:
```
t.docs.pages.alert.propsDesc.variant = "Visual style of the alert"
t.docs.pages.alert.propsDesc.status = "Severity level"
```

---

## 🟠 HIGH — TableOfContents Labels Hardcoded

Almost every file passes hardcoded label strings in the `items` array prop of `<TableOfContents>` / `<TOC>`.

### Files with hardcoded TOC labels

| File | Hardcoded Labels |
|------|-----------------|
| `design/alert.astro` | Uses `{d.installation}` etc. — ✅ Better than most |
| `design/dialog.astro` | "Installation", "Basic usage", "Variants", "Sizes", "With form", "External trigger", "API Reference" |
| `design/dropdown.astro` | "Installation", "Trigger + menu", "Features", "Recursive", "Props", "Responsive", "Pure CSS" |
| `design/form.astro` | "FormCard", "Alert (Validation Messages)", "Input", "Password", "Textarea", "Select", "Checkbox", "Radio", "Switch", "DatePicker", "Accessibility", "Best practices" |
| `design/kbd.astro` | All hardcoded labels |
| `design/link.astro` | All hardcoded labels |
| `design/menudropdown.astro` | All hardcoded labels |
| `design/sheet.astro` | **French**: "Utilisation basique", "Couleurs", "Côtés d'ouverture" |
| `design/switch.astro` | All hardcoded labels |
| `design/table.astro` | All hardcoded labels |
| `design/tabs.astro` | All hardcoded labels |
| `design/tooltip.astro` | All hardcoded labels |
| `design/video.astro` | All hardcoded labels |
| `components/accordion.astro` | All hardcoded labels |
| `components/avatar.astro` | All hardcoded labels |
| `components/breadcrumb.astro` | All hardcoded labels |
| `components/gallery.astro` | All hardcoded labels |
| `components/pagination.astro` | "Installation", "Props", "Basic usage", "Variants", "Colors", "Sizes", "Advanced options", "Accessibility" |
| `components/progressbar.astro` | "Installation", "Props", "Basic usage", "Variants", "Colors", "Sizes", "With labels", "Stripes and animations", "Accessibility" |
| `components/skeleton.astro` | "Installation", "Props", "Basic usage", "Variants", "Shapes", "Custom sizes", "Multiple skeletons", "Compositions", "Accessibility" |
| `components/slider.astro` | "Installation", "Basic Usage", "Variants", "Colors", "Auto Scroll", "Customization", "API Reference" |
| `components/timeline.astro` | "Installation", "Vertical orientation", "Horizontal orientation", "Alternate orientation", "Icon shapes", "Variants", "API Reference" |
| `layouts/base.astro` | "Usage", "Props", "Features", "Example", "SEO and Metadata", "Theme Management" |
| `layouts/doc.astro` | "Usage", "Props", "Features", "Full example", "Navigation sidebar", "Automatic table of contents" |
| `templates/table-of-contents.astro` | "Usage", "Variants", "Props", "Examples", "Accessibility" |
| `templates/header.astro` | "Included Components", "Usage", "Props", "Variants", "Responsive" |

### TOC `title` prop hardcoded

Many files use `title="Table of Contents"` directly instead of `title={d.tableOfContents ?? "Table of Contents"}`.

| File | Current | Should Be |
|------|---------|-----------|
| `design/dialog.astro` | `title="Table of Contents"` | `title={d.tableOfContents ?? "Table of Contents"}` |
| `components/slider.astro` | `title="Table of Contents"` | `title={d.tableOfContents ?? "Table of Contents"}` |
| `templates/header.astro` | `title="Table of Contents"` | `title={d.tableOfContents ?? "Table of Contents"}` |
| `layouts/base.astro` | `title="Table of Contents"` | `title={d.tableOfContents ?? "Table of Contents"}` |
| `layouts/doc.astro` | `title="Table of Contents"` | `title={d.tableOfContents ?? "Table of Contents"}` |
| `templates/table-of-contents.astro` | `title="Table of Contents"` (multiple instances) | `title={d.tableOfContents ?? "Table of Contents"}` |

---

## 🟡 MEDIUM — Instructional Paragraphs Hardcoded

### Recurring pattern: "The component is available in/at..."

| File | Line | Text |
|------|------|------|
| `design/alert.astro` | 57 | `<p>The component is available at...` |
| `design/badge.astro` | 33 | `<p>The component is available in...` |
| `design/button.astro` | 33 | `<p>The component is available in...` |
| `design/link.astro` | 39 | `<p>The component is available in...` |

**Suggested key:** `d.componentAvailableIn` (with HTML interpolation for variant list)

### Other hardcoded paragraphs by file

| File | Line(s) | Text |
|------|---------|------|
| `design/alert.astro` | 255 | "Alerts can be closed by the user with the..." |
| `design/badge.astro` | 157 | "Badges can be closed by the user..." |
| `design/button.astro` | 448-449 | CSS customization paragraph |
| `design/button.astro` | 466-470 | Comparison paragraph |
| `design/code.astro` | 58-60 | "Astro provides a built-in Code component..." |
| `design/code.astro` | 64 | Installation paragraph |
| `components/pagination.astro` | 114 | "Simple example with 10 pages, page 5 active:" |
| `components/pagination.astro` | 122-130 | "Page 1 (no previous button):", "Page 10 (no next button):", "Single page (no navigation):" |
| `components/pagination.astro` | 187 | "Colors apply to the active page:" |
| `components/progressbar.astro` | 310 | Accessibility explanation paragraph |
| `components/skeleton.astro` | 203 | "Use the count prop..." |
| `components/slider.astro` | ~80 | "Simple slider with product cards." |
| `components/slider.astro` | ~125 | "Clean and minimalist design." |
| `components/slider.astro` | ~160 | "Retro style with thick borders and drop shadows." |
| `components/slider.astro` | ~190 | "Modern design with glassmorphism and gradients." |
| `components/slider.astro` | ~215 | "Futuristic design with neon lights and glowing effects." |
| `components/slider.astro` | ~375 | "Slider without navigation buttons (touch navigation only)." |
| `components/timeline.astro` | ~92 | "Classic vertical timeline with line on the left." |
| `components/timeline.astro` | ~110 | "Horizontal timeline with scroll (perfect for mobile)." |
| `components/timeline.astro` | ~127 | "Zigzag timeline with alternating left/right elements." |

---

## 🟡 MEDIUM — Accessibility & Best Practices Lists Hardcoded

Every file's Accessibility and Best Practices sections contain hardcoded `<li>` items.

| File | Section | Items Count |
|------|---------|-------------|
| `design/alert.astro` | Accessibility | 6 items |
| `design/alert.astro` | Best practices | 6 items |
| `design/badge.astro` | Accessibility | 4 items |
| `design/badge.astro` | Best practices | 5 items |
| `design/button.astro` | Accessibility | 5 items |
| `design/button.astro` | Best practices | 5 items |
| `design/card.astro` | Accessibility + Best practices | ~10 items |
| `design/link.astro` | Accessibility | ~6 items |
| `design/form.astro` | Accessibility | 7 items |
| `design/form.astro` | Best practices | 8 items |
| `components/pagination.astro` | Accessibility | 6 items |
| `components/pagination.astro` | Smart logic | 7 items |
| `components/avatar.astro` | Accessibility | 4 items, Best practices | 5 items |
| `components/breadcrumb.astro` | Accessibility | 5 items, Best practices | 5 items |
| `components/accordion.astro` | Accessibility | 5 items |
| `components/slider.astro` | Features | 13 items, Accessibility | 4 items, Performance | 4 items |
| `components/timeline.astro` | Responsive | 3 items |
| All other files | Similar pattern | — |

**Suggested approach:** Create `p.a11yItems` and `p.bestPracticeItems` arrays in translations.

---

## 🟡 MEDIUM — Demo Content / Labels

Some demo content contains hardcoded English (or French) user-facing text that would need translation for a fully localized doc site.

| File | Content |
|------|---------|
| `design/button.astro` | "Télécharger" (French), "Email", "Password", form labels |
| `design/button.astro` | Comparison table: "Use Case", "Component to Use", "Submit a form", "JavaScript action", etc. |
| `design/card.astro` | "Card title", "A simple description...", "Modern workspace", "Analytics Dashboard" |
| `design/dialog.astro` | "Basic Dialog", "Your dialog content goes here", "Edit Profile" form labels |
| `design/dialog.astro` | "Fermer" (French button label) |
| `design/kbd.astro` | "Open search", "Save", "New file", "Select all", "Copy", "Paste" |
| `design/table.astro` | Table headers and demo data: "ID", "Name", "Department", "Salary", "Framework", "Game", etc. |
| `components/slider.astro` | Testimonial data: names, roles, text (defined in frontmatter) |
| `components/timeline.astro` | Timeline events: "Company Founded", "First Product Launch", etc. (defined in frontmatter) |
| `components/progressbar.astro` | "45 of 100 files" / "3 / 10 steps" (English) in demo, but code block has French: "45 sur 100 fichiers" / "3 / 10 étapes" |
| `components/progressbar.astro` | "Downloading..." / "Téléchargement en cours..." mixed |

---

## 🟢 LOW — Tag Mismatch

### `design/button.astro` — `</Button>` instead of `</ButtonComponent>`

Lines ~93-97: The component is imported as `ButtonComponent` but closing tags use `</Button>`:

```astro
<ButtonComponent variant="initial">Default</Button>
<ButtonComponent variant="retro">Retro</Button>
<ButtonComponent variant="modern">Modern</Button>
<ButtonComponent variant="futuristic">Futuristic</Button>
```

**Fix:** Replace all `</Button>` with `</ButtonComponent>`.

---

## 🟢 LOW — Component Nesting Issue

### `components/slider.astro` — `<TableHeader>` inside `<TableHead>`

In the API Reference section (~line 395-470), the table uses swapped nesting:

```astro
<TableHead>
  <TableRow>
    <TableHeader>Prop</TableHeader>
    <TableHeader>Type</TableHeader>
    ...
  </TableRow>
</TableHead>
```

Should be:
```astro
<TableHeader>
  <TableRow>
    <TableHead>Prop</TableHead>
    <TableHead>Type</TableHead>
    ...
  </TableRow>
</TableHeader>
```

---

## Index Pages — French Fallbacks

### `components/index.astro`
All text uses `{key ?? "French fallback"}` pattern. Fallbacks are in French:
- `"Composants"`, `"Composants UI complexes composés de plusieurs éléments"`
- `"Sections dépliables"`, `"Photos de profil"`, `"Fil d'Ariane"`, etc.

**OK structurally** (uses i18n keys), but French fallbacks should become English for consistency.

### `layouts/index.astro`
Same pattern with French fallbacks:
- `"Layouts"`, `"Layouts structurels"`, `"Layout de base"`, `"Layout de documentation"`

### `templates/index.astro`
Same pattern with French fallbacks:
- `"Templates"`, `"Templates de page préfabriqués"`, `"En-tête"`, `"Pied de page"`, `"Table des matières"`

### `design/index.astro`
Uses `{key ?? "English fallback"}` — ✅ Better pattern. Minor: lines 92-96 have fallback strings for feature list.

---

## Summary of Common Keys Needed (`t.docs.common`)

These keys are already used in some files but should be standardized across all files:

| Key | Used For |
|-----|----------|
| `d.installation` | "Installation" heading |
| `d.props` | "Props" heading |
| `d.basicUsage` | "Basic usage" heading |
| `d.variants` | "Variants" heading |
| `d.colors` | "Colors" heading |
| `d.sizes` | "Sizes" heading |
| `d.accessibility` | "Accessibility" heading |
| `d.bestPractices` | "Best practices" heading |
| `d.apiReference` | "API Reference" heading |
| `d.tableOfContents` | TOC title |
| `d.prop` | Table header "Prop" |
| `d.type` | Table header "Type" |
| `d.default` | Table header "Default" |
| `d.description` | Table header "Description" |
| `d.examples` | "Examples" heading |
| `d.usage` | "Usage" heading |
| `d.customization` | "Customization" heading |

### New common keys to add:

| Suggested Key | Text | Usage |
|--------------|------|-------|
| `d.basicExamples` | "Basic Examples" | alert, badge, link |
| `d.componentAvailableIn` | "The component is available in..." | alert, badge, button, link |
| `d.variantInitial` | "Initial (Default)" | all variant subheadings |
| `d.variantRetro` | "Retro" | all variant subheadings |
| `d.variantModern` | "Modern" | all variant subheadings |
| `d.variantFuturistic` | "Futuristic" | all variant subheadings |
| `d.withIcons` | "With icons" | multiple files |
| `d.features` | "Features" | multiple files |
| `d.structure` | "Structure" | footer, base |
| `d.fullExample` | "Full example" | multiple files |
| `d.availableComponents` | "Available components" | table, tabs, form |

---

## Recommended Action Plan

1. **Phase 1 — Critical French pages** (4 files): sheet.astro, header.astro, base.astro, footer.astro
2. **Phase 2 — Common keys standardization**: Add missing `d.*` keys to translation files, update all h2/h3 to use `{d.key ?? "fallback"}`
3. **Phase 3 — TOC labels**: Create per-page TOC translation keys or use common keys
4. **Phase 4 — Props descriptions**: Create `p.propsDesc.*` keys per component
5. **Phase 5 — Instructional text**: Extract paragraphs to `p.*` keys
6. **Phase 6 — Accessibility/Best practices lists**: Extract list items to translation arrays
7. **Phase 7 — Bug fixes**: button.astro tag mismatch, slider.astro nesting, French fallbacks → English
