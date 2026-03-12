# AUDIT DE DETTE TECHNIQUE — Projet Concordia (v3)

**Date :** Mars 2026
**Méthode :** Lecture directe de chaque fichier cité (fichier + ligne).
**Périmètre :** `src/`, `tests/`, configs racine

---

## Résumé

| Sévérité | Nombre |
|----------|--------|
| 🔴 Critique | 4 |
| 🟠 Majeur | 8 |
| 🟡 Modéré | 10 |
| ⚪ Mineur | 5 |
| **Total** | **27** |

---

## 🔴 CRITIQUE (4)

### C-01. SSL/TLS `rejectUnauthorized: false` sur toutes les connexions DB

**Fichier :** `src/database/drizzle.ts` — lignes 16 et 30
```ts
ssl: url.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
```
**Impact :** Accepte n'importe quel certificat TLS. MITM possible entre l'app et PostgreSQL.
**Ce qu'il ne faut PAS faire :** Proposer `readFileSync('ca-cert.pem')` — ça ne fonctionne pas sur Vercel (serverless, pas de filesystem persistant).
**Fix réel :** Dépend du provider DB.
- **Neon / Supabase / Vercel Postgres :** Ces providers utilisent des certificats signés par des CA publiques. `ssl: true` (ou `ssl: { rejectUnauthorized: true }`) suffit, le certificat sera validé par la CA system.
- **Provider avec CA custom (DigitalOcean, auto-hébergé) :** Passer le CA via variable d'environnement : `ssl: { ca: process.env.DATABASE_CA_CERT }` (le cert PEM est stocké en env var, pas en fichier).
- **Dev local sans SSL :** La condition `url.includes('sslmode=require')` gère déjà ce cas (pas de SSL si pas de `sslmode=require` dans l'URL).

---

### C-02. Upload fichier : path traversal via `imageFile.name`

**Fichier :** `src/actions/blog.ts` — lignes 24-29
```ts
const fileName = `${id}-${imageFile.name}`;
await fs.writeFile(path.join(process.cwd(), "public/uploads", fileName), buffer);
```
**Impact :** `imageFile.name` est un input utilisateur. `../../.env` comme nom de fichier traverse le répertoire.
**Ce qu'il ne faut PAS faire :** Sanitiser le nom avec une regex. C'est fragile — on oublie toujours un cas.
**Fix réel :** Ne jamais utiliser le nom original. Générer un nom déterministe :
```ts
const ext = path.extname(imageFile.name).toLowerCase();
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
if (!ALLOWED_EXT.has(ext)) throw new Error("Type de fichier non autorisé");

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
if (imageFile.size > MAX_SIZE) throw new Error("Fichier trop volumineux");

const fileName = `${id}${ext}`; // nanoid + extension validée, AUCUN input utilisateur
const dest = path.resolve(process.cwd(), "public/uploads", fileName);

// Vérifier que le chemin résolu est bien dans uploads
if (!dest.startsWith(path.resolve(process.cwd(), "public/uploads"))) {
  throw new Error("Path traversal détecté");
}
```
La validation MIME par extension est facilement contournable mais combinée avec la génération de nom (pas d'input utilisateur dans le chemin) et la vérification `path.resolve`, le path traversal est éliminé.

---

### C-03. `rejectDangerous()` appliqué au mot de passe — bloque les caractères forts

**Fichier :** `src/lib/auth/validate-user.ts` — lignes 79-116 (boucle sur tous les fields incluant password)
**Impact :** Les passwords `My$ecure!Pass`, `test--strong`, `p@ss|word` sont rejetés par les patterns anti-injection. Or les mots de passe sont TOUJOURS hashés par Better Auth (bcrypt/argon2) avant stockage — ils ne sont jamais injectés dans du SQL, du HTML, ni du shell.
**Ce qu'il ne faut PAS faire :** "Ne plus valider le mot de passe du tout" — même si le hash empêche l'injection, certains contextes (logs d'erreur, emails de confirmation) pourraient refléter des métadonnées.
**Fix réel :** Séparer la logique. Pour `email`, `username`, `name` : appliquer `rejectDangerous()` (ces champs sont affichés en UI, stockés en clair). Pour `password` : appliquer UNIQUEMENT les checks de force existants (longueur, répétition, liste noire, patterns clavier) qui sont déjà bien faits, et retirer le passage par `rejectDangerous()`. Concrètement, sortir `password` de la boucle `fields` (ligne 79) et l'évaluer séparément dans la section dédiée (ligne 140+).

De plus, le pattern `/\d{4,}/` dans `contextPatterns` (ligne 158) rejette tout mot de passe contenant 4+ chiffres consécutifs — y compris `MyStr0ng2024Pass!`. Ce pattern est trop large : il devrait matcher seulement les passwords qui SONT un pattern prévisible (`user2024`), pas ceux qui CONTIENNENT des chiffres.

---

### C-04. Race condition booking : SELECT puis INSERT sans protection

**Fichier :** `src/pages/api/services/bookings.ts` — lignes 125-145
```ts
// Commentaire : "Uses a row-level advisory lock via SELECT FOR UPDATE"
const existingBookings = await db.select(...)  // ← PAS de FOR UPDATE
// ... puis INSERT séparé
```
**Impact :** Deux requêtes simultanées sur le même créneau passent toutes les deux le SELECT (0 résultats) puis font toutes les deux l'INSERT.
**Ce qu'il ne faut PAS faire :** Ajouter `FOR UPDATE` — `FOR UPDATE` verrouille des lignes qui EXISTENT. Ici on vérifie l'ABSENCE de lignes. `FOR UPDATE` sur un résultat vide ne verrouille rien.
**Fix réel :** Utiliser une des deux approches :
1. **Contrainte UNIQUE en DB** sur `(serviceId, bookingDate, bookingTime, status)` — PostgreSQL garantit l'unicité atomiquement. L'INSERT échouera avec une erreur de contrainte si doublon. C'est la solution la plus simple et la plus fiable.
2. **Advisory lock PostgreSQL** dans une transaction : `SELECT pg_advisory_xact_lock(hashtext(serviceId || bookingDate || bookingTime))` suivi du SELECT + INSERT dans la même transaction. Le lock est libéré automatiquement au commit/rollback.

---

## 🟠 MAJEUR (8)

### M-01. Sonda (bundle analyzer) inclus inconditionnellement

**Fichier :** `astro.config.mjs` — ligne 22
```ts
integrations: [Icon(), Sonda({server: true}), mdx()],
```
**Impact :** Sonda instrumente chaque build y compris en production. Overhead sur le temps de build et potentiellement sur le bundle.
**Fix :**
```ts
integrations: [
  Icon(),
  ...(process.env.ANALYZE === 'true' ? [Sonda({server: true})] : []),
  mdx(),
],
```

---

### M-02. `z.any()` dans content.config.ts — 15+ champs sans validation

**Fichier :** `src/content.config.ts`
**Impact :** Zéro validation runtime sur les données des loaders blog/services.
**Contexte vérifié :** Le loader (`src/database/loaders/blog.ts`) passe TOUT par `getLabel(value, lang)` qui retourne toujours `string` (string vide si null, `JSON.stringify` si objet nested). Donc les champs `title`, `excerpt`, `content`, `name`, `alt` sont bien des strings en sortie.
**Ce qu'il ne faut PAS faire :** Proposer `z.record(z.string(), z.string())` — les loaders retournent des strings simples, pas des objets `{ fr: '...', en: '...' }`.
**Fix :** Remplacer `z.any()` par `z.string()` pour tous les champs texte issus de `getLabel()`. Les champs `seo.*` sortent aussi de `getLabel()` donc `z.string().optional()` convient.

---

### M-03. `getAdminListData` dupliqué — version active sans null check

**Fichiers :**
- `src/lib/admin/loaders.ts` — version ACTIVE (0 null check, `@ts-ignore` L19)
- `src/database/admin/loaders.ts` — DEAD CODE (a le null check, 0 imports)
**Fix :** Ajouter le null check dans la version active :
```ts
const queryApi = (db.query as any)[collectionName];
if (!queryApi) throw new Error(`Collection "${String(collectionName)}" introuvable`);
```
Le `@ts-ignore` peut être remplacé par un cast explicite `(db.query as any)[collectionName]` avec le check runtime, ce qui documente l'intention. Supprimer le fichier mort `src/database/admin/loaders.ts`.

---

### M-04. `process.env.BETTER_AUTH_URL!` sans validation

**Fichier :** `src/lib/auth/auth.ts` — lignes 306 et 515
**Ce qu'il ne faut PAS faire :** Écrire `?? throw new Error(...)` — c'est du TypeScript invalide (`throw` n'est pas une expression).
**Fix :**
```ts
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;
if (!BETTER_AUTH_URL) throw new Error("BETTER_AUTH_URL manquant");
// ... puis utiliser BETTER_AUTH_URL (sans !)
```
Placer cette validation au début de `getAuth()` (avant le `betterAuth({...})`), ou dans un module `env-check.ts` importé au boot.

---

### M-05. `LANGUAGES` hardcodé dans blog actions

**Fichier :** `src/actions/blog.ts` — ligne 10
```ts
const LANGUAGES = ['fr', 'en', 'es', 'ar'];
```
**Ce qu'il ne faut PAS faire :** Importer depuis `@i18n/slug-map` — ça crée un couplage entre les actions blog et le module de routing i18n (slug-map est lourd, contient toutes les routes).
**Fix :** Extraire `SUPPORTED_LOCALES` dans un module léger dédié (`src/i18n/locales.ts` par exemple) qui exporte juste `['fr', 'en', 'es', 'ar'] as const`. Puis importer depuis ce module dans slug-map ET dans blog actions. Si `SUPPORTED_LOCALES` est déjà dans slug-map, le déplacer dans ce module léger et le ré-exporter depuis slug-map pour ne rien casser.

---

### M-06. `as any` dans le middleware pour `sessionResult.session` et `sessionResult.user`

**Fichier :** `src/middleware.ts` — lignes 94 et 117
```ts
let orgId = (sessionResult.session as any)?.activeOrganizationId ?? null;
const userRole = (sessionResult.user as any)?.role ?? "";
```
**Ce qu'il ne faut PAS faire :** Dire "utiliser les types de `App.Locals`" — `sessionResult` vient de `auth.api.getSession()`, pas de `locals`. Le type retourné par Better Auth n'inclut pas `activeOrganizationId` par défaut (ajouté par le plugin `organization`).
**Fix :** Augmenter le type de session Better Auth via module augmentation :
```ts
// src/types/better-auth.d.ts
declare module "better-auth" {
  interface Session {
    activeOrganizationId?: string | null;
  }
}
```
Ou créer un type local `AuthSession` avec les champs additionnels et caster une seule fois au retour de `getSession()`.

---

### M-07. `guardOrgOwnership` cast `(locals as any).organizationId`

**Fichier :** `src/lib/admin/api-helpers.ts` — ligne 96
```ts
const activeOrgId = (locals as any).organizationId;
```
**Mais :** `App.Locals` déclare déjà `organizationId?: string | null` dans `env.d.ts`. Le paramètre est typé `App.Locals`. Donc `locals.organizationId` fonctionne directement.
**Fix :** Simplement retirer le `as any` : `const activeOrgId = locals.organizationId;`

---

### M-08. Endpoint admin org profile : tout admin peut modifier toute org

**Fichier :** `src/pages/api/admin/organizations/profile.ts`
**Seul guard :** `guardAdmin(locals)` — vérifie le rôle admin, pas l'appartenance à l'org.
**Ce qu'il ne faut PAS faire :** Ajouter `guardOrgOwnership()` — cette fonction contient `if (isAdminUser(locals.user)) return null;` donc elle BYPASS tous les admins. Elle ne résoudrait rien.
**Fix réel :** Si l'intention est que les admins d'une org ne gèrent que LEUR org :
1. Modifier `guardOrgOwnership` pour distinguer super-admin (bypass) vs org-admin (scoped), ou
2. Créer un guard spécifique `guardOrgMembership(locals, orgId)` qui vérifie l'appartenance via la table `member` sans bypass admin.
Si l'intention est que tout admin EST super-admin (peut gérer toutes les orgs), alors c'est voulu et ce n'est pas un bug — mais ça doit être documenté explicitement.

---

## 🟡 MODÉRÉ (10)

### Q-01. `console.log("[AUTH DEBUG]")` sur chaque requête admin

**Fichier :** `src/middleware.ts` — ligne 89
```ts
console.log("[AUTH DEBUG] user:", JSON.stringify(sessionResult.user));
```
**Fix :** Supprimer cette ligne (c'est du debug). Si du logging est nécessaire en admin, utiliser un logger structuré avec un niveau `debug` configurable par env.

---

### Q-02. Schema notification : champs `body` ET `message`

**Fichier :** `src/database/schemas/notification.schema.ts`
```ts
body: text('body'),
message: text('message'),
```
**Fix :** Vérifier lequel est utilisé dans `createNotification()` et les queries. Si un seul est utilisé, supprimer l'autre avec une migration. Si les deux ont un rôle distinct, ajouter un commentaire dans le schéma.

---

### Q-03. Schémas `blogMedia` et `servicesMedia` copier-collés

**Fichiers :** `src/database/schemas/blog_media.schema.ts` et `services_media.schema.ts` — 20 colonnes identiques.
**Fix :** Créer un helper de schéma :
```ts
function createMediaColumns() {
  return {
    id: text("id").primaryKey(),
    url: text("url").notNull(),
    // ... les 18 autres colonnes
  };
}
export const blogMedia = pgTable("blog_media", createMediaColumns());
export const servicesMedia = pgTable("services_media", createMediaColumns());
```
Garder deux tables séparées (pas une table unique `media`) — la séparation par domaine a du sens pour l'isolation des données et la performance des queries.

---

### Q-04. `(auth!.api as any)` dans members.ts

**Fichier :** `src/pages/api/admin/organizations/members.ts` — lignes 62, 75, 87
**Fix :** Le `auth!` est inutile (l'import est déjà initialisé). Le `as any` contourne le typage du plugin `organization` de Better Auth. Comme pour M-06, la solution est d'augmenter le type ou d'utiliser un type wrapper typé une seule fois.

---

### Q-05. `as any` dans `moderate.ts` pour tables dynamiques

**Fichier :** `src/pages/api/admin/moderate.ts` — lignes 75, 107, 108
**Fix :** Ce `as any` est structurellement nécessaire car Drizzle ne supporte pas nativement le dispatch dynamique de tables. Solution possible : créer une fonction `moderateEntity(db, tableName, postId)` avec overloads typés pour chaque table supportée.

---

### Q-06. ESLint presque vide

**Fichier :** `.eslintrc.cjs`
**Fix :** Activer les presets :
```js
extends: [
  'plugin:@typescript-eslint/recommended',
  'plugin:astro/recommended',
],
```
Attention : ça va générer beaucoup d'erreurs existantes. Introduire progressivement avec `--fix` et `warn` au lieu de `error` au début.

---

### Q-07. Validation utilisateur : regex dupliqués

**Fichier :** `src/lib/auth/validate-user.ts`
**Impact :** `rejectDangerous()` et la boucle `fields` vérifient les mêmes patterns deux fois.
**Fix :** Supprimer les checks en double dans la boucle `fields` (lignes 98-116). Garder uniquement l'appel `rejectDangerous(val, key)` en fin de boucle.

---

### Q-08. `as any` dans blog `categories.ts` pour JSONB

**Fichier :** `src/pages/api/admin/blog/categories.ts` — lignes 143-154
```ts
name: name as any,
description: (payload.description as any) || null,
```
**Fix :** Typer les payloads JSONB comme `Record<string, string> | null` au lieu de `as any`.

---

### Q-09. `(result as any).rowCount` dans notifications

**Fichier :** `src/lib/notifications/notifications.ts` — lignes 112, 125
**Fix :** Utiliser `.returning()` de Drizzle et vérifier la longueur du tableau retourné, au lieu d'accéder à `rowCount` en contournant le type.

---

### Q-10. `console.error` sans logging structuré dans 8+ routes admin

**Fichiers :** 9 routes admin API.
**Fix :** Créer un `logger.ts` minimal (`{ error(msg, meta) { ... } }`) avec niveaux et un format JSON pour la production. Pas besoin de pino/winston si on veut rester léger.

---

## ⚪ MINEUR (5)

### L-01. Slugs arabes = slugs anglais dans slug-map

**Fichier :** `src/i18n/slug-map.ts`
Peut être intentionnel. Les 4 fichiers de traduction JSON sont complets et synchronisés (2794 lignes chacun). L'arabe n'est PAS incomplet.

### L-02. `@ts-ignore` dans `src/lib/admin/loaders.ts` L19

Remplacer par `@ts-expect-error` avec explication.

### L-03. Auth admin mock dans tests/setup.ts

Le plugin `admin` est mocké en no-op. C'est par design pour l'isolation de test.

### L-04. Package name `astrocss-drizzle-better-auth` au lieu de `concordia`

Cosmétique. Renommer dans `package.json`.

### L-05. `globalThis.__sendMailMock` en test

Gatekept par `SMTP_MOCK === '1' || NODE_ENV === 'test'`. Pas un risque en production.

---

## ✅ Ce qui est BIEN fait

1. **Rate limiting :** `storage: "database"` dans sharedConfig — PAS purement en mémoire.
2. **RBAC/ABAC :** `guardAdmin` → `guardPermission` → `guardOrgOwnership` cohérent et appliqué.
3. **i18n :** 4 fichiers JSON parfaitement synchronisés. Slug-map bidirectionnel. Route-helpers propre.
4. **DB fail-fast :** `drizzle.ts` L8 : `if (!url) throw new Error(...)`.
5. **SMTP :** `loadConfig()` valide host/user/pass. Mock gatekept par env.
6. **FK cascades :** toutes les FK vers `blogPosts` ont `onDelete("cascade")`. Le `deletePost` simple fonctionne sans transaction.
7. **Org ownership :** Correctement appliqué dans blog articles et services.
8. **Test setup :** Mock du plugin admin, redirection getDrizzle vers test DB, cleanup beforeEach/afterAll.

---

## Erreurs des audits précédents

| Affirmation précédente | Réalité |
|-----|------|
| "Rate limiting en mémoire" | `storage: "database"` dans sharedConfig |
| "Mock SMTP accessible en prod" | Gatekept par env vars |
| "DB URL vide sans erreur" | `drizzle.ts` L8 throw |
| "Traductions arabes incomplètes" | 4 fichiers identiques (2794 lignes) |
| "Fix C-01 : `readFileSync('ca-cert.pem')`" | Ne fonctionne pas sur Vercel |
| "Fix C-04 : ajouter `guardOrgOwnership`" | Bypass les admins — ne résout rien |
| "Fix C-05 : `FOR UPDATE`" | Ne verrouille pas les lignes absentes |
| "Fix M-02 : `z.record()`" | Les loaders retournent des strings via `getLabel()` |
| "Fix M-04 : `?? throw new Error()`" | Syntaxe TypeScript invalide |
| "Fix M-07 : utiliser `App.Locals`" | Le `as any` est sur `sessionResult` (Better Auth), pas sur `locals` |
| "M-09 : deletePost sans cascade" | Toutes les FK ont `onDelete("cascade")` |
