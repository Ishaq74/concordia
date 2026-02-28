# Documentation Astro (opérationnelle)

## Intégrations et configuration

- **Adapters** :
  - `@astrojs/node` (mode standalone, utilisé si `--node`)
  - `@astrojs/vercel` (déploiement Vercel)
- **Intégrations** :
  - `astro-icon`, `sonda/astro`, `@astrojs/mdx`
- **i18n** :
  - Locales supportées : fr, en, ar, es
  - Locale par défaut : fr
  - Routage : prefixDefaultLocale: true
- **Redirection** : `/` → `/fr/`
- **DevToolbar** : activé
- **Sourcemaps** : activés en build

## Scripts Astro
- `pnpm dev` : serveur de développement
- `pnpm build` : build production (adapter selon option)
- `pnpm preview` : prévisualisation locale
- `pnpm build:node` / `pnpm preview:node` : mode Node standalone

## Exemples d’utilisation

```sh
pnpm dev
pnpm build
pnpm build:node
```

## Références croisées
- [package-overview.md](./package-overview.md)
- [drizzle-orm.md](./drizzle-orm.md)
- [better-auth.md](./better-auth.md)

## Sources
- `.github/docs/astrojs.txt` (extraits pertinents)
- `astro.config.mjs`

---

*Document maintenu par Vladimir. Toute modification de configuration Astro doit être répercutée ici.*
