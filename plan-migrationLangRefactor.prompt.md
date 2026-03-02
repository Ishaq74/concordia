# Plan : Migration `fr/en/es/ar/` → `[lang]/` + Refonte Tests

**TL;DR** — Réduire **264 fichiers dupliqués à 66**, avec slugs localisés via `context.rewrite()` dans le middleware pour les pages SSR et `getStaticPaths` avec `routePattern` pour les 2 pages prérendues. En parallèle, nettoyer la suite de tests (scripts cassés, stubs non-fonctionnels, couverture i18n) et ajouter des tests de garde à chaque phase pour avancer en confiance. Astro `^5.18.0` — toutes les API nécessaires sont disponibles.

---

## Inventaire de ce qui existe et ce qui casse

**Pages** : 66 types × 4 langues = 264 fichiers. Seuls **13 types** ont des slugs localisés (about, contact, profile, organizations, auth×6, blog/author, invitations). Les **53 autres** (admin×16, docs×31, blog/index, blog/[category], blog/[category]/[slug], index) ont des slugs **identiques** dans les 4 langues.

**Prérendu** : seuls 2 types (`blog/[category]` et `blog/author/[slug]`) utilisent `getStaticPaths`. Les 64 autres sont **full SSR**.

**Tests** : 29 fichiers, mais 6 problèmes critiques :
- `test:security` pointe vers un fichier inexistant
- `test:api` pointe vers un fichier inexistant
- `test:e2e` lance Vitest sur des tests Playwright
- `runLighthouse()`, `simulateHydration()`, `simulateServerError()` sont des stubs vides
- 4 répertoires de tests vides (`pages/`, `api/`, `hooks/`, `templates/`)
- Les 17 tests UI ne testent que FR

**Middleware** : 5 middlewares en `sequence()`, avec des regex hardcodées `(fr|en|ar|es)` partout.

**Composants** : 6 composants avec des fallbacks `/fr/...` hardcodés.

---

## Complete Slug Mapping Table — 13 types with localized slugs

| # | Canonical (EN filename) | FR slug | EN slug | ES slug | AR slug | Render |
|---|---|---|---|---|---|---|
| 1 | `about` | `a-propos` | `about` | `acerca-de` | `about` | SSR |
| 2 | `profile` | `profil` | `profile` | `perfil` | `profile` | SSR |
| 3 | `contact` | `contact` | `contact` | `contacto` | `contact` | SSR |
| 4 | `organizations/index` | `organisations/index` | `organizations/index` | `organizaciones/index` | `organizations/index` | SSR |
| 5 | `organizations/[slug]` | `organisations/[slug]` | `organizations/[slug]` | `organizaciones/[slug]` | `organizations/[slug]` | SSR |
| 6 | `auth/sign-in` | `auth/connexion` | `auth/sign-in` | `auth/iniciar-sesion` | `auth/sign-in` | SSR |
| 7 | `auth/sign-up` | `auth/inscription` | `auth/sign-up` | `auth/registro` | `auth/sign-up` | SSR |
| 8 | `auth/profile` | `auth/profil` | `auth/profile` | `auth/perfil` | `auth/profile` | SSR |
| 9 | `auth/verify-email` | `auth/verifier-email` | `auth/verify-email` | `auth/verificar-email` | `auth/verify-email` | SSR |
| 10 | `auth/reset-password` | `auth/reinitialiser-mot-de-passe` | `auth/reset-password` | `auth/restablecer-contrasena` | `auth/reset-password` | SSR |
| 11 | `auth/forgot-password` | `auth/mot-de-passe-oublie` | `auth/forgot-password` | `auth/olvido-contrasena` | `auth/forgot-password` | SSR |
| 12 | `auth/invitations` | `auth/invitations` | `auth/invitations` | `auth/invitaciones` | `auth/invitations` | SSR |
| 13 | `blog/author/[slug]` | `blog/auteur/[slug]` | `blog/author/[slug]` | `blog/autor/[slug]` | `blog/author/[slug]` | Prerender |

The remaining **53 page types** (admin×16, docs×31, blog/index, blog/[category], blog/[category]/[slug], index, auth/legal) have **identical slugs** across all 4 languages — no rewrite needed.

---

## Steps

### Phase 0 — Config

> Objectif : pouvoir détecter toute régression pendant la migration.

1. **Activer `failOnPrerenderConflict`** dans `astro.config.mjs` — ajouter `experimental: { failOnPrerenderConflict: true }`. Protection immédiate contre les collisions de routes.

---

### Phase 1 — Infrastructure i18n (nouveaux fichiers)

> Objectif : construire le système de routing sans toucher aux pages existantes.

