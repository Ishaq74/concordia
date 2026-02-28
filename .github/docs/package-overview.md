# Présentation du package

**Nom du package** : `astrocss-drizzle-better-auth`

- **Type** : module
- **Version** : 0.0.1
- **Gestionnaire** : pnpm (tous les scripts doivent être lancés avec `pnpm`)

## Scripts opérationnels

| Script | Commande | Description |
|--------|----------|-------------|
| dev | pnpm dev | Démarre le serveur Astro en mode développement |
| build | pnpm build | Build le site pour la production (adapter Vercel ou Node selon l’option) |
| preview | pnpm preview | Lance un serveur local pour prévisualiser le build |
| build:node | pnpm build:node | Build le site pour Node (mode standalone) |
| preview:node | pnpm preview:node | Prévisualisation du build Node |
| sonda:report | pnpm sonda:report | Génère un rapport Sonda sur le build |
| db:check | pnpm db:check | Vérifie la cohérence du schéma Drizzle ORM |
| db:compare | pnpm db:compare | Compare les schémas Drizzle ORM (dev/prod) |
| syncdb:dev-to-prod | pnpm syncdb:dev-to-prod | Synchronise la base dev vers prod |
| syncdb:prod-to-dev | pnpm syncdb:prod-to-dev | Synchronise la base prod vers dev |
| db:migrate | pnpm db:migrate | Applique les migrations Drizzle ORM |
| db:generate | pnpm db:generate | Génère les types à partir du schéma Drizzle ORM |
| db:seed | pnpm db:seed | Remplit la base avec des données de test |
| smtp:check | pnpm smtp:check | Vérifie la configuration SMTP |
| test | pnpm test | Lance tous les tests (vitest) |
| test:unit | pnpm test:unit | Tests unitaires |
| test:integration | pnpm test:integration | Tests d’intégration (séquentiel) |
| test:e2e | pnpm test:e2e | Tests end-to-end |
| test:ui | pnpm test:ui | Tests UI (Playwright) |
| test:security | pnpm test:security | Tests de sécurité |
| test:api | pnpm test:api | Tests API Better Auth |
| test:all | pnpm test:all | Tous les tests |
| test:debug | pnpm test:debug | Debug des tests |
| test:ci | pnpm test:ci | Tests CI avec couverture |

## Dépendances principales
- **Astro** : ^5.17.3
- **Drizzle ORM** : ^0.45.1
- **Better Auth** : ^1.4.18
- **Sonda** : ^0.10.2
- **Playwright** : ^1.58.2
- **Vitest** : ^4.0.18

## Intégrations Astro
- `@astrojs/node` (mode standalone)
- `@astrojs/vercel` (déploiement Vercel)
- `astro-icon`, `astro-font`, `@astrojs/mdx`, `sonda/astro`
- i18n : fr, en, ar, es (locale par défaut : fr)

## Références croisées
- [astro.md](./astro.md)
- [drizzle-orm.md](./drizzle-orm.md)
- [better-auth.md](./better-auth.md)
- [security.md](./security.md)
- [api-reference.md](./api-reference.md)

## Sources
- `package.json`
- `astro.config.mjs`
- Documentation interne : `.github/docs/astrojs.txt`, `.github/docs/better-auth.txt`

---

*Document maintenu par Vladimir. Toute modification de scripts ou dépendances doit être répercutée ici.*
