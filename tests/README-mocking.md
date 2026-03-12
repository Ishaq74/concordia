# Mocks & Test Environment Variables

Ce fichier décrit en détail les mécanismes de moquage (`mock`) utilisés
lors de l'exécution de la suite de tests, ainsi que les variables d'environnement
qui influencent ce comportement.

## Pourquoi des mocks ?
Les mocks isolent le code testé de dépendances externes (SMTP, base de données,
etc.) pour garantir :

- des tests rapides et déterministes
- aucune facture imprévue (pas de vrais emails)
- une base de données jetable réinitialisée à chaque test
- un contrôle total des réponses (rate-limit, plugins, etc.)

## Mocks appliqués globalement (dans `tests/setup.ts`)
Les imports suivants sont remplacés **avant le chargement du code applicatif** :

| Module importé           | Remplacement en test                                  |
|--------------------------|--------------------------------------------------------|
| `nodemailer`             | stub avec `sendMail` qui logge et stocke dans une liste |
| `@lib/rate-limit`        | fonctions `checkRateLimit` autorisent toujours          |
| `better-auth/plugins`    | plugin `admin` no‑op                                    |
| `@database/drizzle`      | renvoie `getTestDb()` (pg‑mem ou `DATABASE_URL_TEST`)   |

> Le mock `nodemailer` est complété par `src/lib/smtp/store.ts` :
> lorsque `SMTP_MOCK` ou `NODE_ENV==='test'`, les emails envoyés sont
globaux et accessibles via la page `/__mocks__/emails` (utilisée par
les tests E2E). Cette page n'existe en prod que si `NODE_ENV==='test'`.

### Éviter les faux positifs
- Ne jamais appeler `vi.unmock('nodemailer')` sauf pour un test explicite.
- Tout test qui a besoin d'une connexion SMTP réelle doit définir
  `SMTP_MOCK=0` et gérer manuellement la restitution des emails.

## Variables d'environnement pertinentes
| Variable | Usage                       | Valeur recommandée en test   |
|----------|-----------------------------|------------------------------|
| `SMTP_MOCK` | Force l'utilisation du mode mock | `1` (actif par défaut en test) |
| `DATABASE_URL_TEST` | URL PG pour la BD de test | **Requis** — doit pointer vers une vraie base PostgreSQL |
| `NODE_ENV` | Détermine `isMocked` dans SMTP | `test` (défini automatiquement) |
| `BETTER_AUTH_URL` | Base URL de l'API auth dans les tests | `http://localhost:4321` |

> Si `DATABASE_URL_TEST` pointe sur une base invalide, un test
> spécifique (`sanity.test.ts`) échoue immédiatement et prévient le
> testeur. Ne laissez jamais cette variable définie sur la base de
> production.

## Contournement des mocks
- Pour exécuter un test contre un service réel, utilisez `vi.unmock()`
  puis restaurez l'état initial via `vi.restoreAllMocks()` en `afterEach`.
- Un exemple complet est fourni dans `tests/playground/real-smtp.test.ts`.

## Règles de codage liées aux mocks
La configuration ESLint du projet (`.eslintrc.cjs`) contient une règle
`no-restricted-imports` qui interdit les importations directes de
`nodemailer` ou `pg` dans le code applicatif. Cela empêche l’écriture de
fonctions qui contourneraient le moquage et alertera en cas d’import
indésirable.

## Boîte aux lettres de test (mailbox)
Les e2e tests Playwright peuvent lire les courriels envoyés sans toucher
un serveur SMTP réel en consultant l’endpoint JSON :

```http
GET /__mocks__/emails
```

La même route accepte un `POST { action: 'clear' }` pour vider la liste
lors d’un scénario. Cette page n’existe que lorsque
`NODE_ENV==='test'`, elle renvoie `404` en développement ou production.

## Résumé rapide
```bash
# lancer uniquement les tests unitaires (aucun mock désactivé)
pm run test:unit

# lancer la suite complète, utilise les mocks automatiques
npm run test

# rechercher un nom de test
e.g. npm run test -- --testNamePattern="email"
```

Conservez ce document à jour lorsque de nouveaux mocks ou variables
sont ajoutés.