6. **Créer `src/i18n/slug-map.ts`** — table de mapping bidirectionnelle couvrant les 13 types avec slugs localisés :

   Structure :
   ```ts
   // canonicalPath → { fr: localizedSlug, en: localizedSlug, es: localizedSlug, ar: localizedSlug }
   ```
   
   Couvre : `about`, `profile`, `contact`, `organizations`, `auth/sign-in`, `auth/sign-up`, `auth/profile`, `auth/verify-email`, `auth/forgot-password`, `auth/reset-password`, `auth/invitations`, `blog/author`. Les 53 types restants n'ont pas besoin de mapping (slugs identiques).

7. **Créer `src/lib/i18n/route-helpers.ts`** — fonctions clés :
   - `getLocalizedUrl(lang, canonicalPath)` → `/fr/a-propos`, `/es/acerca-de`, etc.
   - `getCanonicalPath(lang, localizedSlug)` → résout `/fr/connexion` en `auth/sign-in`
   - `getSupportedLocales()` → `['fr', 'en', 'ar', 'es']` (source unique de vérité)
   - `isValidLocale(lang)` → garde-fou typesafe

8. **Tests** : lancer `tests/i18n/slug-map.test.ts` créé en étape 4 → doit passer. Ce test valide le mapping sans toucher au routing.

---

### Phase 2 — Middleware rewrite pour SSR

> Objectif : le middleware résout les slugs localisés AVANT qu'Astro route la requête, via `context.rewrite()`.

9. **Réécrire le middleware `localeRedirect`** dans `src/middleware.ts` :
   - Remplacer les regex hardcodées `(fr|en|ar|es)` par `getSupportedLocales()`
   - Extraire la locale depuis le premier segment d'URL
   - Appeler `getCanonicalPath(lang, restOfPath)` — si le slug a un rewrite, faire `context.rewrite(new Request(canonicalUrl))`
   - Sinon, passer au `next()` normalement
   - Le rewrite est **transparent** : l'URL visible reste `/fr/connexion`, le fichier servi est `[lang]/auth/sign-in.astro`

10. **Adapter `protectedRoutes`** — remplacer les patterns de protection hardcodés par des patterns canoniques + le même mapping.

11. **Tests** : relancer `tests/i18n/routing.test.ts` — les URLs localisées doivent toujours retourner 200, même si les fichiers physiques changent de nom dans les phases suivantes.

---

### Phase 3 — Créer l'arborescence `[lang]/`

> Objectif : créer les 66 fichiers uniques. Les anciens répertoires restent en place temporairement.

12. **Créer `src/pages/[lang]/`** — copier **la version EN** comme base (slugs anglais = noms de fichiers canoniques). Structure :
    ```
    src/pages/[lang]/
    ├── index.astro
    ├── about.astro
    ├── contact.astro
    ├── profile.astro
    ├── auth/  (8 fichiers)
    ├── blog/  (4 fichiers dont author/[slug].astro)
    ├── organizations/  (2 fichiers)
    ├── admin/  (16 fichiers)
    └── docs/   (31 fichiers)
    ```

13. **Convertir chaque page** — modifications systématiques :
    - Remplacer `import tData from "@i18n/en.json"` par `const tData = (await import(\`../../i18n/${Astro.params.lang}.json\`)).default`
    - Remplacer `const currentLocale = Astro.currentLocale || "en"` par `const lang = Astro.params.lang as string`
    - Remplacer tous les chemins hardcodés (`"/en/profile"`, `"/en/auth/sign-in"`) par `getLocalizedUrl(lang, "profile")`, `getLocalizedUrl(lang, "auth/sign-in")`
    - Pour les 2 pages prérendues, adapter `getStaticPaths` :
      ```ts
      export async function getStaticPaths() {
        const locales = getSupportedLocales();
        const allPosts = await getCollection("blog");
        return locales.flatMap(lang => {
          const posts = allPosts.filter(p => p.data.lang === lang);
          // ... générer les params avec { lang, category: slug }
        });
      }
      ```
    - Pour `blog/author/[slug].astro` prérendu, `getStaticPaths` génère aussi le préfixe localisé si besoin.

14. **Tests intermédiaires** : `astro check` pour valider la compilation des 66 nouveaux fichiers (les anciens 264 sont encore là, donc collision possible → on ne construit pas encore, on check seulement la syntaxe).

---

### Phase 4 — Supprimer les anciens répertoires

> Objectif : passage définitif. Backend unique.

15. **Supprimer les 4 répertoires** : `src/pages/fr/`, `src/pages/en/`, `src/pages/es/`, `src/pages/ar/`. Garder `src/pages/api/`, `src/pages/404.astro`, `src/pages/500.astro`.

