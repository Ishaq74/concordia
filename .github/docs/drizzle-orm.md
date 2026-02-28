# Documentation Drizzle ORM (opérationnelle)

## Intégration
- **Dépendance** : `drizzle-orm` (^0.45.1)
- **Scripts associés** :
  - `pnpm db:check` : vérifie le schéma
  - `pnpm db:compare` : compare dev/prod
  - `pnpm db:migrate` : applique les migrations
  - `pnpm db:generate` : génère les types
  - `pnpm db:seed` : seed la base
  - `pnpm syncdb:dev-to-prod` / `pnpm syncdb:prod-to-dev` : synchronisation

## Exemples d’utilisation

```sh
pnpm db:check
pnpm db:migrate
pnpm db:generate
```

## Références croisées
- [package-overview.md](./package-overview.md)
- [astro.md](./astro.md)
- [better-auth.md](./better-auth.md)

## Sources
- `package.json`
- `astro.config.mjs`

---

*Document maintenu par Vladimir. Toute modification de schéma ou de scripts Drizzle doit être répercutée ici.*
