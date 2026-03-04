## Plan: Concordia — Audit complet & Roadmap

**TL;DR** — Le projet Concordia est fonctionnellement très avancé : auth complète, blog CRUD, services CRUD, orgs, i18n 4 locales, 38 fichiers de tests, 18 schémas DB synchronisés avec 6 migrations. Le code compile (`astro check → 0 errors`). Les lacunes sont principalement des manques de couverture test, quelques bugs de filtrage DB, et des fonctionnalités secondaires absentes par rapport aux wireframes/specs.

---

### A. CE QUI FONCTIONNE (acquis solides)

| Module | État | Détail |
|---|---|---|
| **Auth** | **Complet** | Sign-in/up, email verify, forgot/reset password, session, rate-limit, RBAC/ABAC 155+ permissions, 9 rôles |
| **Blog admin** | **Complet** | Articles CRUD, authors, categories, comments, media upload, markdown editor, multi-locale |
| **Blog public** | **Complet** | Index hero, catégorie, article slug, author page, TOC, related posts, SEO |
| **Services admin** | **Complet** | CRUD listings + media gallery + categories + bookings (détail+liste) + availability + duplicate + org scoping |
| **Services public** | **Complet** | Index hero+search+catégories, category page (sidebar filtres, grid/list, sort), detail (gallery lightbox, reviews, provider card, booking form fonctionnel) |
| **Org admin** | **Complet** | Dashboard, profile, members, blog, services, bookings — org-scoped, 3-layer fallback middleware |
| **Org public** | **Complet** | Index, detail [slug], org services page |
| **Media pipeline** | **Complet** | `MediaPickerModal` paramétrable (`apiBase`), API services media séparée, `servicesMediaLinks` correctement câblé create/update/delete/duplicate |
| **i18n** | **Complet** | 4 locales (fr/en/es/ar), slug mapping bidirectionnel, RTL support, prefix routing |
| **Design system** | **Complet** | 37+ composants UI, 4 thèmes (futuristic/initial/modern/retro), docs pages |
| **DB** | **Complet** | 18 schémas, 6 migrations synchronisées, 18 fichiers seed, Drizzle ORM |
| **Middleware** | **Complet** | 5 layers : security headers, locale redirect, CSRF, auth session, protected routes |
| **Tests base** | **38 fichiers** | E2E (Playwright): 18, Integration (Vitest): 6, Unit: 4, i18n: 4, Pages: 1, Security: 1, SSR: 1, A11y: 1 |

---

### B. BUGS À CORRIGER (priorité haute)

| # | Bug | Fichier | Ligne | Impact |
|---|---|---|---|---|
| **B1** | `whereClause` reduce — drop des conditions quand filtre multiples (search + role combinés) | admin/users/index.astro | ~L57-59 | Filtrage cassé si 2+ filtres actifs |
| **B2** | Même bug `whereClause` reduce dans GET media listing | api/admin/services/media.ts | L39 | Filtrage type+search combiné cassé |
| **B3** | Même bug potentiel dans | api/admin/blog/media.ts | GET filter | Idem |
| **B4** | Pas de vérification unicité slug à la création article blog | api/admin/blog/articles.ts | create action | Slug dupliqués possibles |
| **B5** | Bearer token blacklist + email failure map sont en mémoire — perdus au restart | lib/auth/auth.ts | ~L50 | Tokens invalidés re-acceptés après deploy |
| **B6** | Admin hours check ignore le timezone | lib/auth/permissions.ts | — | Accès admin échoue si serveur en UTC |

---

### C. MANQUES FONCTIONNELS (par rapport aux wireframes)