16. **Mettre à jour le redirect racine** dans `astro.config.mjs` : `'/' → '/fr/'` reste valide (Astro résout `/fr/` vers `[lang]/index.astro` avec `lang="fr"`).

17. **Tests critiques** :
    - `astro check` → 0 erreurs
    - `tests/i18n/routing.test.ts` → toutes les URLs localisées répondent 200
    - `pnpm test:unit` → pas de régression
    - Test manuel rapide : naviguer `/fr/`, `/en/`, `/es/`, `/ar/` + auth flow + admin + blog

---

### Phase 5 — Composants et layouts

> Objectif : éliminer tous les hardcodes de locale dans les composants partagés.

18. **Fixer `Header/User.astro`** — remplacer la détection par pathname et les maps hardcodées par `getLocalizedUrl(Astro.currentLocale, "auth/sign-in")` etc.

19. **Fixer `Header/LangChooser.astro`** — le regex hardcodé `/(fr|en|ar|es)` → utiliser `getSupportedLocales()` pour construire la regex dynamiquement, ou mieux : `pathname.replace(/^\/([\w-]+)/, '/' + targetLang)`.

20. **Fixer les 6 composants auth** (`SignInCard.astro`, `SignUpCard.astro`, `ForgotPasswordForm.astro`, `VerifyEmailCard.astro`, `ProfileDetails.astro`) — remplacer les fallbacks `/fr/auth/inscription` par `getLocalizedUrl(lang, "auth/sign-up")`.

21. **Fixer `PostMeta.astro`** — `blog/auteur/` hardcodé FR → `blog/author/` canonique + `getLocalizedUrl()`.

22. **Fixer `SmartBreadcrumb.astro`** — les 4 imports statiques de JSON → un seul import dynamique basé sur la locale.

23. **Fixer le bug existant** dans `en/auth/invitations.astro` — redirige vers `/fr/connexion` au lieu de `/en/sign-in`. Ce bug disparaît naturellement avec `getLocalizedUrl(lang, "auth/sign-in")`.

24. **Vérifier `BaseLayout.astro`, `AdminLayout.astro`, `DashboardLayout.astro`** — déjà dynamiques, mais vérifier les fallbacks.

25. **Tests** : `astro check` + `tests/i18n/routing.test.ts` + test manuel des 4 langues.

---

### Phase 6 — Refonte suite de tests

> Objectif : passer d'une suite fragile à une suite fiable et maintenable.

26. **Nettoyer les stubs morts** :
    - `tests/a11y/a11y-utils.ts` : `runLighthouse()` → soit implémenter réellement avec `lighthouse` package, soit supprimer le test qui l'utilise et le marquer `TODO`
    - `tests/ssr/ssr-utils.ts` : `simulateHydration()` et `simulateServerError()` → implémenter ou supprimer
    - Supprimer les répertoires vides inutiles (`tests/api/`, `tests/hooks/`, `tests/templates/`) ou les peupler

27. **Paramétrer les tests UI sur les 4 langues** — les 17 tests Playwright dans `tests/e2e/ui/` hardcodent `/fr/docs/design/...`. Créer un helper `getDocsUrl(locale, component)` et itérer sur les locales (ou au minimum FR + EN).

28. **Ajouter des tests de pages SSR** — remplir `tests/pages/` :
    - Test de chaque page publique dans les 4 langues (fetch → 200 + lang correcte)
    - Test des pages admin (authenticated → 200, unauthenticated → redirect)
    - Test des pages auth (formulaires rendus, redirects post-action)

29. **Ajouter des tests RTL** — vérifier que AR a `dir="rtl"` et que les composants critiques (nav, forms) s'affichent correctement.

30. **Ajouter des tests de translation coverage** — unit test qui charge chaque JSON et vérifie que toutes les clés de `fr.json` existent dans `en.json`, `es.json`, `ar.json` (plus jamais de `adminPanel` manquant).

31. **Tests** : `pnpm test:all` → tout passe. `pnpm test:ui` → Playwright passe sur FR et EN minimum.

---

### Phase 7 — Validation finale

32. **`astro check`** → 0 erreurs, 0 warnings, 0 hints
33. **`pnpm test:unit`** → tout passe
34. **`pnpm test:integration`** → tout passe
35. **`pnpm test:ui`** → composants OK dans les 4 langues
36. **`tests/i18n/routing.test.ts`** → toutes les routes répondent correctement
37. **`astro build`** → build réussi sans collision (grâce à `failOnPrerenderConflict`)
38. **Test manuel** : parcours complet FR/EN/ES/AR → homepage, about, blog, catégorie, article, auteur, auth flow complet, admin dashboard, docs
39. **Vérifier les URLs finales** :
    - `/fr/a-propos` → 200 ✓
    - `/en/about` → 200 ✓
    - `/es/acerca-de` → 200 ✓
    - `/fr/auth/connexion` → 200 ✓
    - `/es/auth/iniciar-sesion` → 200 ✓
    - `/fr/blog/auteur/john-doe` → 200 ✓
    - `/fr/admin/` (sans auth) → redirect ✓

---

## Decisions

| Décision | Choix | Justification |
|----------|-------|---------------|
| Architecture routing | `[lang]/` dynamique + middleware rewrite | 66 fichiers au lieu de 264, maintenabilité ×4 |
| Slugs localisés | Oui, via `context.rewrite()` dans le middleware | SEO préservé, URLs belles, aucune duplication |
| Noms de fichiers physiques | Anglais canoniques (`sign-in.astro`, `about.astro`) | Standard, pas de caractères spéciaux, cohérent |
| Admin/Docs slugs | Pas de localisation (déjà identiques) | Pas de valeur SEO pour le back-office |
| Pages prérendues (blog) | `getStaticPaths` avec `lang` dans params | Natif Astro 5.14+, performant |
| Slug `blog/auteur` localisé | Middleware rewrite (`/fr/blog/auteur/X` → `[lang]/blog/author/X`) | Un seul fichier `author/[slug].astro` + slugs localisés en URLs |
| Tests à chaque phase | Oui, gardiens de migration | Pas d'avancée à l'aveugle |
| Stubs de tests morts | Supprimer ou implémenter | Pas de faux positifs |
| `failOnPrerenderConflict` | Activé dès Phase 0 | Protection durable pour les futurs modules |

## Risques identifiés

| Risque | Mitigation |
|--------|-----------|
| `Astro.currentLocale` ne fonctionne plus avec `[lang]/` | Vérifier que `i18n.routing.prefixDefaultLocale: true` le supporte ; sinon utiliser `Astro.params.lang` exclusivement |
| Le rewrite middleware casse les formulaires POST auth | Tester le flow auth complet (POST sign-in/sign-up) après Phase 2 |
| Collision `[lang]` avec d'autres segments dynamiques | `failOnPrerenderConflict` + validation que `lang` est dans `SUPPORTED_LOCALES` en début de middleware |
| Régression des 17 tests UI Playwright | Les exécuter avant et après chaque phase majeure |

## Ordre d'exécution

```
Phase 0 (tests+config)  →  Phase 1 (infra i18n)  →  Phase 2 (middleware)
     ↓ tests gardiens          ↓ tests unitaires        ↓ tests routing
Phase 3 (créer [lang]/) →  Phase 4 (supprimer old) →  Phase 5 (composants)
     ↓ astro check             ↓ tests critiques        ↓ tests complets
Phase 6 (refonte tests) →  Phase 7 (validation finale)
```

Chaque phase est auto-contenue et vérifiable. Si une phase casse quelque chose, on peut rollback sans affecter les autres.

---

## Files to create

- `src/i18n/slug-map.ts`
- `src/lib/i18n/route-helpers.ts`
- `tests/i18n/routing.test.ts`
- `tests/i18n/slug-map.test.ts`
- `tests/i18n/translation-coverage.test.ts`

## Files to modify

- `astro.config.mjs` (experimental flag + redirect)
- `package.json` (fix test scripts)
- `src/middleware.ts` (rewrite logic)
- `src/lib/i18n/locale-url.ts` (may integrate with route-helpers)
- `src/layouts/BaseLayout.astro`
- `src/layouts/AdminLayout.astro`
- `src/layouts/DashboardLayout.astro`
- `src/components/templates/Header/User.astro`
- `src/components/templates/Header/LangChooser.astro`
- `src/components/templates/auth/SignInCard.astro`
- `src/components/templates/auth/SignUpCard.astro`
- `src/components/templates/auth/ForgotPasswordForm.astro`
- `src/components/templates/auth/VerifyEmailCard.astro`
- `src/components/templates/auth/profile/ProfileDetails.astro`
- `src/components/modules/blog/ui/PostMeta.astro`
- `src/components/Tools/SmartBreadcrumb.astro`

## Files to delete (Phase 4)

- `src/pages/fr/` (66 files)
- `src/pages/en/` (66 files)
- `src/pages/es/` (66 files)
- `src/pages/ar/` (66 files)

## Files to create (Phase 3) — 66 files under `src/pages/[lang]/`

Consolidated from EN versions, converted to dynamic locale.