| # | Fonctionnalité | Wireframe ref | État |
|---|---|---|---|
| **C1** | Vue calendrier bookings admin | `gestion_des_réservations_organisation` | **Absent** — table seulement, pas de toggle calendrier mensuel |
| **C2** | Pagination serveur sur [category].astro services | `catégorie_de_services_-_liste_filtrée` | Client-side seulement (prerender: true) — OK pour < 100 services, pas scalable |
| **C3** | Page config admin : édition réelle des paramètres | `configuration_des_commissions_-_super_admin_1/2` | Read-only, aucun champ éditable |
| **C4** | Modération étendue (reviews, forum, classifieds) | `modération_globale_des_commentaires` | Blog comments seulement |
| **C5** | Centre de notifications UI complet | `centre_de_notifications_complet` | Schema + seed existent, **aucune page UI** |
| **C6** | Messagerie instantanée | `messagerie_instantanée_concordia` | **Non implémenté** — specs décrivent `conversation`, `message` entités |
| **C7** | Système de devis / signature électronique | `historique_des_versions_du_devis`, `signature_électronique_du_devis_1/2` | **Non implémenté** |
| **C8** | Gestion des litiges / médiation | `gestion_des_litiges_-_super_admin_1/2` | **Non implémenté** — specs définissent `mediation_case`, `mediation_session` |
| **C9** | Recensement de la cité (annuaire membres) | `recensement_de_la_cité_-_concordia` | **Non implémenté** |
| **C10** | Recherche globale | `recherche_globale_concordia` | **Non implémenté** — SearchBar UI existe mais pas de page/API |
| **C11** | Profil public citoyen | `profil_public_du_citoyen` | La page `/profile` existe mais c'est un profil privé, pas public |
| **C12** | Onboarding organisation | `onboarding_organisation_-_création_d'espace` | La page `new.astro` existe mais pas de wizard step-by-step |
| **C13** | Paramètres d'accessibilité | `paramètres_d'accessibilité_concordia` | **Non implémenté** — RTL supporté, mais aucune page settings |
| **C14** | Interface traduction i18n admin | `interface_de_traduction_de_contenu_(i18n)` | Traductions dans les formulaires, mais pas de UI dédiée pour traducteurs |
| **C15** | Tickets support admin | `gestion_des_tickets_support_-_admin` | **Non implémenté** |

---

### D. MANQUES DE COUVERTURE TESTS (priorité moyenne)

| # | Domaine | Tests existants | Manque |
|---|---|---|---|
| **D1** | Blog article CRUD | Seulement loader (read mock) | CREATE / UPDATE / DELETE non testés |
| **D2** | Media upload (file) | Insert en DB testé | Aucun test multipart/file réel |
| **D3** | Org switching | Aucun | Aucun test switch org UI ni API |
| **D4** | Notifications | Aucun | Schema + seed existent, 0 tests |
| **D5** | Profile CRUD | Aucun | Schema existe, 0 tests |
| **D6** | Blog admin pages (authors, categories, comments moderation) | Aucun | 0 tests admin UI pour ces modules |
| **D7** | Performance / Lighthouse | `test.skip` | Désactivé (`lighthouse` pas configuré) |
| **D8** | Booking création E2E (user flow complet) | DB-level seulement | Aucun test Playwright du flow public booking |

---

### E. DETTE TECHNIQUE (priorité basse)

| # | Problème | Fichier | Detail |
|---|---|---|---|
| **E1** | Pas de sanitization XSS sur le contenu markdown/HTML des articles | Blog articles API | Content non filtré — `<script>` injectable |
| **E2** | Pas d'optimisation image au upload (pas de resize, pas d'extraction width/height) | Blog + services media API | Fichiers bruts stockés |
| **E3** | Double logique d'audit sur login failure | auth.ts | `logAuthError` + manual insert dupliquent |
| **E4** | CLI auth instance duplique toute la config | auth.ts | DRY violation |
| **E5** | ~40 entités des specs non implémentées | concordia-specs.md | Forum, classifieds, events, marketplace, wallet, mediation, education, volunteering, funding, transparency |
| **E6** | `PageBreadcrumb` utilise `import.meta.glob` non typé | PageBreadcrumb.astro | Faux positif TS IDE mais corrigeable avec `/// <reference types="vite/client" />` |

---

### F. RECOMMANDATION D'ACTIONS ORDONNÉES

**Phase 1 — Bugs (quick wins, 1-2h)**
1. Fixer le `whereClause` reduce dans admin/users/index.astro, api/admin/services/media.ts, api/admin/blog/media.ts → utiliser `and()` de drizzle-orm
2. Ajouter vérification unicité slug dans la création articles blog
3. Ajouter commentaire/TODO pour le bearer blacklist en mémoire (solution future : Redis)

**Phase 2 — Tests manquants (2-4h)**
4. Tests intégration blog article CRUD
5. Tests intégration notifications
6. Tests E2E booking flow complet
7. Tests org switching API

**Phase 3 — Fonctionnalités wireframes manquantes (par priorité)**
8. Vue calendrier admin bookings (C1)
9. Centre de notifications (C5) — schema existe, manque pages + API
10. Recherche globale (C10) — SearchBar existe, manque endpoint + page résultats
11. Profil public citoyen (C11)

**Phase 4 — Features specs avancées (roadmap long terme)**
12. Messagerie (C6), Devis (C7), Litiges (C8), Tickets (C15)
13. Les ~40 entités restantes des specs

---

**Verification actuelle** : `npx astro check` → **0 errors, 0 warnings** (les erreurs VS Code sont des faux positifs IDE : `Astro` namespace et `?url` imports sont valides à la compilation). DB migrations synchronisées. Seeds complets. 38 fichiers de tests passent.
