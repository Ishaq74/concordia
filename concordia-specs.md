# Concordia — Conception Technique Détaillée

> **Document de spécification technique** — Fusion du PRD Concordia (restaurer l'humanité) et de la conception Ville Numérique Vivante.
> Stack cible : Astro 5.x SSR, Better Auth, Drizzle ORM, PostgreSQL. Voir `.github/copilot-instructions.md` pour les conventions.

---

## Table of Contents

- [0. MÉTA](#0-méta)
- [1. MODÈLE DE DOMAINE & DICTIONNAIRE DE DONNÉES](#1-modèle-de-domaine--dictionnaire-de-données)
  - [1.1 Catalogue des entités](#11-catalogue-des-entités)
  - [1.2 Spécification détaillée par entité](#12-spécification-détaillée-par-entité)
  - [1.3 Relations globales](#13-relations-globales)
- [2. PERMISSIONS & SÉCURITÉ](#2-permissions--sécurité)
  - [2.1 Rôles & acteurs](#21-rôles--acteurs)
  - [2.2 Matrice d'autorisations CRUD+](#22-matrice-dautorisations-crud)
  - [2.3 Règles transverses](#23-règles-transverses)
- [3. OPÉRATIONS LOGIQUES](#3-opérations-logiques)
- [4. PARCOURS UTILISATEURS](#4-parcours-utilisateurs)
- [5. PLAN UI](#5-plan-ui)
- [6. EXIGENCES NON FONCTIONNELLES](#6-exigences-non-fonctionnelles)
- [7. INTÉGRATIONS EXTERNES](#7-intégrations-externes)
- [8. TÂCHES D'IMPLÉMENTATION](#8-tâches-dimplémentation)
- [9. PLAN DE TESTS](#9-plan-de-tests)
- [10. FICHIERS & MÉDIAS](#10-fichiers--médias)
- [11. TRAITEMENTS DIFFÉRÉS & PLANIFICATION](#11-traitements-différés--planification)
- [12. OBSERVABILITÉ & ANALYTIQUE](#12-observabilité--analytique)
- [13. MIGRATIONS & DONNÉES INITIALES](#13-migrations--données-initiales)
- [14. RISQUES, HYPOTHÈSES & QUESTIONS OUVERTES](#14-risques-hypothèses--questions-ouvertes)
- [15. ANNEXES NORMATIVES](#15-annexes-normatives)
- [16. CONTRÔLES QUALITÉ & CHECKLISTS](#16-contrôles-qualité--checklists)

---

# 0. MÉTA

### Version

2.0.0

### Date de génération

2026-02-13

### Auteur

Concepteur IA

### Références

- **PRD Concordia** — Vision : restaurer l'humanité. Marketplace solidaire, médiation, cartographie participative, éducation, micro-financement, bénévolat, transparence.
- **PRD Ville Numérique Vivante** — Annuaire de lieux, magazine d'articles, forum, messagerie, portefeuille numérique, réservations.
- **Schema Supabase existant** (`schema.txt`) — 35 tables implémentées dans un projet Supabase antérieur, servant de référence pour certains modèles de données.
- **Infrastructure Concordia existante** — 9 tables Better Auth/audit, 30+ composants UI, système auth complet, 4 variantes CSS, i18n 4 locales.

### Portée

#### Objectifs

1. **Cartographier** les besoins locaux et les ressources humaines/matérielles disponibles.
2. **Faciliter la médiation** et la réconciliation entre individus et communautés.
3. **Mettre en relation** compétences et projets de réparation (sociale, environnementale, culturelle).
4. **Promouvoir l'éducation** civique, la santé mentale et la résilience communautaire.
5. **Soutenir** des initiatives tangibles (réhabilitation d'espaces, ateliers, services d'entraide).
6. **Animer le territoire** avec du contenu rédactionnel, un forum communautaire, et des services numériques (annuaire, réservations, portefeuille).

#### Livrables

- Annuaire de lieux avec soumission propriétaire, attributs dynamiques, traductions multilingues.
- Magazine d'articles (CMS) avec intégration lieux et catégories.
- Système d'avis et commentaires avec sous-notations et modération.
- Forum thématique hiérarchique.
- Place de marché solidaire (annonces classées, services locaux).
- Messagerie privée en temps réel.
- Portefeuille numérique (crédit, transfert, paiement).
- Système de réservation (disponibilités, paiement, commissions).
- Système de médiation en ligne (cas, sessions, accords).
- Modules d'éducation et d'ateliers (cours, leçons, progression).
- Organisation de bénévolat (projets, tâches, participation).
- Micro-financement (campagnes, dons, décaissement).
- Tableaux de bord de transparence et d'impact.
- Panneau d'administration (modération, gestion utilisateurs, taxonomie).
- Activités, événements, sentiers, produits locaux, groupes communautaires.
- Système de favoris/signets.

#### Non-objectifs

- Réseau social général (pas de fil d'actualité, pas de followers, pas de stories).
- Place de marché commerciale pure (pas de panier, pas de checkout e-commerce).
- Application mobile native (progressive web app uniquement).
- Conception graphique/maquettes (seule la description logique des vues).
- Hébergement/déploiement infrastructure (géré séparément).

### Parties prenantes

| Acteur | Description | Portée |
|---|---|---|
| **Anonyme** | Visiteur non authentifié | Consultation publique : lieux, articles, forum, annonces, services, événements, sentiers |
| **Citoyen** | Utilisateur authentifié (rôle par défaut) | Profil, avis, commentaires, forum, messagerie, annonces, portefeuille, réservations, favoris, signalements |
| **Propriétaire** | Citoyen gérant un ou plusieurs établissements | Soumission/gestion de lieux, disponibilités, réponse aux avis, perception des paiements |
| **Auteur** | Citoyen publiant du contenu rédactionnel | Création/gestion d'articles via back-office |
| **Médiateur** | Citoyen certifié pour la résolution de conflits | Prise en charge de cas de médiation, animation de sessions, rédaction d'accords |
| **Éducateur** | Citoyen créant du contenu pédagogique | Création/gestion de modules et leçons d'éducation |
| **Modérateur** | Citoyen avec droits de modération | Modération du contenu communautaire (avis, commentaires, forum, annonces) |
| **Administrateur** | Gestion globale de la plateforme | Gestion utilisateurs, taxonomie, configuration, audit, rapports |
| **Système** | Processus automatisés | Notifications, jobs différés, agrégation métriques, commissions |

### Glossaire

| Terme | Définition |
|---|---|
| **Annonce classée** | Offre de bien ou service entre citoyens sur la place du marché solidaire |
| **Article** | Contenu rédactionnel publié dans le magazine, lié aux catégories et lieux |
| **Attribut** | Caractéristique dynamique et typée d'un lieu (ex : « Wifi : Oui ») |
| **Avis (Review)** | Retour structuré d'un citoyen sur un lieu : notation globale, sous-notations, texte |
| **Campagne de micro-financement** | Collecte de fonds pour un projet communautaire avec objectif et échéance |
| **Cas de médiation** | Dossier de résolution de conflit entre parties, géré par un médiateur |
| **Catégorie** | Classification hiérarchique (3 niveaux max) pour lieux, articles, forum, annonces, services, éducation, projets |
| **Commentaire** | Texte de discussion sur un article ou réponse à un avis/commentaire |
| **Conversation** | Échange privé entre deux ou plusieurs citoyens |
| **Disponibilité** | Créneau temporel réservable pour un lieu ou service |
| **Événement** | Activité planifiée avec date, lieu, inscription et éventuellement paiement |
| **Favori** | Marque-page d'un utilisateur sur un lieu, événement ou sentier |
| **Groupe** | Communauté d'intérêt entre citoyens avec membres et rôles |
| **Idempotence** | Propriété d'une opération produisant le même résultat en cas d'exécution répétée |
| **Impact metric** | Indicateur mesurable de l'effet positif d'une action (projets achevés, heures bénévoles, conflits résolus) |
| **Leçon** | Unité pédagogique au sein d'un module d'éducation |
| **Lieu** | Établissement physique ou point d'intérêt référencé dans l'annuaire |
| **Médiation** | Processus structuré de résolution de conflit assisté par un tiers neutre |
| **Module d'éducation** | Parcours pédagogique structuré (cours) avec leçons ordonnées |
| **Notification** | Alerte envoyée à un utilisateur (nouveau message, avis reçu, lieu approuvé, etc.) |
| **Ownership** | Concept de propriété : l'utilisateur ayant créé une ressource détient des droits privilégiés |
| **POI** | Point d'intérêt sur un sentier (point de vue, fontaine, etc.) |
| **Portefeuille numérique** | Solde de crédit interne pour les transactions sur la plateforme |
| **Produit local** | Bien produit localement, référencé avec saisonnalité et producteur |
| **Projet bénévole** | Initiative communautaire avec tâches, participants et objectifs mesurables |
| **Réservation** | Blocage d'un créneau ou d'une date pour un service ou hébergement |
| **RLS** | Contrôle d'accès au niveau des lignes de données |
| **Sentier** | Itinéraire de randonnée/balade avec tracé GPX, difficulté, dénivelé |
| **Service local** | Prestation proposée par un citoyen ou professionnel |
| **Slug** | Identifiant textuel unique et lisible, utilisé dans les URL |
| **Sous-notation** | Note granulaire sur un aspect spécifique d'un lieu, composant d'un avis |
| **Sujet de forum** | Publication initiale dans une catégorie de forum, déclenchant un fil de discussion |
| **Taxonomie** | Système de classification hiérarchique (catégories, attributs, tags) |
| **Transaction** | Opération financière affectant un portefeuille (crédit, transfert, paiement, commission) |
| **Transparence** | Publication ouverte des indicateurs d'impact et de la gestion financière |

---

# 1. MODÈLE DE DOMAINE & DICTIONNAIRE DE DONNÉES

## 1.1 Catalogue des entités

> Les entités marquées **[EXISTANT]** sont déjà implémentées dans le repo Concordia (Better Auth). Les autres sont à créer.

| # | Entité | Description | Clé primaire | Ownership | Domaine |
|---|---|---|---|---|---|
| 1 | `user` **[EXISTANT]** | Compte utilisateur authentifié (Better Auth) | `id` (text) | Système | Auth |
| 2 | `session` **[EXISTANT]** | Session active | `id` (text) | Système | Auth |
| 3 | `account` **[EXISTANT]** | Liaison fournisseur OAuth/credentials | `id` (text) | Système | Auth |
| 4 | `verification` **[EXISTANT]** | Tokens de vérification email/reset | `id` (text) | Système | Auth |
| 5 | `organization` **[EXISTANT]** | Structure organisationnelle | `id` (text) | Admin | Auth |
| 6 | `member` **[EXISTANT]** | Appartenance utilisateur ↔ organisation | `id` (text) | Organisation | Auth |
| 7 | `invitation` **[EXISTANT]** | Invitation à rejoindre une organisation | `id` (text) | Organisation | Auth |
| 8 | `rate_limit` **[EXISTANT]** | Compteurs de rate limiting | `id` (text) | Système | Auth |
| 9 | `audit_log` **[EXISTANT]** | Journal d'audit (à étendre) | `id` (text) | Système | Auth |
| 10 | `profile` | Profil public d'un utilisateur | `id` (uuid) | Utilisateur | Utilisateurs |
| 11 | `user_role` | Rôles attribués à un utilisateur | `id` (uuid) | Admin | Utilisateurs |
| 12 | `category` | Classification hiérarchique | `id` (uuid) | Admin | Taxonomie |
| 13 | `attribute_definition` | Définition d'attribut dynamique | `id` (uuid) | Admin | Taxonomie |
| 14 | `tag` | Étiquette libre | `id` (uuid) | Admin | Taxonomie |
| 15 | `place` | Lieu / établissement | `id` (uuid) | Propriétaire | Lieux |
| 16 | `place_translation` | Traduction d'un lieu | `id` (uuid) | Propriétaire | Lieux |
| 17 | `place_attribute_value` | Valeur d'attribut pour un lieu | `id` (uuid) | Propriétaire | Lieux |
| 18 | `accommodation_detail` | Détails hébergement | `place_id` (uuid FK) | Propriétaire | Lieux |
| 19 | `gastronomy_detail` | Détails gastronomie | `place_id` (uuid FK) | Propriétaire | Lieux |
| 20 | `activity_detail` | Détails activité | `place_id` (uuid FK) | Propriétaire | Lieux |
| 21 | `address` | Adresse postale avec géolocalisation | `id` (uuid) | Système | Lieux |
| 22 | `trail` | Sentier de randonnée/balade | `id` (uuid) | Auteur | Lieux |
| 23 | `poi` | Point d'intérêt sur un sentier | `id` (uuid) | Auteur | Lieux |
| 24 | `image` | Fichier image uploadé | `id` (uuid) | Uploader | Médias |
| 25 | `gallery` | Collection d'images | `id` (uuid) | Créateur | Médias |
| 26 | `gallery_item` | Image dans une galerie | `id` (uuid) | Créateur | Médias |
| 27 | `place_tag` | Liaison lieu ↔ tag | `place_id` + `tag_id` | Système | Taxonomie |
| 28 | `favorite` | Marque-page utilisateur | `id` (uuid) | Utilisateur | Interactions |
| 29 | `article` | Article de magazine | `id` (uuid) | Auteur | Contenu |
| 30 | `article_content` | Contenu riche d'un article (JSON) | `id` (uuid) | Auteur | Contenu |
| 31 | `article_category_link` | Liaison article ↔ catégorie | `article_id` + `category_id` | Auteur | Contenu |
| 32 | `article_place_link` | Liaison article ↔ lieu | `article_id` + `place_id` | Auteur | Contenu |
| 33 | `article_place_comparison` | Comparatif de lieux dans un article | `id` (uuid) | Auteur | Contenu |
| 34 | `review` | Avis sur un lieu | `id` (uuid) | Citoyen | Interactions |
| 35 | `sub_rating` | Sous-notation d'un avis | `id` (uuid) | Citoyen | Interactions |
| 36 | `comment` | Commentaire sur article/avis | `id` (uuid) | Citoyen | Interactions |
| 37 | `forum_thread` | Sujet de forum | `id` (uuid) | Citoyen | Communauté |
| 38 | `forum_post` | Message dans un fil de forum | `id` (uuid) | Citoyen | Communauté |
| 39 | `classified` | Petite annonce | `id` (uuid) | Citoyen | Marché |
| 40 | `local_service` | Service local proposé | `id` (uuid) | Prestataire | Marché |
| 41 | `event` | Événement planifié | `id` (uuid) | Organisateur | Communauté |
| 42 | `event_registration` | Inscription à un événement | `id` (uuid) | Participant | Communauté |
| 43 | `group` | Groupe communautaire | `id` (uuid) | Créateur | Communauté |
| 44 | `group_member` | Membre d'un groupe | `group_id` + `user_id` | Groupe | Communauté |
| 45 | `product` | Produit local | `id` (uuid) | Producteur | Marché |
| 46 | `professional` | Profil professionnel | `place_id` (uuid FK) | Professionnel | Lieux |
| 47 | `conversation` | Échange privé | `id` (uuid) | Participants | Messagerie |
| 48 | `conversation_participant` | Participant à une conversation | `id` (uuid) | Système | Messagerie |
| 49 | `message` | Message privé | `id` (uuid) | Expéditeur | Messagerie |
| 50 | `notification` | Notification utilisateur | `id` (uuid) | Destinataire | Notifications |
| 51 | `wallet` | Portefeuille numérique | `id` (uuid) | Utilisateur | Économie |
| 52 | `transaction` | Opération financière | `id` (uuid) | Système | Économie |
| 53 | `system_commission` | Commission plateforme | `id` (uuid) | Système | Économie |
| 54 | `service_availability` | Créneau de disponibilité | `id` (uuid) | Propriétaire | Économie |
| 55 | `booking` | Réservation | `id` (uuid) | Client | Économie |
| 56 | `mediation_case` | Dossier de médiation | `id` (uuid) | Système | Médiation |
| 57 | `mediation_session` | Session de médiation planifiée | `id` (uuid) | Médiateur | Médiation |
| 58 | `mediation_agreement` | Accord de résolution | `id` (uuid) | Parties | Médiation |
| 59 | `education_module` | Parcours pédagogique | `id` (uuid) | Éducateur | Éducation |
| 60 | `education_lesson` | Leçon individuelle | `id` (uuid) | Éducateur | Éducation |
| 61 | `education_enrollment` | Inscription à un module | `id` (uuid) | Citoyen | Éducation |
| 62 | `education_progress` | Progression par leçon | `id` (uuid) | Citoyen | Éducation |
| 63 | `volunteer_project` | Projet bénévole communautaire | `id` (uuid) | Coordinateur | Bénévolat |
| 64 | `volunteer_task` | Tâche dans un projet bénévole | `id` (uuid) | Coordinateur | Bénévolat |
| 65 | `volunteer_participation` | Engagement bénévole | `id` (uuid) | Bénévole | Bénévolat |
| 66 | `funding_campaign` | Campagne de micro-financement | `id` (uuid) | Porteur de projet | Financement |
| 67 | `donation` | Don à une campagne | `id` (uuid) | Donateur | Financement |
| 68 | `impact_metric` | Indicateur d'impact mesurable | `id` (uuid) | Système | Transparence |
| 69 | `transparency_report` | Rapport de transparence publié | `id` (uuid) | Admin | Transparence |

---

## 1.2 Spécification détaillée par entité

> Les 9 entités **[EXISTANT]** (user, session, account, verification, organization, member, invitation, rate_limit, audit_log) sont documentées dans `.github/copilot-instructions.md` et les schemas Drizzle dans `src/database/schemas/`. Seules les extensions nécessaires sont notées ici. Les entités suivantes couvrent tout ce qui est à construire.

---

### `profile`

**Description** : Informations publiques et privées associées à un utilisateur. Un profil est créé automatiquement à l'inscription.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | UUID v4 | `"a1b2c3d4-..."` |
| `user_id` | uuid FK → user.id | Oui | Oui | — | Utilisateur existant | `"u1v2w3x4-..."` |
| `username` | text | Oui | Oui | — | 3-30 chars, alphanumérique + tirets, pas d'espaces, pas de mots réservés | `"ishaq-42"` |
| `full_name` | text | Non | Non | null | 2-100 chars, pas de caractères spéciaux dangereux | `"Ishaq B."` |
| `bio` | text | Non | Non | null | Max 500 chars | `"Architecte de systèmes"` |
| `avatar_url` | text | Non | Non | null | URL valide ou chemin de stockage interne | `"/uploads/avatars/a1b2.webp"` |
| `location` | text | Non | Non | null | Max 100 chars | `"Paris, France"` |
| `website` | text | Non | Non | null | URL valide, max 255 chars | `"https://example.com"` |
| `preferred_language` | text | Non | Non | `"fr"` | ISO 639-1 : `fr`, `en`, `ar`, `es` | `"fr"` |
| `is_active` | boolean | Oui | Non | true | — | `true` |
| `created_at` | timestamp | Oui | Non | now() | — | `"2026-02-13T10:00:00Z"` |
| `updated_at` | timestamp | Oui | Non | now() | Auto-update on change | `"2026-02-13T10:00:00Z"` |

**Contraintes** : `user_id` unique (1 profil par utilisateur). `username` unique globalement, insensible à la casse.

**Indexation** : `username` (recherche), `user_id` (jointure), `location` (filtre géographique textuel).

**Relations** :

- `user` → 1-1 → `profile` (cascade delete)

**Cycle de vie** : Créé à l'inscription, modifiable par l'utilisateur, suppression en cascade avec le compte (hard delete après période RGPD).

**Exemple JSON** :

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": "u1v2w3x4-y5z6-7890-abcd-ef1234567890",
  "username": "ishaq-42",
  "full_name": "Ishaq B.",
  "bio": "Architecte de systèmes et bâtisseur du web.",
  "avatar_url": "/uploads/avatars/a1b2c3d4.webp",
  "location": "Paris, France",
  "website": "https://example.com",
  "preferred_language": "fr",
  "is_active": true,
  "created_at": "2026-02-13T10:00:00Z",
  "updated_at": "2026-02-13T10:00:00Z"
}
```

---

### `user_role`

**Description** : Table de jonction attribuant des rôles à un utilisateur. Un utilisateur peut avoir plusieurs rôles simultanément (ex : citoyen + médiateur + éducateur).

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | `"r1s2t3-..."` |
| `user_id` | uuid FK → user.id | Oui | Non | — | Utilisateur existant | `"u1v2w3x4-..."` |
| `role` | enum | Oui | Non | — | Voir valeurs ci-dessous | `"mediator"` |
| `granted_by` | uuid FK → user.id | Non | Non | null | Admin/système ayant attribué | `"admin-uuid-..."` |
| `granted_at` | timestamp | Oui | Non | now() | — | `"2026-02-13T10:00:00Z"` |

**Enum `app_role`** : `citizen`, `owner`, `author`, `mediator`, `educator`, `moderator`, `admin`

**Contraintes** : Composite unique `(user_id, role)` — un utilisateur ne peut pas avoir le même rôle deux fois. Tout utilisateur a obligatoirement le rôle `citizen` (inséré à la création du compte).

**Relations** :

- `user` → 1-N → `user_role` (cascade delete)

---

### `category`

**Description** : Classification hiérarchique pour organiser lieux, articles, forum, annonces, services, éducation et projets. Maximum 3 niveaux de profondeur.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | `"cat-uuid-1"` |
| `parent_id` | uuid FK → category.id | Non | Non | null | Catégorie existante, pas de cycle, level ≤ 3 | `"cat-uuid-0"` |
| `name` | text | Oui | Non | — | 2-100 chars | `"Hébergement"` |
| `slug` | text | Oui | Non | — | Unique au sein du même parent. Alphanum + tirets, 2-120 chars | `"hebergement"` |
| `description` | text | Non | Non | null | Max 500 chars | `"Hôtels, gîtes, campings..."` |
| `type` | enum | Oui | Non | — | Voir valeurs | `"place"` |
| `icon` | text | Non | Non | null | Nom d'icône MDI ou URL | `"mdi:bed"` |
| `level` | integer | Oui | Non | 1 | 1-3, cohérent avec parent_id (parent.level + 1) | `2` |
| `sort_order` | integer | Oui | Non | 0 | Ordre d'affichage au sein du parent | `1` |
| `is_active` | boolean | Oui | Non | true | — | `true` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Enum `category_type`** : `place`, `magazine`, `forum`, `classified`, `service`, `education`, `project`

**Contraintes** : Unique composite `(parent_id, slug)`. `level` = 1 si `parent_id` est null, sinon `parent.level + 1`. Max level = 3. `parent_id` ne peut pas créer de cycle (un ancêtre ne peut pas être son propre descendant).

**Indexation** : `slug` + `parent_id` (navigation), `type` (filtrage), `parent_id` (arbre).

**Relations** :

- `category` → 0-N → `category` (auto-référence via parent_id, cascade restrict on delete si enfants existent)
- `category` → 0-N → `place` (restrict delete si lieux liés)
- `category` → 0-N → `article_category_link`
- `category` → 0-N → `forum_thread`
- `category` → 0-N → `classified`
- `category` → 0-N → `local_service`
- `category` → 0-N → `education_module`
- `category` → 0-N → `volunteer_project`

**Exemple JSON** :

```json
{
  "id": "cat-hebergement-uuid",
  "parent_id": null,
  "name": "Hébergement",
  "slug": "hebergement",
  "description": "Tous types d'hébergements : hôtels, gîtes, campings, etc.",
  "type": "place",
  "icon": "mdi:bed",
  "level": 1,
  "sort_order": 1,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

### `attribute_definition`

**Description** : Définition d'un attribut dynamique applicable aux lieux. L'admin crée les définitions ; les propriétaires saisissent les valeurs via `place_attribute_value`.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `name` | text | Oui | Oui | — | 2-100 chars, unique globalement | `"Wifi"` |
| `slug` | text | Oui | Oui | — | Dérivé du name | `"wifi"` |
| `value_type` | enum | Oui | Non | — | `boolean`, `string`, `integer`, `decimal`, `enum` | `"boolean"` |
| `possible_values` | text[] | Non | Non | null | Obligatoire si value_type = `enum` | `["gratuit", "payant"]` |
| `description` | text | Non | Non | null | Max 255 chars | `"Disponibilité du réseau sans fil"` |
| `applicable_category_ids` | uuid[] | Non | Non | null | Catégories auxquelles cet attribut s'applique. null = toutes | `["cat-hebergement-uuid"]` |
| `is_active` | boolean | Oui | Non | true | — | `true` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Relations** :

- `attribute_definition` → 0-N → `place_attribute_value`

---

### `tag`

**Description** : Étiquette libre pour enrichir le référencement des lieux.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `name` | text | Oui | Oui | — | 2-50 chars, unique insensible à la casse | `"vue panoramique"` |
| `slug` | text | Oui | Oui | — | Dérivé du name | `"vue-panoramique"` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Relations** :

- `tag` → N-N → `place` via `place_tag`

---

### `place`

**Description** : Établissement physique ou point d'intérêt référencé dans l'annuaire. Soumis par un propriétaire, validé par un admin.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `owner_id` | uuid FK → user.id | Oui | Non | — | Utilisateur existant avec rôle `owner` | — |
| `category_id` | uuid FK → category.id | Oui | Non | — | Catégorie feuille de type `place` | — |
| `slug` | text | Oui | Oui | — | Unique global, 2-220 chars, alphanum + tirets | `"hotel-du-parc"` |
| `type` | enum `place_type` | Oui | Non | — | Voir valeurs | `"hotel"` |
| `address_id` | uuid FK → address.id | Non | Non | null | Adresse existante | — |
| `latitude` | decimal(10,7) | Non | Non | null | -90 à 90 | `48.8566969` |
| `longitude` | decimal(10,7) | Non | Non | null | -180 à 180 | `2.3514616` |
| `email` | text | Non | Non | null | Email valide | — |
| `phone` | text | Non | Non | null | Format E.164 | — |
| `website` | text | Non | Non | null | URL valide | — |
| `open_hours` | jsonb | Non | Non | null | Objet JSON structuré par jour de semaine | — |
| `accessibility` | text[] | Non | Non | null | Labels d'accessibilité | `["wheelchair", "elevator"]` |
| `audience` | text[] | Non | Non | null | Public cible | `["families", "couples"]` |
| `price_range` | enum | Non | Non | null | `low`, `medium`, `high`, `luxury` | `"medium"` |
| `rating_avg` | decimal(2,1) | Non | Non | null | 0.0 à 5.0, calculé automatiquement | `4.2` |
| `rating_count` | integer | Non | Non | 0 | Nombre d'avis publiés | `42` |
| `status` | enum | Oui | Non | `"pending_review"` | Voir machine à états | `"published"` |
| `submitted_at` | timestamp | Oui | Non | now() | — | — |
| `published_at` | timestamp | Non | Non | null | Set quand status → published | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Enum `place_type`** : `restaurant`, `hotel`, `camping`, `commerce`, `admin`, `activity`, `poi`, `trail`, `balade`, `randonnee`, `velo`

**Enum `place_status`** : `pending_review`, `published`, `archived`, `rejected`

**Machine à états** :

```
pending_review → published    (Admin approuve)
pending_review → rejected     (Admin rejette, motif obligatoire)
published      → archived     (Propriétaire ou Admin archive)
rejected       → pending_review (Propriétaire resoumet après corrections)
archived       → pending_review (Propriétaire réactive, repasse en revue)
```

**Indexation** : `slug` (unique, lookup), `category_id` (listing), `owner_id` (mes lieux), `status` (admin moderation queue), `latitude` + `longitude` (recherche géographique), `rating_avg` (tri).

**Relations** :

- `user` → 1-N → `place` (restrict delete si lieux publiés)
- `category` → 1-N → `place`
- `address` → 0-1 → `place`
- `place` → 0-1 → `accommodation_detail` (cascade delete)
- `place` → 0-1 → `gastronomy_detail` (cascade delete)
- `place` → 0-1 → `activity_detail` (cascade delete)
- `place` → 0-1 → `professional` (cascade delete)
- `place` → 0-N → `place_translation` (cascade delete)
- `place` → 0-N → `place_attribute_value` (cascade delete)
- `place` → N-N → `tag` via `place_tag`
- `place` → 0-N → `review`
- `place` → 0-N → `image`
- `place` → 0-N → `article_place_link`
- `place` → 0-N → `service_availability`
- `place` → 0-N → `event`
- `place` → 0-N → `local_service`
- `place` → 0-N → `favorite`

**Cycle de vie** : Soumis → en attente de validation → publié/rejeté → archivable → réactivable. Soft delete via archivage. Hard delete admin uniquement si aucune réservation/avis existant.

**Exemple JSON** :

```json
{
  "id": "place-uuid-1",
  "owner_id": "user-uuid-1",
  "category_id": "cat-hotel-uuid",
  "slug": "hotel-du-parc-paris",
  "type": "hotel",
  "address_id": "addr-uuid-1",
  "latitude": 48.8566969,
  "longitude": 2.3514616,
  "email": "contact@hotelduparc.fr",
  "phone": "+33140000000",
  "website": "https://hotelduparc.fr",
  "open_hours": {
    "monday": [{"open": "07:00", "close": "23:00"}],
    "tuesday": [{"open": "07:00", "close": "23:00"}]
  },
  "accessibility": ["wheelchair", "elevator"],
  "audience": ["families", "couples", "business"],
  "price_range": "high",
  "rating_avg": 4.2,
  "rating_count": 42,
  "status": "published",
  "submitted_at": "2026-01-15T09:00:00Z",
  "published_at": "2026-01-16T14:30:00Z",
  "created_at": "2026-01-15T09:00:00Z",
  "updated_at": "2026-02-01T11:00:00Z"
}
```

---

### `place_translation`

**Description** : Traduction des informations descriptives d'un lieu en plusieurs langues.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `place_id` | uuid FK → place.id | Oui | Non | — | — | — |
| `language` | text | Oui | Non | — | ISO 639-1 : `fr`, `en`, `ar`, `es` | `"fr"` |
| `name` | text | Oui | Non | — | 2-200 chars | `"Hôtel du Parc"` |
| `description` | text | Non | Non | null | Max 2000 chars | `"Un hôtel charmant..."` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(place_id, language)`. Un lieu doit avoir au moins une traduction (dans la langue par défaut du propriétaire).

---

### `place_attribute_value`

**Description** : Valeur concrète d'un attribut pour un lieu donné.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `place_id` | uuid FK → place.id | Oui | Non | — | — | — |
| `attribute_id` | uuid FK → attribute_definition.id | Oui | Non | — | — | — |
| `value_boolean` | boolean | Non | Non | null | Peuplé si type = boolean | `true` |
| `value_string` | text | Non | Non | null | Peuplé si type = string/enum. Max 255 chars | `"gratuit"` |
| `value_integer` | integer | Non | Non | null | Peuplé si type = integer | `50` |
| `value_decimal` | decimal | Non | Non | null | Peuplé si type = decimal | `9.99` |

**Contraintes** : Unique composite `(place_id, attribute_id)`. Exactement un champ value_* doit être non null, correspondant au `value_type` de la définition d'attribut.

---

### `accommodation_detail`

**Description** : Informations spécifiques aux lieux de type hébergement.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `place_id` | uuid FK → place.id | Oui | Oui (PK) | — | Le lieu doit avoir un type d'hébergement | — |
| `stars` | integer | Non | Non | null | 1-5 | `4` |
| `accommodation_type` | text | Non | Non | null | Libre : hotel, gîte, camping, etc. | `"hotel"` |
| `capacity` | integer | Non | Non | null | > 0 | `120` |
| `pets_allowed` | boolean | Non | Non | null | — | `true` |
| `pool` | boolean | Non | Non | null | — | `false` |
| `spa` | boolean | Non | Non | null | — | `false` |
| `family_rooms` | boolean | Non | Non | null | — | `true` |
| `booking_url` | text | Non | Non | null | URL valide | — |
| `availability` | jsonb | Non | Non | null | Structure de disponibilité | — |

---

### `gastronomy_detail`

**Description** : Informations spécifiques aux lieux de type gastronomie.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `place_id` | uuid FK → place.id | Oui | Oui (PK) | — | Le lieu doit avoir un type gastronomique | — |
| `cuisine` | text | Non | Non | null | Type de cuisine | `"française"` |
| `price_range` | enum | Non | Non | null | `low`, `medium`, `high`, `luxury` | `"medium"` |
| `takeaway` | boolean | Non | Non | null | — | `true` |
| `delivery` | boolean | Non | Non | null | — | `false` |
| `vegan` | boolean | Non | Non | null | Options vegan disponibles | `true` |
| `brunch` | boolean | Non | Non | null | — | `false` |
| `seating_capacity` | integer | Non | Non | null | > 0 | `60` |

---

### `activity_detail`

**Description** : Informations spécifiques aux lieux de type activité.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `place_id` | uuid FK → place.id | Oui | Oui (PK) | — | Le lieu doit avoir un type activité | — |
| `duration_min` | integer | Non | Non | null | > 0, en minutes | `120` |
| `min_age` | integer | Non | Non | null | ≥ 0 | `6` |
| `max_age` | integer | Non | Non | null | > min_age si défini | `99` |
| `price_min` | decimal | Non | Non | null | ≥ 0 | `15.00` |
| `price_max` | decimal | Non | Non | null | ≥ price_min | `45.00` |
| `seasons` | text[] | Non | Non | null | `spring`, `summer`, `autumn`, `winter` | `["spring", "summer"]` |

---

### `address`

**Description** : Adresse postale normalisée avec géolocalisation optionnelle.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `street` | text | Non | Non | null | Max 255 chars | `"12 rue de la Paix"` |
| `city` | text | Oui | Non | — | Max 100 chars | `"Paris"` |
| `postcode` | text | Non | Non | null | Max 20 chars | `"75002"` |
| `region` | text | Non | Non | null | Max 100 chars | `"Île-de-France"` |
| `country` | text | Non | Non | null | Code ISO 3166-1 alpha-2 | `"FR"` |
| `latitude` | decimal(10,7) | Non | Non | null | -90 à 90 | `48.8698` |
| `longitude` | decimal(10,7) | Non | Non | null | -180 à 180 | `2.3311` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `trail`

**Description** : Itinéraire de randonnée ou de balade avec tracé géographique.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `created_by` | uuid FK → user.id | Oui | Non | — | — | — |
| `name` | text | Oui | Non | — | 2-200 chars | `"Sentier des crêtes"` |
| `slug` | text | Oui | Oui | — | Unique global | `"sentier-des-cretes"` |
| `description` | text | Non | Non | null | Max 2000 chars | — |
| `difficulty` | enum | Non | Non | null | `easy`, `moderate`, `hard` | `"moderate"` |
| `distance_km` | decimal | Non | Non | null | > 0 | `12.5` |
| `duration_min` | integer | Non | Non | null | > 0 | `240` |
| `ascent_m` | integer | Non | Non | null | ≥ 0 | `450` |
| `descent_m` | integer | Non | Non | null | ≥ 0 | `450` |
| `loop` | boolean | Non | Non | false | Boucle ou aller simple | `true` |
| `gpx_url` | text | Non | Non | null | URL vers fichier GPX | — |
| `type` | enum `place_type` | Non | Non | null | Sous-type : trail, balade, randonnee, velo | `"randonnee"` |
| `latitude` | decimal(10,7) | Non | Non | null | Point de départ | — |
| `longitude` | decimal(10,7) | Non | Non | null | Point de départ | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Relations** :

- `trail` → 0-N → `poi` (cascade delete)
- `trail` → 0-N → `image`
- `trail` → 0-N → `comment`
- `trail` → 0-N → `favorite`

---

### `poi`

**Description** : Point d'intérêt le long d'un sentier.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `trail_id` | uuid FK → trail.id | Oui | Non | — | — | — |
| `name` | text | Oui | Non | — | 2-100 chars | `"Point de vue panoramique"` |
| `description` | text | Non | Non | null | Max 500 chars | — |
| `latitude` | decimal(10,7) | Non | Non | null | — | — |
| `longitude` | decimal(10,7) | Non | Non | null | — | — |
| `km_marker` | decimal | Non | Non | null | Position sur le sentier en km | `3.2` |

---

### `image`

**Description** : Fichier image uploadé, référençable par plusieurs entités.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `url` | text | Oui | Oui | — | URL ou chemin interne | `"/uploads/images/abc.webp"` |
| `uploaded_by` | uuid FK → user.id | Oui | Non | — | — | — |
| `content_type` | enum | Oui | Non | — | `avatar`, `place_gallery`, `article`, `classified`, `service`, `review`, `event`, `trail`, `other` | `"place_gallery"` |
| `place_id` | uuid FK → place.id | Non | Non | null | — | — |
| `event_id` | uuid FK → event.id | Non | Non | null | — | — |
| `trail_id` | uuid FK → trail.id | Non | Non | null | — | — |
| `caption` | text | Non | Non | null | Max 255 chars | `"Façade de l'hôtel"` |
| `alt_text` | text | Non | Non | null | Texte alternatif accessibilité | `"Façade illuminée la nuit"` |
| `mime_type` | text | Non | Non | null | image/jpeg, image/webp, image/png | `"image/webp"` |
| `file_size_bytes` | integer | Non | Non | null | Max 10 Mo | `245000` |
| `width` | integer | Non | Non | null | > 0 | `1200` |
| `height` | integer | Non | Non | null | > 0 | `800` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Au moins un FK de contexte (place_id, event_id, trail_id) doit être non null, sauf pour content_type `avatar` ou `other`.

---

### `gallery` et `gallery_item`

**`gallery`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `title` | text | Oui | Non | — | 2-100 chars | `"Visite guidée mars 2026"` |
| `description` | text | Non | Non | null | Max 500 chars | — |
| `created_by` | uuid FK → user.id | Oui | Non | — | — | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**`gallery_item`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `gallery_id` | uuid FK → gallery.id | Oui | Non | — | — | — |
| `media_url` | text | Oui | Non | — | URL valide | — |
| `media_type` | enum | Oui | Non | `"image"` | `image`, `video` | `"image"` |
| `caption` | text | Non | Non | null | Max 255 chars | — |
| `sort_order` | integer | Oui | Non | 0 | — | `1` |
| `uploaded_by` | uuid FK → user.id | Non | Non | null | — | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `favorite`

**Description** : Marque-page d'un utilisateur sur un lieu, événement ou sentier.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `place_id` | uuid FK → place.id | Non | Non | null | — | — |
| `event_id` | uuid FK → event.id | Non | Non | null | — | — |
| `trail_id` | uuid FK → trail.id | Non | Non | null | — | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Exactement un FK cible non null. Unique composite `(user_id, place_id)`, `(user_id, event_id)`, `(user_id, trail_id)`.

---

### `article`

**Description** : Article de magazine, rédigé par un auteur, lié à des catégories et des lieux.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `author_id` | uuid FK → user.id | Oui | Non | — | Utilisateur avec rôle `author` | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Les 5 meilleures pizzerias de la ville"` |
| `slug` | text | Oui | Oui | — | Unique global, 5-220 chars | `"5-meilleures-pizzerias"` |
| `summary` | text | Non | Non | null | Max 500 chars | — |
| `cover_image_url` | text | Non | Non | null | URL vers image de couverture | — |
| `status` | enum | Oui | Non | `"draft"` | Voir machine à états | `"published"` |
| `published_at` | timestamp | Non | Non | null | Set quand status → published | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Enum `article_status`** : `draft`, `pending_review`, `published`, `archived`, `rejected`

**Machine à états** :

```
draft          → pending_review  (Auteur soumet)
pending_review → published       (Admin approuve)
pending_review → rejected        (Admin rejette, motif obligatoire)
published      → archived        (Auteur ou Admin)
rejected       → draft           (Auteur corrige)
archived       → draft           (Auteur réactive)
```

---

### `article_content`

**Description** : Contenu riche d'un article, stocké en JSON (structure de blocs éditeur).

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `article_id` | uuid FK → article.id | Oui | Oui | — | 1:1 | — |
| `content_json` | jsonb | Oui | Non | `[]` | Tableau de blocs. Types : heading, paragraph, image, quote, list, code, place_embed, comparison_table | — |
| `language` | text | Oui | Non | `"fr"` | ISO 639-1 | `"fr"` |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(article_id, language)` pour les traductions futures.

---

### `article_category_link` et `article_place_link`

**`article_category_link`** : Liaison N-N entre article et catégorie(s) magazine.

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `article_id` | uuid FK → article.id | Oui | Non | — | — | — |
| `category_id` | uuid FK → category.id | Oui | Non | — | Catégorie de type `magazine` | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

PK composite `(article_id, category_id)`.

**`article_place_link`** : Liaison N-N entre article et lieu(x) mentionnés.

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `article_id` | uuid FK → article.id | Oui | Non | — | — | — |
| `place_id` | uuid FK → place.id | Oui | Non | — | Lieu publié | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

PK composite `(article_id, place_id)`.

---

### `article_place_comparison`

**Description** : Tableau comparatif de lieux intégré dans un article.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `article_id` | uuid FK → article.id | Oui | Non | — | — | — |
| `place_ids` | uuid[] | Oui | Non | — | 2-5 UUIDs de lieux publiés | `["place-1", "place-2"]` |
| `comparison_criteria` | text[] | Oui | Non | — | Attributs ou critères à comparer | `["prix", "wifi", "note"]` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `review`

**Description** : Avis structuré d'un citoyen sur un lieu, avec notation globale et sous-notations.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `place_id` | uuid FK → place.id | Oui | Non | — | Lieu publié | — |
| `author_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `parent_review_id` | uuid FK → review.id | Non | Non | null | Pour les réponses du propriétaire | — |
| `title` | text | Non | Non | null | 3-150 chars | `"Excellent séjour"` |
| `content` | text | Oui | Non | — | 10-2000 chars | — |
| `rating` | decimal(2,1) | Non | Non | null | 0.5 à 5.0, par incréments de 0.5. Null si réponse propriétaire | `4.5` |
| `status` | enum | Oui | Non | `"published"` | `published`, `moderated`, `deleted` | `"published"` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Un citoyen ne peut laisser qu'un seul avis racine (parent_review_id = null) par lieu. Un propriétaire peut répondre (parent_review_id ≠ null, rating = null). `rating` est obligatoire si `parent_review_id` est null.

**Effets** : Après insertion/modification/suppression, recalculer `place.rating_avg` et `place.rating_count`.

---

### `sub_rating`

**Description** : Sous-notation sur un critère spécifique, composant d'un avis.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `review_id` | uuid FK → review.id | Oui | Non | — | Avis racine uniquement | — |
| `criterion` | text | Oui | Non | — | Critère : `service`, `cleanliness`, `value`, `location`, `ambiance` | `"service"` |
| `score` | decimal(2,1) | Oui | Non | — | 0.5 à 5.0 par incréments de 0.5 | `4.0` |

**Contraintes** : Unique composite `(review_id, criterion)`.

---

### `comment`

**Description** : Commentaire sur un article, un événement, un sentier, ou un produit. Support du threading via `parent_comment_id`.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `author_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `parent_comment_id` | uuid FK → comment.id | Non | Non | null | Même cible que le parent | — |
| `target_type` | enum | Oui | Non | — | `article`, `place`, `trail`, `event`, `product` | `"article"` |
| `article_id` | uuid FK → article.id | Non | Non | null | — | — |
| `place_id` | uuid FK → place.id | Non | Non | null | — | — |
| `trail_id` | uuid FK → trail.id | Non | Non | null | — | — |
| `event_id` | uuid FK → event.id | Non | Non | null | — | — |
| `product_id` | uuid FK → product.id | Non | Non | null | — | — |
| `content` | text | Oui | Non | — | 1-1000 chars | — |
| `status` | enum | Oui | Non | `"published"` | `published`, `moderated`, `deleted` | `"published"` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Exactement un FK cible non null, cohérent avec `target_type`. Le `parent_comment_id` doit référencer un commentaire avec la même cible. Profondeur de threading max : 3 niveaux.

---

### `forum_thread`

**Description** : Sujet de forum dans une catégorie.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `category_id` | uuid FK → category.id | Oui | Non | — | Catégorie de type `forum` | — |
| `author_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Comment restaurer un mur en pierre ?"` |
| `slug` | text | Oui | Non | — | Unique dans la catégorie | `"restaurer-mur-pierre"` |
| `is_pinned` | boolean | Oui | Non | false | Admin only | `false` |
| `is_locked` | boolean | Oui | Non | false | Empêche nouvelles réponses | `false` |
| `status` | enum | Oui | Non | `"published"` | `published`, `closed`, `moderated`, `deleted` | `"published"` |
| `last_post_at` | timestamp | Non | Non | null | Mis à jour à chaque nouveau post | — |
| `post_count` | integer | Oui | Non | 0 | Compteur dénormalisé | `12` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(category_id, slug)`.

---

### `forum_post`

**Description** : Message dans un fil de forum. Le premier post est le contenu initial du sujet.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `thread_id` | uuid FK → forum_thread.id | Oui | Non | — | — | — |
| `author_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `parent_post_id` | uuid FK → forum_post.id | Non | Non | null | Citation/réponse à un post spécifique | — |
| `content` | text | Oui | Non | — | 1-2000 chars | — |
| `status` | enum | Oui | Non | `"published"` | `published`, `moderated`, `deleted` | `"published"` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Effets** : Après insertion, mettre à jour `forum_thread.last_post_at` et `forum_thread.post_count`.

---

### `classified`

**Description** : Petite annonce sur la place du marché solidaire.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `category_id` | uuid FK → category.id | Non | Non | null | Catégorie type `classified` | — |
| `seller_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Lot d'outils de jardinage"` |
| `description` | text | Oui | Non | — | 10-2000 chars | — |
| `price` | decimal | Non | Non | null | ≥ 0. 0 = gratuit | `25.00` |
| `condition` | enum | Non | Non | null | `new`, `used`, `damaged` | `"used"` |
| `location` | text | Non | Non | null | Max 100 chars, localisation approximative | `"Paris 11e"` |
| `status` | enum | Oui | Non | `"pending_review"` | `pending_review`, `active`, `sold`, `expired`, `archived`, `rejected` | `"active"` |
| `expires_at` | timestamp | Non | Non | now() + 30 jours | Date d'expiration auto | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

---

### `local_service`

**Description** : Service proposé par un citoyen ou professionnel.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `category_id` | uuid FK → category.id | Non | Non | null | Catégorie type `service` | — |
| `provider_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `place_id` | uuid FK → place.id | Non | Non | null | Lieu professionnel associé | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Plomberie d'urgence"` |
| `description` | text | Oui | Non | — | 10-2000 chars | — |
| `base_price` | decimal | Non | Non | null | ≥ 0 | `50.00` |
| `price_type` | text | Non | Non | null | `hourly`, `fixed`, `free`, `negotiable` | `"hourly"` |
| `currency` | text | Non | Non | `"EUR"` | ISO 4217 | `"EUR"` |
| `duration_minutes` | integer | Non | Non | null | > 0 | `60` |
| `is_mobile` | boolean | Non | Non | false | Se déplace chez le client | `true` |
| `max_participants` | integer | Non | Non | null | Pour les ateliers/cours | `10` |
| `booking_advance_hours` | integer | Non | Non | null | Délai min de réservation en heures | `24` |
| `cancellation_hours` | integer | Non | Non | null | Délai d'annulation gratuite en heures | `48` |
| `is_active` | boolean | Oui | Non | true | — | `true` |
| `status` | enum | Oui | Non | `"pending_review"` | `active`, `pending_review`, `suspended`, `archived` | `"active"` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

---

### `event`

**Description** : Événement communautaire planifié.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `created_by` | uuid FK → user.id | Oui | Non | — | — | — |
| `category_id` | uuid FK → category.id | Non | Non | null | — | — |
| `place_id` | uuid FK → place.id | Non | Non | null | Lieu associé | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Atelier réparation vélos"` |
| `slug` | text | Oui | Oui | — | Unique global | `"atelier-reparation-velos-mars"` |
| `description` | text | Non | Non | null | Max 2000 chars | — |
| `type` | enum | Non | Non | null | `culture`, `sport`, `marche`, `local`, `asso`, `education`, `volunteer` | `"asso"` |
| `start_at` | timestamp | Oui | Non | — | Futur ou passé récent | — |
| `end_at` | timestamp | Non | Non | null | > start_at | — |
| `max_participants` | integer | Non | Non | null | > 0 | `30` |
| `registration_deadline` | timestamp | Non | Non | null | ≤ start_at | — |
| `is_paid` | boolean | Oui | Non | false | — | `false` |
| `price` | decimal | Non | Non | null | Obligatoire si is_paid = true, > 0 | `5.00` |
| `recurrence_rule` | text | Non | Non | null | RRULE format | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `event_registration`

**Description** : Inscription d'un utilisateur à un événement.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `event_id` | uuid FK → event.id | Oui | Non | — | — | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `status` | text | Oui | Non | `"registered"` | `registered`, `cancelled`, `attended`, `no_show` | `"registered"` |
| `amount_paid` | decimal | Non | Non | null | Si événement payant | `5.00` |
| `payment_status` | text | Non | Non | null | `pending`, `completed`, `refunded` | `"completed"` |
| `payment_reference` | text | Non | Non | null | ID de transaction | — |
| `registered_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(event_id, user_id)`. Vérifier que le nombre d'inscriptions `registered` < `event.max_participants`.

---

### `group` et `group_member`

**`group`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `name` | text | Oui | Non | — | 3-100 chars | `"Jardiniers du quartier"` |
| `slug` | text | Oui | Oui | — | Unique | `"jardiniers-quartier"` |
| `description` | text | Non | Non | null | Max 500 chars | — |
| `created_by` | uuid FK → user.id | Oui | Non | — | — | — |
| `is_public` | boolean | Oui | Non | true | Visible publiquement | `true` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**`group_member`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `group_id` | uuid FK → group.id | Oui | Non | — | — | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `role` | text | Oui | Non | `"member"` | `admin`, `moderator`, `member` | `"member"` |
| `joined_at` | timestamp | Oui | Non | now() | — | — |

PK composite `(group_id, user_id)`.

---

### `product`

**Description** : Produit local référencé sur la plateforme.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `name` | text | Oui | Non | — | 3-200 chars | `"Miel de lavande"` |
| `description` | text | Non | Non | null | Max 1000 chars | — |
| `category` | text | Non | Non | null | Classification libre | `"Alimentation"` |
| `producer_id` | uuid FK → user.id | Non | Non | null | — | — |
| `is_local` | boolean | Oui | Non | true | — | `true` |
| `season_start` | integer | Non | Non | null | Mois (1-12) | `6` |
| `season_end` | integer | Non | Non | null | Mois (1-12) | `9` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `professional`

**Description** : Profil professionnel associé à un lieu (artisan, professionnel de santé, etc.).

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `place_id` | uuid FK → place.id | Oui | Oui (PK) | — | — | — |
| `siret` | text | Non | Non | null | Format SIRET français (14 chiffres) | `"12345678901234"` |
| `sector` | text | Non | Non | null | Secteur d'activité | `"Plomberie"` |
| `emergency_support` | boolean | Non | Non | false | Disponible en urgence | `true` |
| `emergency_phone` | text | Non | Non | null | Si emergency_support = true | `"+33600000000"` |

---

### `conversation`, `conversation_participant`, `message`

**`conversation`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `type` | enum | Oui | Non | `"direct"` | `direct`, `group`, `classified_contact`, `mediation` | `"direct"` |
| `subject` | text | Non | Non | null | Max 200 chars (pour group/mediation) | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `last_message_at` | timestamp | Non | Non | null | Mis à jour à chaque message | — |

**`conversation_participant`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `conversation_id` | uuid FK → conversation.id | Oui | Non | — | — | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `role` | text | Oui | Non | `"participant"` | `participant`, `mediator`, `observer` | `"participant"` |
| `joined_at` | timestamp | Oui | Non | now() | — | — |
| `last_read_at` | timestamp | Non | Non | null | Dernier message lu | — |

PK unique composite `(conversation_id, user_id)`.

**Contraintes** : Une conversation `direct` a exactement 2 participants. Une conversation `direct` est unique par paire d'utilisateurs (pas de doublon). Une conversation `mediation` a au moins 3 participants (2 parties + 1 médiateur).

**`message`** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `conversation_id` | uuid FK → conversation.id | Oui | Non | — | — | — |
| `sender_id` | uuid FK → user.id | Oui | Non | — | Doit être participant de la conversation | — |
| `content` | text | Oui | Non | — | 1-2000 chars | — |
| `sent_at` | timestamp | Oui | Non | now() | — | — |

**Effets** : Après envoi, mettre à jour `conversation.last_message_at`. Émettre notification en temps réel aux autres participants.

---

### `notification`

**Description** : Alerte envoyée à un utilisateur.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `type` | enum | Oui | Non | — | `new_message`, `new_review`, `new_comment`, `place_approved`, `place_rejected`, `booking_confirmed`, `booking_cancelled`, `transaction_completed`, `mediation_update`, `volunteer_update`, `admin_alert` | — |
| `title` | text | Oui | Non | — | Max 100 chars | `"Nouvel avis reçu"` |
| `message` | text | Non | Non | null | Max 500 chars | — |
| `target_url` | text | Non | Non | null | Lien vers la ressource | `"/fr/places/hotel-du-parc"` |
| `is_read` | boolean | Oui | Non | false | — | `false` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `wallet`

**Description** : Portefeuille numérique d'un utilisateur. Créé automatiquement à l'inscription.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `user_id` | uuid FK → user.id | Oui | Oui | — | 1 portefeuille par utilisateur | — |
| `balance` | decimal(12,2) | Oui | Non | `0.00` | ≥ 0. Jamais négatif (vérifier avant débit) | `125.50` |
| `currency` | text | Oui | Non | `"EUR"` | ISO 4217 | `"EUR"` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Invariants** : Le solde ne peut jamais être négatif. Toute modification de solde doit être tracée par une `transaction`. Les opérations de crédit/débit doivent être atomiques (transaction DB).

---

### `transaction`

**Description** : Opération financière affectant un ou deux portefeuilles.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `sender_wallet_id` | uuid FK → wallet.id | Non | Non | null | Null si crédit externe | — |
| `receiver_wallet_id` | uuid FK → wallet.id | Non | Non | null | Null si débit/commission | — |
| `amount` | decimal(12,2) | Oui | Non | — | > 0 | `50.00` |
| `type` | enum | Oui | Non | — | `external_credit`, `p2p_transfer`, `service_payment`, `refund`, `commission` | `"p2p_transfer"` |
| `status` | enum | Oui | Non | `"pending"` | `pending`, `completed`, `failed`, `cancelled` | `"completed"` |
| `description` | text | Non | Non | null | Max 255 chars | `"Paiement réservation plomberie"` |
| `related_entity_type` | text | Non | Non | null | `booking`, `donation`, etc. | `"booking"` |
| `related_entity_id` | uuid | Non | Non | null | ID de l'entité liée | — |
| `idempotency_key` | text | Non | Oui | null | Clé d'idempotence pour prévenir les doublons | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Invariants** : Pour `p2p_transfer`, sender et receiver doivent être différents et le sender doit avoir un solde suffisant. Pour `external_credit`, seul `receiver_wallet_id` est renseigné. Pour `commission`, seul `sender_wallet_id` est renseigné (débit). Toute transaction `completed` doit avoir effectué les mouvements de solde correspondants de manière atomique.

---

### `system_commission`

**Description** : Paramétrage de la commission plateforme sur les transactions.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `name` | text | Oui | Oui | — | — | `"booking_commission"` |
| `percentage` | decimal(5,2) | Oui | Non | — | 0-100 | `5.00` |
| `flat_fee` | decimal(8,2) | Oui | Non | `0.00` | ≥ 0 | `0.50` |
| `applies_to` | text | Oui | Non | — | `booking`, `service_payment`, `classified_payment` | `"booking"` |
| `is_active` | boolean | Oui | Non | true | — | `true` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Formule** : commission = (montant × percentage / 100) + flat_fee.

---

### `service_availability`

**Description** : Créneau de disponibilité pour un service local.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `service_id` | uuid FK → local_service.id | Oui | Non | — | — | — |
| `day_of_week` | integer | Oui | Non | — | 0 (dimanche) à 6 (samedi) | `1` |
| `start_time` | time | Oui | Non | — | Format HH:MM | `"09:00"` |
| `end_time` | time | Oui | Non | — | > start_time | `"17:00"` |
| `is_available` | boolean | Oui | Non | true | — | `true` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(service_id, day_of_week, start_time)`. Pas de chevauchement de créneaux pour un même service et jour.

---

### `booking`

**Description** : Réservation d'un créneau de service ou d'hébergement.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `customer_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `provider_id` | uuid FK → user.id | Oui | Non | — | Propriétaire du service | — |
| `service_id` | uuid FK → local_service.id | Oui | Non | — | — | — |
| `booking_date` | date | Oui | Non | — | Date de la réservation | `"2026-03-15"` |
| `booking_time` | time | Oui | Non | — | Heure de début | `"10:00"` |
| `duration_minutes` | integer | Oui | Non | — | > 0 | `60` |
| `total_price` | decimal(12,2) | Non | Non | null | Calculé | `50.00` |
| `status` | enum | Oui | Non | `"pending"` | `pending`, `confirmed`, `cancelled_by_client`, `cancelled_by_provider`, `completed`, `no_show` | `"confirmed"` |
| `customer_message` | text | Non | Non | null | Max 500 chars | `"Fuite sous l'évier"` |
| `provider_response` | text | Non | Non | null | Max 500 chars | — |
| `payment_transaction_id` | uuid FK → transaction.id | Non | Non | null | Transaction de paiement associée | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Machine à états** :

```
pending    → confirmed              (Prestataire confirme)
pending    → cancelled_by_client    (Client annule)
pending    → cancelled_by_provider  (Prestataire refuse)
confirmed  → completed              (Service effectué)
confirmed  → cancelled_by_client    (Client annule, politique de remboursement)
confirmed  → cancelled_by_provider  (Prestataire annule, remboursement automatique)
confirmed  → no_show                (Client absent)
```

---

### `mediation_case`

**Description** : Dossier de résolution de conflit entre deux ou plusieurs parties. Le conflit peut concerner un avis, un commentaire, une réservation, une annonce, etc.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `reporter_id` | uuid FK → user.id | Oui | Non | — | Citoyen ayant signalé | — |
| `reported_user_id` | uuid FK → user.id | Non | Non | null | Utilisateur mis en cause | — |
| `mediator_id` | uuid FK → user.id | Non | Non | null | Médiateur assigné (rôle `mediator`) | — |
| `related_entity_type` | text | Non | Non | null | `review`, `comment`, `forum_post`, `classified`, `booking`, `message` | `"review"` |
| `related_entity_id` | uuid | Non | Non | null | — | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Litige sur avis diffamatoire"` |
| `description` | text | Oui | Non | — | 10-2000 chars | — |
| `category` | text | Non | Non | null | `defamation`, `harassment`, `scam`, `quality_dispute`, `payment_dispute`, `discrimination`, `other` | `"defamation"` |
| `priority` | enum | Oui | Non | `"normal"` | `low`, `normal`, `high`, `urgent` | `"normal"` |
| `status` | enum | Oui | Non | `"opened"` | Voir machine à états | `"opened"` |
| `resolution` | text | Non | Non | null | Résumé de la résolution | — |
| `opened_at` | timestamp | Oui | Non | now() | — | — |
| `assigned_at` | timestamp | Non | Non | null | Quand un médiateur est assigné | — |
| `resolved_at` | timestamp | Non | Non | null | Quand le cas est résolu | — |
| `closed_at` | timestamp | Non | Non | null | Quand le cas est clôturé | — |

**Machine à états** :

```
opened    → assigned     (Admin/système assigne un médiateur)
assigned  → in_progress  (Médiateur commence les sessions)
in_progress → resolved   (Accord trouvé)
in_progress → failed     (Pas d'accord, escalade possible)
resolved  → closed       (Après période de confirmation)
failed    → closed       (Admin clôture)
opened    → closed       (Reporter retire sa plainte)
```

**Enum `mediation_status`** : `opened`, `assigned`, `in_progress`, `resolved`, `failed`, `closed`

---

### `mediation_session`

**Description** : Session de médiation planifiée entre les parties.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `case_id` | uuid FK → mediation_case.id | Oui | Non | — | — | — |
| `scheduled_at` | timestamp | Oui | Non | — | Futur | `"2026-03-20T14:00:00Z"` |
| `duration_minutes` | integer | Oui | Non | 60 | 15-180 | `60` |
| `type` | text | Oui | Non | `"video"` | `text`, `video`, `in_person` | `"video"` |
| `notes` | text | Non | Non | null | Notes du médiateur (confidentielles) | — |
| `outcome` | text | Non | Non | null | Résultat de la session | — |
| `status` | enum | Oui | Non | `"scheduled"` | `scheduled`, `in_progress`, `completed`, `cancelled` | `"scheduled"` |
| `conversation_id` | uuid FK → conversation.id | Non | Non | null | Conversation de médiation associée | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `mediation_agreement`

**Description** : Accord de résolution signé par les parties.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `case_id` | uuid FK → mediation_case.id | Oui | Oui | — | 1 accord par cas | — |
| `content` | text | Oui | Non | — | Termes de l'accord, 50-5000 chars | — |
| `actions` | jsonb | Non | Non | null | Actions correctives à entreprendre | `[{"actor": "user-1", "action": "retirer l'avis", "deadline": "2026-04-01"}]` |
| `signed_by_reporter` | boolean | Oui | Non | false | — | `true` |
| `signed_by_reported` | boolean | Oui | Non | false | — | `true` |
| `signed_by_mediator` | boolean | Oui | Non | false | — | `true` |
| `signed_at` | timestamp | Non | Non | null | Quand toutes les parties ont signé | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Invariant** : L'accord est considéré valide uniquement quand les 3 signatures sont true.

---

### `education_module`

**Description** : Parcours pédagogique structuré (cours civique, atelier pratique, guide).

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `educator_id` | uuid FK → user.id | Oui | Non | — | Rôle `educator` | — |
| `category_id` | uuid FK → category.id | Non | Non | null | Catégorie type `education` | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Les bases de la médiation communautaire"` |
| `slug` | text | Oui | Oui | — | Unique global | `"bases-mediation-communautaire"` |
| `description` | text | Non | Non | null | Max 1000 chars | — |
| `cover_image_url` | text | Non | Non | null | — | — |
| `difficulty` | enum | Oui | Non | `"beginner"` | `beginner`, `intermediate`, `advanced` | `"beginner"` |
| `estimated_duration_hours` | decimal | Non | Non | null | > 0 | `4.5` |
| `is_free` | boolean | Oui | Non | true | — | `true` |
| `price` | decimal | Non | Non | null | Si is_free = false, > 0 | — |
| `lesson_count` | integer | Oui | Non | 0 | Dénormalisé, mis à jour quand leçons ajoutées/supprimées | `6` |
| `enrollment_count` | integer | Oui | Non | 0 | Dénormalisé | `42` |
| `status` | enum | Oui | Non | `"draft"` | `draft`, `published`, `archived` | `"published"` |
| `published_at` | timestamp | Non | Non | null | — | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

---

### `education_lesson`

**Description** : Leçon individuelle au sein d'un module. Ordonnée par `sort_order`.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `module_id` | uuid FK → education_module.id | Oui | Non | — | — | — |
| `title` | text | Oui | Non | — | 3-200 chars | `"Comprendre les émotions"` |
| `slug` | text | Oui | Non | — | Unique dans le module | `"comprendre-emotions"` |
| `content_json` | jsonb | Oui | Non | `[]` | Blocs de contenu : text, image, video, exercise, quiz | — |
| `type` | enum | Oui | Non | `"text"` | `text`, `video`, `exercise`, `quiz` | `"text"` |
| `sort_order` | integer | Oui | Non | 0 | Ordre dans le module | `1` |
| `estimated_minutes` | integer | Non | Non | null | > 0 | `30` |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(module_id, slug)` et `(module_id, sort_order)`.

---

### `education_enrollment`

**Description** : Inscription d'un citoyen à un module d'éducation.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `module_id` | uuid FK → education_module.id | Oui | Non | — | Module publié | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `status` | enum | Oui | Non | `"active"` | `active`, `completed`, `dropped` | `"active"` |
| `progress_percent` | decimal(5,2) | Oui | Non | `0.00` | 0-100, calculé depuis education_progress | `66.67` |
| `completed_at` | timestamp | Non | Non | null | Quand progress_percent atteint 100 | — |
| `payment_transaction_id` | uuid FK → transaction.id | Non | Non | null | Si module payant | — |
| `enrolled_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(module_id, user_id)`.

---

### `education_progress`

**Description** : Suivi de progression par leçon pour un utilisateur inscrit.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `enrollment_id` | uuid FK → education_enrollment.id | Oui | Non | — | — | — |
| `lesson_id` | uuid FK → education_lesson.id | Oui | Non | — | — | — |
| `is_completed` | boolean | Oui | Non | false | — | `true` |
| `score` | decimal | Non | Non | null | Si quiz/exercise, 0-100 | `85.0` |
| `time_spent_seconds` | integer | Non | Non | null | Temps passé en secondes | `1800` |
| `completed_at` | timestamp | Non | Non | null | Quand is_completed → true | — |
| `started_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(enrollment_id, lesson_id)`.

**Effets** : Quand is_completed → true, recalculer `enrollment.progress_percent = (leçons complétées / total leçons du module) × 100`. Si 100%, mettre à jour `enrollment.status → completed` et `enrollment.completed_at`.

---

### `volunteer_project`

**Description** : Projet bénévole communautaire (réhabilitation d'espace, atelier, service d'entraide).

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `coordinator_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `category_id` | uuid FK → category.id | Non | Non | null | Catégorie type `project` | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Restauration du jardin communautaire"` |
| `slug` | text | Oui | Oui | — | Unique | `"restauration-jardin-communautaire"` |
| `description` | text | Oui | Non | — | 20-5000 chars | — |
| `location` | text | Non | Non | null | — | `"Parc des Buttes-Chaumont"` |
| `latitude` | decimal(10,7) | Non | Non | null | — | — |
| `longitude` | decimal(10,7) | Non | Non | null | — | — |
| `start_date` | date | Non | Non | null | — | `"2026-04-01"` |
| `end_date` | date | Non | Non | null | ≥ start_date | `"2026-06-30"` |
| `volunteer_goal` | integer | Non | Non | null | Nombre de bénévoles recherchés | `20` |
| `volunteer_count` | integer | Oui | Non | 0 | Dénormalisé | `8` |
| `funding_goal` | decimal(12,2) | Non | Non | null | Si micro-financement associé | `5000.00` |
| `funding_raised` | decimal(12,2) | Oui | Non | `0.00` | Dénormalisé | `1200.00` |
| `status` | enum | Oui | Non | `"draft"` | `draft`, `recruiting`, `in_progress`, `completed`, `cancelled` | `"recruiting"` |
| `impact_summary` | text | Non | Non | null | Résumé de l'impact post-projet | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

---

### `volunteer_task`

**Description** : Tâche atomique au sein d'un projet bénévole.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `project_id` | uuid FK → volunteer_project.id | Oui | Non | — | — | — |
| `title` | text | Oui | Non | — | 3-200 chars | `"Désherber les plates-bandes"` |
| `description` | text | Non | Non | null | Max 1000 chars | — |
| `required_skills` | text[] | Non | Non | null | — | `["jardinage", "port de charges"]` |
| `max_volunteers` | integer | Non | Non | null | > 0 | `5` |
| `current_volunteers` | integer | Oui | Non | 0 | Dénormalisé | `3` |
| `scheduled_date` | date | Non | Non | null | — | `"2026-04-15"` |
| `estimated_hours` | decimal | Non | Non | null | > 0 | `3.0` |
| `status` | enum | Oui | Non | `"open"` | `open`, `filled`, `in_progress`, `completed`, `cancelled` | `"open"` |
| `sort_order` | integer | Oui | Non | 0 | — | `1` |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

### `volunteer_participation`

**Description** : Engagement d'un bénévole sur une tâche.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `task_id` | uuid FK → volunteer_task.id | Oui | Non | — | — | — |
| `user_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `status` | enum | Oui | Non | `"signed_up"` | `signed_up`, `confirmed`, `completed`, `no_show`, `cancelled` | `"signed_up"` |
| `hours_logged` | decimal | Non | Non | null | ≥ 0, renseigné après complétion | `3.0` |
| `feedback` | text | Non | Non | null | Feedback du bénévole, max 500 chars | — |
| `signed_up_at` | timestamp | Oui | Non | now() | — | — |
| `completed_at` | timestamp | Non | Non | null | — | — |

**Contraintes** : Unique composite `(task_id, user_id)`. Vérifier que `current_volunteers < max_volunteers` avant inscription.

**Effets** : Après inscription, incrémenter `volunteer_task.current_volunteers` et `volunteer_project.volunteer_count`. Après complétion, créer/mettre à jour un `impact_metric`.

---

### `funding_campaign`

**Description** : Campagne de micro-financement pour un projet communautaire.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `creator_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `project_id` | uuid FK → volunteer_project.id | Non | Non | null | Projet bénévole associé | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Financer le matériel de jardinage"` |
| `slug` | text | Oui | Oui | — | Unique | `"financer-materiel-jardinage"` |
| `description` | text | Oui | Non | — | 20-3000 chars | — |
| `goal_amount` | decimal(12,2) | Oui | Non | — | > 0 | `5000.00` |
| `raised_amount` | decimal(12,2) | Oui | Non | `0.00` | Dénormalisé, mis à jour à chaque don | `1200.00` |
| `donor_count` | integer | Oui | Non | 0 | Dénormalisé | `15` |
| `currency` | text | Oui | Non | `"EUR"` | ISO 4217 | `"EUR"` |
| `deadline` | date | Oui | Non | — | Futur | `"2026-05-31"` |
| `status` | enum | Oui | Non | `"active"` | `draft`, `active`, `funded`, `expired`, `cancelled` | `"active"` |
| `funded_at` | timestamp | Non | Non | null | Quand raised_amount ≥ goal_amount | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |
| `updated_at` | timestamp | Oui | Non | now() | — | — |

**Machine à états** :

```
draft     → active       (Créateur publie)
active    → funded       (raised_amount ≥ goal_amount)
active    → expired      (deadline passée sans atteindre l'objectif)
active    → cancelled    (Créateur annule, remboursement des dons)
funded    → closed       (Fonds décaissés au projet)
```

---

### `donation`

**Description** : Don individuel à une campagne de micro-financement.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `campaign_id` | uuid FK → funding_campaign.id | Oui | Non | — | Campagne active | — |
| `donor_id` | uuid FK → user.id | Oui | Non | — | — | — |
| `amount` | decimal(12,2) | Oui | Non | — | > 0 | `25.00` |
| `is_anonymous` | boolean | Oui | Non | false | Le donateur souhaite rester anonyme | `false` |
| `message` | text | Non | Non | null | Max 255 chars | `"Courage pour le projet !"` |
| `transaction_id` | uuid FK → transaction.id | Oui | Non | — | Transaction de paiement | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

**Effets** : Après création, mettre à jour `funding_campaign.raised_amount += amount` et `funding_campaign.donor_count += 1`. Si `raised_amount ≥ goal_amount`, passer le statut de la campagne à `funded`.

---

### `impact_metric`

**Description** : Indicateur mesurable de l'impact positif des actions sur la plateforme.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `type` | enum | Oui | Non | — | `projects_completed`, `volunteer_hours`, `funds_raised`, `mediations_resolved`, `lessons_completed`, `active_citizens`, `resources_shared` | `"volunteer_hours"` |
| `value` | decimal | Oui | Non | — | ≥ 0 | `1250.5` |
| `period_start` | date | Oui | Non | — | — | `"2026-01-01"` |
| `period_end` | date | Oui | Non | — | ≥ period_start | `"2026-03-31"` |
| `scope` | text | Non | Non | `"global"` | `global`, `city`, `region`, identifiant géographique | `"global"` |
| `metadata` | jsonb | Non | Non | null | Détails supplémentaires | `{"breakdown": {"jardinage": 400, "construction": 850}}` |
| `computed_at` | timestamp | Oui | Non | now() | — | — |

**Contraintes** : Unique composite `(type, period_start, period_end, scope)`.

---

### `transparency_report`

**Description** : Rapport de transparence publié périodiquement, agrégant les métriques d'impact.

**Champs** :

| Nom | Type | Obligatoire | Unique | Défaut | Validation | Exemple |
|---|---|---|---|---|---|---|
| `id` | uuid | Oui | Oui | gen_random_uuid() | — | — |
| `title` | text | Oui | Non | — | 5-200 chars | `"Rapport d'impact T1 2026"` |
| `slug` | text | Oui | Oui | — | Unique | `"rapport-impact-t1-2026"` |
| `content_json` | jsonb | Oui | Non | — | Structure du rapport : sections, graphiques, métriques | — |
| `period_start` | date | Oui | Non | — | — | `"2026-01-01"` |
| `period_end` | date | Oui | Non | — | — | `"2026-03-31"` |
| `metric_ids` | uuid[] | Non | Non | null | Métriques incluses | — |
| `published_by` | uuid FK → user.id | Oui | Non | — | Admin | — |
| `status` | enum | Oui | Non | `"draft"` | `draft`, `published` | `"published"` |
| `published_at` | timestamp | Non | Non | null | — | — |
| `created_at` | timestamp | Oui | Non | now() | — | — |

---

## 1.3 Relations globales

```
user 1──N session
user 1──N account
user 1──1 profile
user 1──N user_role
user 1──N member ──N organization
user 1──N invitation
user 1──N place (as owner)
user 1──N article (as author)
user 1──N review (as author)
user 1──N comment (as author)
user 1──N forum_thread (as author)
user 1──N forum_post (as author)
user 1──N classified (as seller)
user 1──N local_service (as provider)
user 1──N event (as organizer)
user 1──N event_registration
user 1──N group (as creator)
user 1──N group_member
user 1──N image (as uploader)
user 1──N gallery (as creator)
user 1──N favorite
user 1──N conversation_participant
user 1──N message (as sender)
user 1──N notification (as recipient)
user 1──1 wallet
user 1──N mediation_case (as reporter)
user 1──N mediation_case (as mediator)
user 1──N education_module (as educator)
user 1──N education_enrollment
user 1──N volunteer_project (as coordinator)
user 1──N volunteer_participation
user 1──N funding_campaign (as creator)
user 1──N donation (as donor)
user 1──N product (as producer)
user 1──N trail (as creator)

category 0──N category (self-ref parent)
category 1──N place
category 0──N article_category_link
category 0──N forum_thread
category 0──N classified
category 0──N local_service
category 0──N education_module
category 0──N volunteer_project
category 0──N event

place 1──0..1 accommodation_detail
place 1──0..1 gastronomy_detail
place 1──0..1 activity_detail
place 1──0..1 professional
place 1──N place_translation
place 1──N place_attribute_value
place N──N tag (via place_tag)
place 1──N review
place 1──N image
place 1──N comment (target_type=place)
place 1──N article_place_link
place 1──N service_availability (indirect via local_service)
place 1──N event
place 1──N local_service
place 1──N favorite

address 1──0..1 place

attribute_definition 1──N place_attribute_value

article 1──1 article_content
article N──N category (via article_category_link)
article N──N place (via article_place_link)
article 1──N article_place_comparison
article 1──N comment (target_type=article)

review 1──N sub_rating
review 1──N review (self-ref parent for replies)

forum_thread 1──N forum_post

trail 1──N poi
trail 1──N image
trail 1──N comment (target_type=trail)
trail 1──N favorite

event 1──N event_registration
event 1──N image
event 1──N comment (target_type=event)
event 1──N favorite

group 1──N group_member

product 1──N comment (target_type=product)

conversation 1──N conversation_participant
conversation 1──N message

wallet 1──N transaction (as sender)
wallet 1──N transaction (as receiver)

local_service 1──N service_availability
local_service 1──N booking

booking 0──1 transaction (payment)

mediation_case 1──N mediation_session
mediation_case 1──0..1 mediation_agreement
mediation_case 0──1 conversation (type=mediation)

education_module 1──N education_lesson
education_module 1──N education_enrollment
education_enrollment 1──N education_progress
education_progress N──1 education_lesson

volunteer_project 1──N volunteer_task
volunteer_project 0──1 funding_campaign
volunteer_task 1──N volunteer_participation

funding_campaign 1──N donation
donation 1──1 transaction
```

---

# 2. PERMISSIONS & SÉCURITÉ

## 2.1 Rôles & acteurs

### Définition des rôles

| Rôle | Code | Attribution | Cumulable | Description |
|---|---|---|---|---|
| **Anonyme** | — | Automatique (non authentifié) | — | Consultation publique uniquement |
| **Citoyen** | `citizen` | Automatique (inscription) | Base | Rôle par défaut de tout utilisateur authentifié |
| **Propriétaire** | `owner` | Attribution admin ou auto-attribution contrôlée | Oui | Gère des lieux et leurs services |
| **Auteur** | `author` | Attribution admin | Oui | Publie des articles dans le magazine |
| **Médiateur** | `mediator` | Attribution admin (certification requise) | Oui | Anime les cas de médiation |
| **Éducateur** | `educator` | Attribution admin | Oui | Crée des modules d'éducation |
| **Modérateur** | `moderator` | Attribution admin | Oui | Modère le contenu communautaire |
| **Administrateur** | `admin` | Attribution super-admin | Oui | Gestion complète de la plateforme |

### Hiérarchie implicite

- `admin` hérite de tous les droits de `moderator`.
- `moderator` a des droits de modération transverses (pas de droits de création spécifiques comme `author` ou `educator`).
- Tous les rôles spécialisés (`owner`, `author`, `mediator`, `educator`) incluent implicitement `citizen`.
- Le rôle `citizen` est **toujours** présent dans `user_role` pour tout utilisateur actif.

### Système existant (Better Auth)

Better Auth gère déjà `admin`, `user`, `owner`, `member` au niveau `organization`. Les rôles Concordia sont complémentaires et stockés dans `user_role`. La correspondance :

- Better Auth `user` = Concordia `citizen`
- Better Auth `admin` = Concordia `admin`
- Les rôles Better Auth `organization` (`owner`, `member`, `admin`) sont utilisés pour la gestion des organisations ; les rôles Concordia s'appliquent aux fonctionnalités métier.

## 2.2 Matrice d'autorisations CRUD+

> Légende : **C** = Create, **R** = Read, **U** = Update, **D** = Delete, **L** = List, **M** = Moderate
>
> ✅ = Autorisé | ⚡ = Autorisé sur ses propres ressources (ownership) | 🔒 = Admin uniquement | ❌ = Interdit | 👁️ = Lecture publique uniquement | 📋 = Listing filtré

### Domaine : Utilisateurs & Profils

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `profile` | C | ❌ | ⚡ auto | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ |
| `profile` | R | 👁️ public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `profile` | U | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ |
| `profile` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ |
| `user_role` | C | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `user_role` | R | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `user_role` | D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |

### Domaine : Taxonomie

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `category` | C | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `category` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `category` | U | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `category` | D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `attribute_definition` | C/U/D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `attribute_definition` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tag` | C | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | 🔒 |
| `tag` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tag` | U/D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |

### Domaine : Lieux

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `place` | C | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `place` | R | 👁️ published | ✅ published | ✅ published + ⚡ all | ✅ published | ✅ published | ✅ published | ✅ all | ✅ all |
| `place` | L | 👁️ published | ✅ published | ✅ published + ⚡ own | ✅ published | ✅ published | ✅ published | ✅ all | ✅ all |
| `place` | U | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `place` | D | ❌ | ❌ | ⚡ (archive) | ❌ | ❌ | ❌ | ❌ | ✅ |
| `place` | M (approve/reject) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `place_translation` | C/U/D | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `place_attribute_value` | C/U/D | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `accommodation_detail` | C/U/D | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `gastronomy_detail` | C/U/D | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `activity_detail` | C/U/D | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `address` | C/U | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `trail` | C | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `trail` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `trail` | U/D | ❌ | ❌ | ⚡ | ⚡ | ❌ | ❌ | ❌ | ✅ |
| `poi` | C/U/D | ❌ | ❌ | ⚡ trail | ⚡ trail | ❌ | ❌ | ❌ | ✅ |

### Domaine : Contenu

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `article` | C | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `article` | R | 👁️ published | ✅ published | ✅ published | ✅ published + ⚡ all | ✅ published | ✅ published | ✅ all | ✅ all |
| `article` | U | ❌ | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ✅ |
| `article` | D | ❌ | ❌ | ❌ | ⚡ (archive) | ❌ | ❌ | ✅ | ✅ |
| `article` | M (approve/reject) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `article_content` | C/U | ❌ | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ✅ |

### Domaine : Interactions

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `review` | C | ❌ | ✅ | ✅ (reply only) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `review` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `review` | U | ❌ | ⚡ (15 min) | ⚡ reply | ⚡ (15 min) | ⚡ (15 min) | ⚡ (15 min) | ❌ | ✅ |
| `review` | D | ❌ | ⚡ | ❌ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `comment` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `comment` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `comment` | U | ❌ | ⚡ (15 min) | ⚡ (15 min) | ⚡ (15 min) | ⚡ (15 min) | ⚡ (15 min) | ❌ | ✅ |
| `comment` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `favorite` | C/D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ |
| `favorite` | R/L | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ |
| `image` | C | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| `image` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `image` | D | ❌ | ⚡ | ⚡ | ⚡ | ❌ | ⚡ | ✅ M | ✅ |

### Domaine : Communauté

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `forum_thread` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `forum_thread` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `forum_thread` | U | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ |
| `forum_thread` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `forum_thread` | M (pin/lock) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `forum_post` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `forum_post` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `forum_post` | U | ❌ | ⚡ (30 min) | ⚡ (30 min) | ⚡ (30 min) | ⚡ (30 min) | ⚡ (30 min) | ⚡ | ✅ |
| `forum_post` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `event` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `event` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `event` | U | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `event` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `event_registration` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `event_registration` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |
| `group` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `group` | R/L | ✅ public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `group` | U | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `group` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `group_member` | C | ❌ | ✅ (join) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `group_member` | D | ❌ | ⚡ (leave) | ⚡ | ⚡ | ⚡ | ⚡ | ✅ (kick) | ✅ |

### Domaine : Marché

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `classified` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `classified` | R/L | ✅ active | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ all | ✅ all |
| `classified` | U | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |
| `classified` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `local_service` | C | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `local_service` | R/L | ✅ active | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ all | ✅ all |
| `local_service` | U | ❌ | ⚡ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `local_service` | D | ❌ | ⚡ | ⚡ | ❌ | ❌ | ❌ | ✅ M | ✅ |
| `product` | C/U/D | ❌ | ⚡ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `product` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Domaine : Messagerie

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `conversation` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `conversation` | R/L | ❌ | ⚡ participant | ⚡ | ⚡ | ⚡ + mediation assigned | ⚡ | ❌ | ✅ |
| `message` | C | ❌ | ⚡ participant | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |
| `message` | R | ❌ | ⚡ participant | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |

### Domaine : Économie

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `wallet` | R | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |
| `wallet` | U (debit/credit) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 système |
| `transaction` | C | ❌ | ✅ (transfer) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `transaction` | R/L | ❌ | ⚡ sender/receiver | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |
| `system_commission` | C/U/D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `system_commission` | R | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `service_availability` | C/U/D | ❌ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `service_availability` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `booking` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `booking` | R | ❌ | ⚡ customer | ⚡ provider/customer | ❌ | ❌ | ❌ | ❌ | ✅ |
| `booking` | U (cancel) | ❌ | ⚡ customer | ⚡ provider | ❌ | ❌ | ❌ | ❌ | ✅ |
| `booking` | U (confirm/complete) | ❌ | ❌ | ⚡ provider | ❌ | ❌ | ❌ | ❌ | ✅ |

### Domaine : Médiation

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `mediation_case` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `mediation_case` | R | ❌ | ⚡ reporter/reported | ⚡ | ⚡ | ⚡ assigned parties | ⚡ | ❌ | ✅ |
| `mediation_case` | U (assign) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `mediation_case` | U (status) | ❌ | ❌ | ❌ | ❌ | ⚡ assigned | ❌ | ❌ | ✅ |
| `mediation_case` | U (withdraw) | ❌ | ⚡ reporter | ⚡ reporter | ⚡ reporter | ❌ | ⚡ reporter | ❌ | ✅ |
| `mediation_session` | C/U | ❌ | ❌ | ❌ | ❌ | ⚡ assigned | ❌ | ❌ | ✅ |
| `mediation_session` | R | ❌ | ⚡ parties | ⚡ | ⚡ | ⚡ assigned | ⚡ | ❌ | ✅ |
| `mediation_agreement` | C | ❌ | ❌ | ❌ | ❌ | ⚡ assigned | ❌ | ❌ | ✅ |
| `mediation_agreement` | R | ❌ | ⚡ parties | ⚡ | ⚡ | ⚡ assigned | ⚡ | ❌ | ✅ |
| `mediation_agreement` | U (sign) | ❌ | ⚡ party | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |

### Domaine : Éducation

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `education_module` | C | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `education_module` | R/L | ✅ published | ✅ published | ✅ published | ✅ published | ✅ published | ✅ published + ⚡ all | ✅ all | ✅ all |
| `education_module` | U | ❌ | ❌ | ❌ | ❌ | ❌ | ⚡ | ❌ | ✅ |
| `education_module` | D | ❌ | ❌ | ❌ | ❌ | ❌ | ⚡ | ❌ | ✅ |
| `education_lesson` | C/U/D | ❌ | ❌ | ❌ | ❌ | ❌ | ⚡ module | ❌ | ✅ |
| `education_lesson` | R | ✅ enrolled/published | ✅ enrolled | ✅ enrolled | ✅ enrolled | ✅ enrolled | ✅ | ✅ | ✅ |
| `education_enrollment` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `education_enrollment` | R | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ + ⚡ module | ⚡ | ✅ |
| `education_enrollment` | U (drop) | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ❌ | ✅ |
| `education_progress` | C/U | ❌ | ⚡ enrolled | ⚡ | ⚡ | ⚡ | ❌ | ❌ | ✅ |
| `education_progress` | R | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ module educator | ❌ | ✅ |

### Domaine : Bénévolat

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `volunteer_project` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `volunteer_project` | R/L | ✅ published | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `volunteer_project` | U | ❌ | ⚡ coordinator | ⚡ | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `volunteer_project` | D | ❌ | ⚡ coordinator (draft) | ❌ | ❌ | ❌ | ❌ | ✅ M | ✅ |
| `volunteer_task` | C/U/D | ❌ | ⚡ coordinator | ⚡ | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `volunteer_task` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `volunteer_participation` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `volunteer_participation` | R | ❌ | ⚡ + coordinator | ⚡ | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `volunteer_participation` | U (confirm/complete) | ❌ | ⚡ coordinator | ⚡ coordinator | ⚡ | ⚡ | ⚡ | ✅ | ✅ |
| `volunteer_participation` | U (cancel) | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |

### Domaine : Financement

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `funding_campaign` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `funding_campaign` | R/L | ✅ active | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ all | ✅ all |
| `funding_campaign` | U | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |
| `funding_campaign` | D (cancel) | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ M | ✅ |
| `donation` | C | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `donation` | R/L | ❌ | ⚡ donor + campaign creator | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ✅ |

### Domaine : Transparence & Notifications

| Entité | Action | Anonyme | Citoyen | Propriétaire | Auteur | Médiateur | Éducateur | Modérateur | Admin |
|---|---|---|---|---|---|---|---|---|---|
| `impact_metric` | R/L | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `impact_metric` | C/U/D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 système |
| `transparency_report` | R/L | ✅ published | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `transparency_report` | C/U/D | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |
| `notification` | R/L | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ |
| `notification` | U (mark read) | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ |
| `notification` | D | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ✅ |

## 2.3 Règles transverses

### Règles d'ownership

1. **Ownership = créateur** : Sauf mention contraire, le `user_id` / `author_id` / `creator_id` / `owner_id` qui a créé la ressource détient les droits d'edition/suppression.
2. **Ownership est immuable** : Le champ d'ownership ne peut jamais être modifié après création.
3. **Transfert de propriété** : Interdit pour la plupart des entités. Pour `place`, un admin peut transférer en modifiant `owner_id`.

### Règles temporelles de modification

4. **Fenêtre d'édition** : Les avis (`review`) et commentaires (`comment`) ne sont modifiables par leur auteur que dans les **15 minutes** suivant la création. Les posts de forum dans les **30 minutes**.
2. **Pas de suppression réelle par l'utilisateur** : Les utilisateurs "suppriment" via un changement de status (`deleted`). Le contenu reste en base mais n'est plus visible publiquement.

### Règles anti-abus

6. **1 avis par lieu par citoyen** : Un utilisateur ne peut poster qu'un seul avis racine par lieu. Il peut le modifier ou le supprimer.
2. **Pas d'auto-avis** : Le propriétaire d'un lieu ne peut pas laisser un avis sur son propre lieu. Il peut uniquement répondre aux avis existants.
3. **Pas d'auto-réservation** : Un prestataire ne peut pas réserver son propre service.
4. **Pas d'auto-don** : Le créateur d'une campagne ne peut pas donner à sa propre campagne.
5. **Pas d'auto-modération** : Un modérateur ne peut pas modérer son propre contenu.

### Règles de modération

11. **Soft delete** : La modération change le `status` à `moderated`. Le contenu original est conservé en base à des fins d'audit et de contestation.
2. **Modération = notification** : Chaque action de modération génère une notification au propriétaire du contenu avec la raison.
3. **Recours** : Un utilisateur dont le contenu est modéré peut ouvrir un `mediation_case` pour contester.

### Règles de sécurité

14. **Validation des inputs** : Toutes les entrées utilisateur passent par le système de validation existant (`validate-user.ts` étendu) : XSS, SQLi, NoSQLi, command injection, path traversal, null bytes, unicode spoofing, template injection.
2. **Rate limiting** : Configurable par endpoint (existant dans Better Auth). Étendre aux nouvelles routes API :
    - Création d'avis : 5/heure/utilisateur
    - Création de commentaires : 20/heure/utilisateur
    - Envoi de messages : 60/heure/utilisateur
    - Création de sujets forum : 10/jour/utilisateur
    - Soumission de lieu : 5/jour/utilisateur
    - Création d'annonce : 10/jour/utilisateur
    - Transferts portefeuille : 20/jour/utilisateur
3. **CSRF** : Tous les formulaires incluent un token CSRF. Les API routes vérifient le header `Origin`.
4. **Injection dans les textes riches** : Le contenu JSON des articles et leçons est sanitisé côté serveur — aucune balise HTML non autorisée, aucun script, aucun lien javascript:.
5. **Audit trail** : Toutes les opérations d'écriture (C/U/D) sur les entités critiques (place, article, user_role, wallet, transaction, mediation_case, system_commission) sont enregistrées dans `audit_log`.

### Règles RGPD

19. **Anonymisation** : Les données personnelles sont anonymisables sur demande de l'utilisateur (profil, avis, commentaires → auteur anonymisé).
2. **Export** : Un utilisateur peut exporter la totalité de ses données personnelles au format JSON.
3. **Suppression** : La suppression d'un compte entraîne l'anonymisation des contributions publiques et la suppression des données privées (messages, favoris, notifications) après un délai de grâce de 30 jours.

---

# 3. OPÉRATIONS LOGIQUES

> Chaque opération est une unité logique indivisible. Les opérations sont groupées par domaine.
> **Format** : Nom · Acteur(s) · Entrées · Préconditions · Étapes · Sorties · Effets de bord · Erreurs

## 3.1 Domaine : Utilisateurs & Profils

### OP-001 : Créer un profil

- **Acteur** : Système (automatique après inscription)
- **Entrées** : `user_id` (depuis Better Auth callback)
- **Préconditions** : Utilisateur créé en base via Better Auth. Pas de profil existant.
- **Étapes** :
  1. Créer un enregistrement `profile` avec `user_id`, `username` dérivé de l'email (partie locale, unicité garantie par suffix numérique si collision), `preferred_language` détecté depuis l'Accept-Language du navigateur (fallback `fr`).
  2. Insérer `user_role` avec `role = citizen`.
  3. Créer `wallet` avec `balance = 0.00`.
- **Sorties** : `profile`, `user_role`, `wallet` créés.
- **Effets de bord** : Entrée `audit_log` (user_created).
- **Erreurs** : `PROFILE_ALREADY_EXISTS` (409) si profil existe déjà.

### OP-002 : Mettre à jour le profil

- **Acteur** : Citoyen (ownership) ou Admin
- **Entrées** : `{ username?, full_name?, bio?, avatar_url?, location?, website?, preferred_language? }`
- **Préconditions** : Utilisateur authentifié. Profil existe. Si Citoyen : `profile.user_id === session.user_id`.
- **Étapes** :
  1. Valider tous les champs (longueurs, formats, mots réservés pour username).
  2. Si `username` modifié : vérifier unicité insensible à la casse.
  3. Si `avatar_url` modifié et ancienne avatar existe : marquer l'ancienne image pour nettoyage.
  4. Mettre à jour `profile`, set `updated_at`.
- **Sorties** : `profile` mis à jour.
- **Effets de bord** : `audit_log` si admin modifie un profil tiers.
- **Erreurs** : `USERNAME_TAKEN` (409), `PROFILE_NOT_FOUND` (404), `FORBIDDEN` (403).

### OP-003 : Attribuer un rôle

- **Acteur** : Administrateur
- **Entrées** : `{ user_id, role }`
- **Préconditions** : Admin authentifié. Utilisateur cible existe et est actif. Le rôle n'est pas déjà attribué.
- **Étapes** :
  1. Vérifier que l'utilisateur cible n'est pas l'admin lui-même (pas d'auto-attribution).
  2. Insérer `user_role`.
- **Sorties** : `user_role` créé.
- **Effets de bord** : `audit_log` (role_granted). `notification` à l'utilisateur.
- **Erreurs** : `ROLE_ALREADY_ASSIGNED` (409), `USER_NOT_FOUND` (404), `SELF_ROLE_CHANGE` (400).

### OP-004 : Révoquer un rôle

- **Acteur** : Administrateur
- **Entrées** : `{ user_id, role }`
- **Préconditions** : Le rôle existe pour l'utilisateur. Le rôle `citizen` ne peut pas être révoqué.
- **Étapes** :
  1. Vérifier que le rôle n'est pas `citizen`.
  2. Vérifier impacts : si `owner` et lieux publiés existent, requérir transfert ou archivage préalable.
  3. Supprimer l'enregistrement `user_role`.
- **Sorties** : `user_role` supprimé.
- **Effets de bord** : `audit_log` (role_revoked). `notification` à l'utilisateur.
- **Erreurs** : `CANNOT_REVOKE_CITIZEN` (400), `ACTIVE_RESOURCES_EXIST` (409).

## 3.2 Domaine : Taxonomie

### OP-010 : Créer une catégorie

- **Acteur** : Administrateur
- **Entrées** : `{ name, slug, type, parent_id?, description?, icon?, sort_order? }`
- **Préconditions** : Unicité `(parent_id, slug)`. Si parent_id fourni : parent existe, parent.level < 3, parent.type === type.
- **Étapes** :
  1. Calculer `level` : parent ? parent.level + 1 : 1.
  2. Valider que level ≤ 3.
  3. Insérer `category`.
- **Sorties** : `category` créée.
- **Erreurs** : `DUPLICATE_SLUG` (409), `MAX_DEPTH_EXCEEDED` (400), `PARENT_NOT_FOUND` (404), `TYPE_MISMATCH` (400).

### OP-011 : Créer un attribut

- **Acteur** : Administrateur
- **Entrées** : `{ name, slug, value_type, possible_values?, description?, applicable_category_ids? }`
- **Préconditions** : Unicité `name` et `slug`.
- **Étapes** :
  1. Si value_type = `enum`, vérifier que `possible_values` est non vide.
  2. Insérer `attribute_definition`.
- **Sorties** : `attribute_definition` créée.
- **Erreurs** : `DUPLICATE_ATTRIBUTE` (409), `ENUM_VALUES_REQUIRED` (400).

## 3.3 Domaine : Lieux

### OP-020 : Soumettre un lieu

- **Acteur** : Propriétaire
- **Entrées** : `{ category_id, slug, type, translations: [{ language, name, description }], address?, latitude?, longitude?, email?, phone?, website?, open_hours?, accessibility?, audience?, price_range?, attributes?: [{ attribute_id, value }], tags?: string[] }`
- **Préconditions** : Utilisateur a le rôle `owner`. Catégorie existe et est de type `place`. Slug globalement unique.
- **Étapes** :
  1. Valider tous les champs.
  2. Si address fournie : créer `address` si nouvelle, sinon lier existante.
  3. Créer `place` avec `status = pending_review`.
  4. Créer les `place_translation` (au moins 1 obligatoire).
  5. Créer les `place_attribute_value` le cas échéant.
  6. Créer ou lier les `tag` / `place_tag`.
  7. Si type hébergement/gastronomie/activité : créer le détail spécifique.
- **Sorties** : `place` + traductions + attributs + tags + détails créés.
- **Effets de bord** : `notification` aux admins (nouveau lieu en attente). `audit_log` (place_submitted).
- **Erreurs** : `SLUG_TAKEN` (409), `CATEGORY_NOT_FOUND` (404), `MISSING_TRANSLATION` (400), `INVALID_ATTRIBUTE_VALUE` (400).

### OP-021 : Valider un lieu (admin)

- **Acteur** : Administrateur
- **Entrées** : `{ place_id, action: 'approve' | 'reject', reason? }`
- **Préconditions** : Lieu en statut `pending_review`.
- **Étapes** :
  1. Si `approve` : changer status à `published`, set `published_at`.
  2. Si `reject` : changer status à `rejected`. `reason` obligatoire.
- **Sorties** : `place` mis à jour.
- **Effets de bord** : `notification` au propriétaire. `audit_log` (place_approved / place_rejected).
- **Erreurs** : `PLACE_NOT_PENDING` (400), `REASON_REQUIRED` (400, si reject).

### OP-022 : Mettre à jour un lieu

- **Acteur** : Propriétaire (ownership) ou Admin
- **Entrées** : Champs modifiables de `place`, `place_translation`, `place_attribute_value`, détails.
- **Préconditions** : Lieu existe. Si Propriétaire : `place.owner_id === session.user_id`. Lieu non `rejected` (doit repasser par OP-020 pour re-soumission).
- **Étapes** :
  1. Valider les champs modifiés.
  2. Mettre à jour les entités concernées.
  3. Si lieu était `published` et des champs critiques changent (catégorie, type), repasser en `pending_review`.
- **Sorties** : Entités mises à jour.
- **Effets de bord** : `audit_log` si admin. Si re-modération nécessaire : `notification` au propriétaire.

### OP-023 : Archiver un lieu

- **Acteur** : Propriétaire (ownership) ou Admin
- **Entrées** : `{ place_id }`
- **Préconditions** : Lieu en statut `published`. Pas de réservations `pending` ou `confirmed` en cours.
- **Étapes** :
  1. Vérifier absence de booking actifs.
  2. Changer status à `archived`.
- **Sorties** : `place` archivé.
- **Effets de bord** : Disponibilités de services liées désactivées. `audit_log`.
- **Erreurs** : `ACTIVE_BOOKINGS_EXIST` (409).

### OP-024 : Rechercher des lieux

- **Acteur** : Tous (anonyme ou authentifié)
- **Entrées** : `{ query?, category_id?, type?, tags?, latitude?, longitude?, radius_km?, price_range?, min_rating?, accessibility?, audience?, sort_by?, page?, page_size? }`
- **Préconditions** : Aucune.
- **Étapes** :
  1. Construire la requête Drizzle avec les filtres : seuls les lieux `published` pour les non-admin.
  2. Si coordonnées fournies : tri par distance (Haversine ou pg_trgm).
  3. Paginer les résultats.
  4. Joindre traductions dans la langue de l'utilisateur (fallback `fr`).
- **Sorties** : `{ items: Place[], total: number, page: number, page_size: number }`.
- **Note** : La recherche full-text est configurée sur `place_translation.name` et `place_translation.description` via `pg_trgm`.

## 3.4 Domaine : Contenu (Magazine)

### OP-030 : Créer un article

- **Acteur** : Auteur
- **Entrées** : `{ title, slug, summary?, cover_image_url?, category_ids: uuid[], content_json }`
- **Préconditions** : Utilisateur a le rôle `author`. Slug unique. Catégories de type `magazine`.
- **Étapes** :
  1. Créer `article` avec `status = draft`.
  2. Créer `article_content` avec `content_json` et `language` de l'auteur.
  3. Créer `article_category_link` pour chaque catégorie.
- **Sorties** : `article` + `article_content` + liens créés.
- **Erreurs** : `SLUG_TAKEN` (409), `INVALID_CATEGORY` (400).

### OP-031 : Soumettre un article pour publication

- **Acteur** : Auteur (ownership)
- **Entrées** : `{ article_id }`
- **Préconditions** : Article en statut `draft`. `content_json` non vide. Au moins 1 catégorie liée.
- **Étapes** :
  1. Changer status à `pending_review`.
- **Sorties** : `article` mis à jour.
- **Effets de bord** : `notification` aux admins.

### OP-032 : Valider un article (admin)

- **Acteur** : Administrateur
- **Entrées** : `{ article_id, action: 'approve' | 'reject', reason? }`
- **Préconditions** : Article en statut `pending_review`.
- **Étapes** :
  1. Approuver : status → `published`, set `published_at`.
  2. Rejeter : status → `rejected`, raison obligatoire.
- **Sorties** : `article` mis à jour.
- **Effets de bord** : `notification` à l'auteur. `audit_log`.

### OP-033 : Lier des lieux à un article

- **Acteur** : Auteur (ownership)
- **Entrées** : `{ article_id, place_ids: uuid[] }`
- **Préconditions** : Article existe. Lieux existent et sont `published`.
- **Étapes** :
  1. Créer `article_place_link` pour chaque lieu.
  2. Optionnel : créer `article_place_comparison` si critères fournis.
- **Sorties** : Liens créés.

## 3.5 Domaine : Interactions

### OP-040 : Publier un avis

- **Acteur** : Citoyen
- **Entrées** : `{ place_id, title?, content, rating, sub_ratings?: [{ criterion, score }] }`
- **Préconditions** : Lieu `published`. Citoyen n'a pas déjà un avis sur ce lieu. Citoyen n'est pas le propriétaire du lieu.
- **Étapes** :
  1. Valider contenu (anti-XSS, longueur).
  2. Valider rating (0.5-5.0 par incréments de 0.5).
  3. Créer `review` avec `status = published`.
  4. Créer `sub_rating` si fournis.
  5. Recalculer `place.rating_avg` et `place.rating_count`.
- **Sorties** : `review` + `sub_rating` créés.
- **Effets de bord** : `notification` au propriétaire du lieu. Mise à jour `place.rating_avg`.
- **Erreurs** : `ALREADY_REVIEWED` (409), `SELF_REVIEW` (403), `PLACE_NOT_PUBLISHED` (400).

### OP-041 : Répondre à un avis (propriétaire)

- **Acteur** : Propriétaire du lieu
- **Entrées** : `{ review_id, content }`
- **Préconditions** : Avis existe et est `published`. Lieu appartient au propriétaire. Pas de réponse existante du propriétaire sur cet avis.
- **Étapes** :
  1. Créer `review` avec `parent_review_id = review_id`, `rating = null`.
- **Sorties** : Réponse créée.
- **Effets de bord** : `notification` à l'auteur de l'avis.

### OP-042 : Publier un commentaire

- **Acteur** : Citoyen
- **Entrées** : `{ target_type, target_id, content, parent_comment_id? }`
- **Préconditions** : Ressource cible existe et est publique. Si parent : même cible, profondeur < 3.
- **Étapes** :
  1. Résoudre le FK cible (`article_id`, `place_id`, etc.) depuis `target_type` et `target_id`.
  2. Valider contenu.
  3. Créer `comment`.
- **Sorties** : `comment` créé.
- **Effets de bord** : `notification` à l'auteur du contenu parent / du commentaire parent.

### OP-043 : Ajouter aux favoris

- **Acteur** : Citoyen
- **Entrées** : `{ target_type: 'place' | 'event' | 'trail', target_id }`
- **Préconditions** : Ressource existe. Pas déjà en favori.
- **Étapes** :
  1. Résoudre le FK cible.
  2. Créer `favorite`.
- **Sorties** : `favorite` créé.
- **Erreurs** : `ALREADY_FAVORITED` (409).

### OP-044 : Modérer un contenu

- **Acteur** : Modérateur ou Admin
- **Entrées** : `{ entity_type: 'review' | 'comment' | 'forum_post' | 'forum_thread' | 'classified', entity_id, reason }`
- **Préconditions** : Entité existe. Status actuel ≠ `moderated`. Le modérateur n'est pas l'auteur.
- **Étapes** :
  1. Changer status de l'entité à `moderated`.
  2. Créer `notification` à l'auteur avec la raison.
  3. Enregistrer dans `audit_log`.
- **Sorties** : Entité modérée.
- **Erreurs** : `SELF_MODERATION` (403), `ALREADY_MODERATED` (400).

## 3.6 Domaine : Forum

### OP-050 : Créer un sujet de forum

- **Acteur** : Citoyen
- **Entrées** : `{ category_id, title, slug, content }`
- **Préconditions** : Catégorie de type `forum`. Unique `(category_id, slug)`.
- **Étapes** :
  1. Créer `forum_thread`.
  2. Créer le premier `forum_post` (contenu initial du sujet).
  3. Set `forum_thread.last_post_at` et `post_count = 1`.
- **Sorties** : `forum_thread` + `forum_post` créés.

### OP-051 : Répondre dans un fil de forum

- **Acteur** : Citoyen
- **Entrées** : `{ thread_id, content, parent_post_id? }`
- **Préconditions** : Fil existe, non `locked`, non `deleted`.
- **Étapes** :
  1. Créer `forum_post`.
  2. Mettre à jour `forum_thread.last_post_at` et incrémenter `post_count`.
- **Sorties** : `forum_post` créé.
- **Effets de bord** : `notification` à l'auteur du fil et au parent cité.

### OP-052 : Verrouiller / Épingler un sujet

- **Acteur** : Modérateur ou Admin
- **Entrées** : `{ thread_id, action: 'pin' | 'unpin' | 'lock' | 'unlock' }`
- **Préconditions** : Fil existe.
- **Étapes** :
  1. Modifier `is_pinned` ou `is_locked`.
- **Sorties** : `forum_thread` mis à jour.
- **Effets de bord** : `audit_log`.

## 3.7 Domaine : Marché

### OP-060 : Publier une annonce

- **Acteur** : Citoyen
- **Entrées** : `{ title, description, price?, condition?, location?, category_id?, images?: File[] }`
- **Préconditions** : Rate limit (10/jour). Si catégorie : type `classified`.
- **Étapes** :
  1. Valider.
  2. Créer `classified` avec `status = pending_review`, `expires_at = now() + 30j`.
  3. Uploader images, créer `image` avec `content_type = classified`.
- **Sorties** : `classified` créé.
- **Effets de bord** : `notification` aux admins.

### OP-061 : Contacter un vendeur

- **Acteur** : Citoyen
- **Entrées** : `{ classified_id, initial_message }`
- **Préconditions** : Annonce `active`. Citoyen n'est pas le vendeur.
- **Étapes** :
  1. Créer `conversation` de type `classified_contact`.
  2. Ajouter les 2 participants.
  3. Créer le premier `message`.
- **Sorties** : `conversation` + `message`.
- **Effets de bord** : `notification` au vendeur.

### OP-062 : Proposer un service local

- **Acteur** : Citoyen ou Propriétaire
- **Entrées** : `{ title, description, base_price?, price_type?, category_id?, place_id?, is_mobile?, duration_minutes?, max_participants?, booking_advance_hours?, cancellation_hours? }`
- **Préconditions** : Si place_id fourni : lieu appartient à l'utilisateur.
- **Étapes** :
  1. Créer `local_service` avec `status = pending_review`.
- **Sorties** : `local_service` créé.

### OP-063 : Définir les disponibilités d'un service

- **Acteur** : Prestataire (ownership du service)
- **Entrées** : `{ service_id, availabilities: [{ day_of_week, start_time, end_time }] }`
- **Préconditions** : Service existe. Pas de chevauchement.
- **Étapes** :
  1. Valider non-chevauchement par jour.
  2. Insérer les `service_availability`.
- **Sorties** : Disponibilités créées.

## 3.8 Domaine : Messagerie

### OP-070 : Initier une conversation

- **Acteur** : Citoyen
- **Entrées** : `{ recipient_id, initial_message, type?: 'direct' }`
- **Préconditions** : Destinataire existe. Pas de conversation `direct` existante entre les 2 utilisateurs.
- **Étapes** :
  1. Créer `conversation` de type `direct`.
  2. Créer 2 `conversation_participant`.
  3. Créer le premier `message`.
  4. Set `conversation.last_message_at`.
- **Sorties** : `conversation` + `message` créés.
- **Effets de bord** : `notification` (new_message) au destinataire.
- **Erreurs** : `CONVERSATION_EXISTS` (409), `SELF_MESSAGE` (400).

### OP-071 : Envoyer un message

- **Acteur** : Participant d'une conversation
- **Entrées** : `{ conversation_id, content }`
- **Préconditions** : Conversation existe. L'expéditeur est participant.
- **Étapes** :
  1. Valider contenu.
  2. Créer `message`.
  3. Mettre à jour `conversation.last_message_at`.
- **Sorties** : `message` créé.
- **Effets de bord** : `notification` (new_message) aux autres participants non-lus.

### OP-072 : Marquer comme lu

- **Acteur** : Participant
- **Entrées** : `{ conversation_id }`
- **Préconditions** : Participant de la conversation.
- **Étapes** :
  1. Mettre à jour `conversation_participant.last_read_at = now()`.
- **Sorties** : Participant mis à jour.

## 3.9 Domaine : Économie

### OP-080 : Créditer un portefeuille (externe)

- **Acteur** : Système (après validation de paiement externe)
- **Entrées** : `{ user_id, amount, idempotency_key }`
- **Préconditions** : Portefeuille existe. `idempotency_key` non utilisée.
- **Étapes** : (atomique dans une transaction DB)
  1. Vérifier unicité `idempotency_key`.
  2. Créer `transaction` de type `external_credit`, `receiver_wallet_id = wallet.id`, `status = completed`.
  3. Incrémenter `wallet.balance += amount`.
- **Sorties** : `transaction` + `wallet` mis à jour.
- **Effets de bord** : `notification` (transaction_completed). `audit_log`.
- **Erreurs** : `DUPLICATE_TRANSACTION` (409).

### OP-081 : Transférer entre portefeuilles

- **Acteur** : Citoyen
- **Entrées** : `{ receiver_user_id, amount, description?, idempotency_key }`
- **Préconditions** : Expéditeur ≠ destinataire. Solde suffisant. `idempotency_key` unique.
- **Étapes** : (atomique)
  1. Vérifier `sender.wallet.balance >= amount`.
  2. Créer `transaction` type `p2p_transfer`, status `completed`.
  3. `sender.wallet.balance -= amount`.
  4. `receiver.wallet.balance += amount`.
- **Sorties** : `transaction` créée, 2 wallets mis à jour.
- **Effets de bord** : `notification` au destinataire. `audit_log`.
- **Erreurs** : `INSUFFICIENT_BALANCE` (400), `SELF_TRANSFER` (400).

### OP-082 : Réserver un service

- **Acteur** : Citoyen (client)
- **Entrées** : `{ service_id, booking_date, booking_time, customer_message?, idempotency_key }`
- **Préconditions** : Service `active`. Client ≠ prestataire. Créneau disponible. Délai de réservation respecté. Solde suffisant si paiement requis.
- **Étapes** : (atomique)
  1. Vérifier disponibilité (`service_availability` pour le jour, heure dans la plage, pas de `booking` confirmé conflictuel).
  2. Calculer `total_price` = `service.base_price` (ajustement selon `price_type`).
  3. Calculer commission système.
  4. Créer `booking` avec `status = pending`.
  5. Si paiement : créer `transaction` type `service_payment`, débiter wallet client, créditer wallet prestataire (moins commission).
  6. Créer `transaction` type `commission` pour la part plateforme.
- **Sorties** : `booking` + `transaction`(s) créés.
- **Effets de bord** : `notification` au prestataire (booking_confirmed). `notification` au client.
- **Erreurs** : `SLOT_UNAVAILABLE` (409), `SELF_BOOKING` (403), `INSUFFICIENT_BALANCE` (400), `ADVANCE_TOO_SHORT` (400).

### OP-083 : Confirmer une réservation (prestataire)

- **Acteur** : Prestataire (ownership du service)
- **Entrées** : `{ booking_id }`
- **Préconditions** : Booking en statut `pending`.
- **Étapes** :
  1. Changer status à `confirmed`.
- **Sorties** : `booking` mis à jour.
- **Effets de bord** : `notification` au client.

### OP-084 : Annuler une réservation

- **Acteur** : Client ou Prestataire
- **Entrées** : `{ booking_id }`
- **Préconditions** : Booking `pending` ou `confirmed`.
- **Étapes** :
  1. Si annulation par le client : vérifier politique d'annulation (`cancellation_hours`). Si dans le délai : remboursement total. Sinon : pas de remboursement.
  2. Si annulation par le prestataire : remboursement total automatique.
  3. Changer status (`cancelled_by_client` ou `cancelled_by_provider`).
  4. Si remboursement : créer `transaction` type `refund`.
- **Sorties** : `booking` annulé. `transaction` de remboursement le cas échéant.
- **Effets de bord** : `notification` à l'autre partie.
- **Erreurs** : `BOOKING_NOT_CANCELLABLE` (400).

## 3.10 Domaine : Médiation

### OP-090 : Ouvrir un cas de médiation

- **Acteur** : Citoyen
- **Entrées** : `{ title, description, category?, related_entity_type?, related_entity_id?, reported_user_id? }`
- **Préconditions** : Si reported_user_id : utilisateur existe. Si entity liée : entité existe.
- **Étapes** :
  1. Créer `mediation_case` avec `status = opened`.
- **Sorties** : `mediation_case` créé.
- **Effets de bord** : `notification` aux admins. `audit_log`.

### OP-091 : Assigner un médiateur

- **Acteur** : Administrateur
- **Entrées** : `{ case_id, mediator_id }`
- **Préconditions** : Cas en statut `opened`. Médiateur a le rôle `mediator`. Médiateur ≠ reporter et ≠ reported.
- **Étapes** :
  1. Set `mediation_case.mediator_id` et `status = assigned`, `assigned_at = now()`.
  2. Créer `conversation` de type `mediation` avec 3+ participants (reporter, reported, mediator).
- **Sorties** : Cas mis à jour + conversation créée.
- **Effets de bord** : `notification` à toutes les parties.
- **Erreurs** : `MEDIATOR_IS_PARTY` (400), `CASE_NOT_OPENED` (400).

### OP-092 : Planifier une session de médiation

- **Acteur** : Médiateur (assigné)
- **Entrées** : `{ case_id, scheduled_at, duration_minutes?, type? }`
- **Préconditions** : Cas `assigned` ou `in_progress`. Médiateur assigné = session.user_id.
- **Étapes** :
  1. Créer `mediation_session`.
  2. Si premier session : changer case status à `in_progress`.
- **Sorties** : `mediation_session` créée.
- **Effets de bord** : `notification` aux parties avec date/heure.

### OP-093 : Rédiger un accord de médiation

- **Acteur** : Médiateur (assigné)
- **Entrées** : `{ case_id, content, actions? }`
- **Préconditions** : Cas `in_progress`. Pas d'accord existant.
- **Étapes** :
  1. Créer `mediation_agreement` avec les 3 signatures à `false`.
- **Sorties** : `mediation_agreement` créé.
- **Effets de bord** : `notification` aux parties pour signature.

### OP-094 : Signer un accord

- **Acteur** : Partie impliquée (reporter, reported, mediator)
- **Entrées** : `{ agreement_id }`
- **Préconditions** : Accord existe. L'utilisateur est une des parties. N'a pas déjà signé.
- **Étapes** :
  1. Set le champ de signature correspondant à `true`.
  2. Si les 3 signatures sont true : set `signed_at = now()`, changer case status à `resolved`, set `case.resolved_at`.
- **Sorties** : Accord mis à jour, éventuellement cas résolu.
- **Effets de bord** : `notification` aux parties.

## 3.11 Domaine : Éducation

### OP-100 : Créer un module d'éducation

- **Acteur** : Éducateur
- **Entrées** : `{ title, slug, description?, category_id?, difficulty, cover_image_url?, is_free, price?, estimated_duration_hours? }`
- **Préconditions** : Rôle `educator`. Slug unique. Si pas gratuit : price > 0.
- **Étapes** :
  1. Créer `education_module` avec `status = draft`.
- **Sorties** : `education_module` créé.

### OP-101 : Ajouter une leçon

- **Acteur** : Éducateur (ownership du module)
- **Entrées** : `{ module_id, title, slug, content_json, type, sort_order, estimated_minutes? }`
- **Préconditions** : Module existe, éducateur est le propriétaire. Module en `draft` ou `published`. Unique `(module_id, slug)` et `(module_id, sort_order)`.
- **Étapes** :
  1. Créer `education_lesson`.
  2. Incrémenter `education_module.lesson_count`.
- **Sorties** : `education_lesson` créée.

### OP-102 : Publier un module

- **Acteur** : Éducateur (ownership)
- **Entrées** : `{ module_id }`
- **Préconditions** : Module en `draft`. Au moins 1 leçon.
- **Étapes** :
  1. Status → `published`, set `published_at`.
- **Sorties** : Module mis à jour.

### OP-103 : S'inscrire à un module

- **Acteur** : Citoyen
- **Entrées** : `{ module_id, idempotency_key? }`
- **Préconditions** : Module `published`. Pas déjà inscrit. Si payant : solde suffisant.
- **Étapes** :
  1. Créer `education_enrollment` avec `status = active`.
  2. Si payant : créer `transaction` type `service_payment`, débiter wallet.
  3. Incrémenter `education_module.enrollment_count`.
- **Sorties** : `education_enrollment` créé.
- **Erreurs** : `ALREADY_ENROLLED` (409), `INSUFFICIENT_BALANCE` (400).

### OP-104 : Compléter une leçon

- **Acteur** : Citoyen (inscrit)
- **Entrées** : `{ enrollment_id, lesson_id, score? }`
- **Préconditions** : Enrollment `active`. Leçon appartient au module de l'enrollment. Pas déjà complétée.
- **Étapes** :
  1. Créer ou mettre à jour `education_progress` avec `is_completed = true`, `completed_at = now()`.
  2. Recalculer `enrollment.progress_percent`.
  3. Si 100% : set `enrollment.status = completed`, `enrollment.completed_at = now()`.
- **Sorties** : Progression mise à jour.
- **Effets de bord** : Si module complété : `notification` à l'éducateur et au citoyen. `impact_metric` mis à jour.

## 3.12 Domaine : Bénévolat

### OP-110 : Créer un projet bénévole

- **Acteur** : Citoyen (coordinateur)
- **Entrées** : `{ title, slug, description, category_id?, location?, latitude?, longitude?, start_date?, end_date?, volunteer_goal?, funding_goal? }`
- **Préconditions** : Slug unique.
- **Étapes** :
  1. Créer `volunteer_project` avec `status = draft`.
  2. Si `funding_goal` : créer `funding_campaign` associée (status `draft`).
- **Sorties** : `volunteer_project` + éventuellement `funding_campaign`.

### OP-111 : Ajouter une tâche bénévole

- **Acteur** : Coordinateur du projet
- **Entrées** : `{ project_id, title, description?, required_skills?, max_volunteers?, scheduled_date?, estimated_hours? }`
- **Préconditions** : Projet existe, coordinateur = user.
- **Étapes** :
  1. Créer `volunteer_task`.
- **Sorties** : `volunteer_task` créée.

### OP-112 : S'inscrire à une tâche bénévole

- **Acteur** : Citoyen
- **Entrées** : `{ task_id }`
- **Préconditions** : Tâche `open`. `current_volunteers < max_volunteers` (si max défini). Pas déjà inscrit.
- **Étapes** :
  1. Créer `volunteer_participation` avec `status = signed_up`.
  2. Incrémenter `volunteer_task.current_volunteers`.
  3. Si `current_volunteers == max_volunteers` : changer task status à `filled`.
  4. Incrémenter `volunteer_project.volunteer_count`.
- **Sorties** : `volunteer_participation` créée.
- **Erreurs** : `TASK_FULL` (409), `ALREADY_SIGNED_UP` (409).

### OP-113 : Valider la participation (coordinateur)

- **Acteur** : Coordinateur
- **Entrées** : `{ participation_id, hours_logged }`
- **Préconditions** : Participation `signed_up` ou `confirmed`.
- **Étapes** :
  1. Set `status = completed`, `hours_logged`, `completed_at = now()`.
  2. Créer/mettre à jour `impact_metric` type `volunteer_hours`.
- **Sorties** : Participation mise à jour.
- **Effets de bord** : `notification` au bénévole.

## 3.13 Domaine : Financement

### OP-120 : Créer une campagne de financement

- **Acteur** : Citoyen
- **Entrées** : `{ title, slug, description, goal_amount, deadline, project_id? }`
- **Préconditions** : Slug unique. Deadline dans le futur.
- **Étapes** :
  1. Créer `funding_campaign` avec `status = draft`.
- **Sorties** : `funding_campaign` créée.

### OP-121 : Publier une campagne

- **Acteur** : Créateur (ownership)
- **Entrées** : `{ campaign_id }`
- **Préconditions** : Campagne en `draft`. Description et objectif renseignés.
- **Étapes** :
  1. Status → `active`.
- **Sorties** : Campagne publiée.

### OP-122 : Faire un don

- **Acteur** : Citoyen
- **Entrées** : `{ campaign_id, amount, is_anonymous?, message?, idempotency_key }`
- **Préconditions** : Campagne `active`. Donateur ≠ créateur. Solde suffisant.
- **Étapes** : (atomique)
  1. Créer `transaction` type `service_payment` (wallet donateur → wallet créateur campagne).
  2. Créer `donation`.
  3. Incrémenter `campaign.raised_amount += amount`, `campaign.donor_count += 1`.
  4. Si `raised_amount >= goal_amount` : status → `funded`, set `funded_at`.
  5. Si projet associé : mettre à jour `project.funding_raised`.
- **Sorties** : `donation` + `transaction` créés.
- **Effets de bord** : `notification` au créateur. Si `funded` : `notification` à tous les donateurs.
- **Erreurs** : `SELF_DONATION` (403), `CAMPAIGN_NOT_ACTIVE` (400), `INSUFFICIENT_BALANCE` (400).

## 3.14 Domaine : Communauté (Événements, Groupes)

### OP-130 : Créer un événement

- **Acteur** : Citoyen
- **Entrées** : `{ title, slug, description?, type?, category_id?, place_id?, start_at, end_at?, max_participants?, is_paid, price?, registration_deadline?, recurrence_rule? }`
- **Préconditions** : Slug unique. `start_at` dans le futur. Si payant : price > 0.
- **Étapes** :
  1. Créer `event`.
- **Sorties** : `event` créé.

### OP-131 : S'inscrire à un événement

- **Acteur** : Citoyen
- **Entrées** : `{ event_id, idempotency_key? }`
- **Préconditions** : Événement existe. Inscriptions ouvertes (deadline non dépassée). Pas déjà inscrit. Si max_participants : nombre d'inscrits < max.
- **Étapes** :
  1. Créer `event_registration` avec `status = registered`.
  2. Si payant : créer `transaction`, débiter wallet.
- **Sorties** : `event_registration` créée.
- **Erreurs** : `EVENT_FULL` (409), `ALREADY_REGISTERED` (409), `REGISTRATION_CLOSED` (400).

### OP-132 : Créer un groupe

- **Acteur** : Citoyen
- **Entrées** : `{ name, slug, description?, is_public? }`
- **Préconditions** : Slug unique.
- **Étapes** :
  1. Créer `group`.
  2. Créer `group_member` avec `role = admin` pour le créateur.
- **Sorties** : `group` + `group_member` créés.

### OP-133 : Rejoindre un groupe

- **Acteur** : Citoyen
- **Entrées** : `{ group_id }`
- **Préconditions** : Groupe `is_public = true` (sinon invitation requise). Pas déjà membre.
- **Étapes** :
  1. Créer `group_member` avec `role = member`.
- **Sorties** : Adhésion créée.

## 3.15 Domaine : Transparence

### OP-140 : Calculer les métriques d'impact

- **Acteur** : Système (job planifié, quotidien)
- **Entrées** : `{ period_start, period_end }`
- **Étapes** :
  1. Compter projets bénévoles complétés dans la période.
  2. Sommer les heures de bénévolat validées.
  3. Sommer les fonds levés.
  4. Compter les médiations résolues.
  5. Compter les leçons complétées.
  6. Compter les citoyens actifs (connexion dans les 30 derniers jours).
  7. Compter les annonces / services partagés.
  8. Upsert les `impact_metric` correspondants.
- **Sorties** : Métriques mises à jour.

### OP-141 : Publier un rapport de transparence

- **Acteur** : Administrateur
- **Entrées** : `{ title, slug, content_json, period_start, period_end, metric_ids? }`
- **Préconditions** : Métriques calculées pour la période.
- **Étapes** :
  1. Créer `transparency_report` avec `status = draft`.
  2. Optionnel : passer à `published`, set `published_at`.
- **Sorties** : Rapport créé.

---

# 4. PARCOURS UTILISATEURS

> Parcours critiques décrivant les flux complets intégrant les opérations. Chaque parcours est une séquence d'étapes UI → API → DB → UI.

## PU-01 : Inscription et activation

```
1. Anonyme → Page d'inscription (/{locale}/inscription ou /{locale}/sign-up)
2. Remplit formulaire : email, mot de passe, nom d'utilisateur
3. [OP-001] Profil + wallet + rôle citizen créés automatiquement
4. Email de vérification envoyé (Better Auth)
5. Utilisateur clique le lien → /{locale}/verify-email?token=...
6. Email vérifié → Redirection vers /{locale}/profile
7. Utilisateur peut compléter son profil [OP-002]
```

**Points d'attention** :

- Le `username` est dérivé de l'email lors de l'inscription automatique mais modifiable ensuite.
- La langue préférée est détectée depuis le locale de la page d'inscription.
- Wallet et rôle citizen sont créés dans le même callback post-inscription.

## PU-02 : Soumission et publication d'un lieu

```
1. Propriétaire → Dashboard propriétaire → "Ajouter un lieu"
2. Formulaire multi-étapes :
   a. Informations de base (catégorie, type, slug auto-généré)
   b. Traductions (nom + description dans chaque langue souhaitée, min 1)
   c. Localisation (adresse, coordonnées, carte interactive)
   d. Détails spécifiques (hébergement / gastronomie / activité selon le type)
   e. Attributs dynamiques (chargés selon la catégorie sélectionnée)
   f. Tags (sélection existants ou création)
   g. Galerie photos (upload multiple)
3. Soumission [OP-020] → status = pending_review
4. Admin reçoit notification → panneau de modération
5. Admin consulte la fiche → approuve [OP-021] ou rejette avec motif
6. Propriétaire reçoit notification du résultat
7. Si rejeté : propriétaire corrige → resoumet [OP-020 en mode re-soumission]
8. Si approuvé : lieu visible publiquement dans l'annuaire
```

## PU-03 : Recherche et consultation d'un lieu

```
1. Visiteur → Page annuaire (/{locale}/places)
2. Barre de recherche : texte libre + filtres (catégorie, type, tags, zone géo, prix, note min)
3. [OP-024] Résultats paginés avec cartes et liste
4. Clic sur un lieu → Page détaillée (/{locale}/places/{slug})
5. Affichage : traductions, galerie, attributs, carte, horaires, contact
6. Section avis : avis existants + sous-notations + réponses propriétaire
7. Si authentifié et non-propriétaire : bouton "Laisser un avis" [OP-040]
8. Bouton favori [OP-043] si authentifié
```

## PU-04 : Publication d'un article

```
1. Auteur → Dashboard auteur → "Nouvel article"
2. Éditeur de contenu riche (blocs JSON) :
   - Texte, titres, images, citations, listes, code
   - Bloc "Intégration lieu" : sélection de lieux publiés [OP-033]
   - Bloc "Comparatif" : tableau de comparaison multi-lieux
3. Métadonnées : titre, slug, résumé, image de couverture, catégories
4. Sauvegarde brouillon [OP-030]
5. Prévisualisation
6. Soumission [OP-031]
7. Admin valide [OP-032]
8. Article publié → accessible /{locale}/magazine/{slug}
```

## PU-05 : Parcours de réservation

```
1. Citoyen → Page service local (/{locale}/services/{slug})
2. Consultation description, prix, disponibilités
3. Sélection créneau dans le calendrier de disponibilités
4. Message optionnel au prestataire
5. Vérification du solde du portefeuille
6. Confirmation [OP-082]
7. Prestataire reçoit notification → confirme [OP-083] ou refuse
8. Client reçoit la confirmation
9. Après le service : prestataire marque "complété"
10. Optionnel : client laisse un avis sur le lieu du prestataire [OP-040]
```

**Flux d'annulation** :

```
A. Client annule [OP-084] :
   - Avant le délai : remboursement total
   - Après le délai : pas de remboursement
B. Prestataire annule [OP-084] : remboursement total automatique
```

## PU-06 : Médiation d'un conflit

```
1. Citoyen constate un problème (avis diffamatoire, litige commercial, harcèlement)
2. Via la page du contenu litigieux : bouton "Signaler" → formulaire de signalement
3. Ouverture du cas [OP-090]
4. Admin consulte le cas dans le panneau de modération
5. Admin assigne un médiateur certifié [OP-091]
6. Conversation de médiation créée automatiquement (3+ participants)
7. Médiateur planifie une ou plusieurs sessions [OP-092]
8. Sessions conduites (visio, texte, ou en personne)
9. Médiateur rédige un accord [OP-093]
10. Chaque partie signe l'accord [OP-094]
11. Quand toutes les signatures sont collectées : cas résolu
12. Période de confirmation → cas clôturé
```

## PU-07 : Parcours éducatif

```
1. Citoyen → Page éducation (/{locale}/education)
2. Catalogue de modules filtrables (catégorie, difficulté, gratuit/payant)
3. Clic sur un module → Page détaillée avec programme et description
4. Inscription [OP-103] (paiement si nécessaire)
5. Accès au contenu des leçons (ordonnées)
6. Progression leçon par leçon :
   - Lecture du contenu
   - Exercice / Quiz si applicable
   - Marquage comme complété [OP-104]
   - Barre de progression mise à jour en temps réel
7. Complétion du module → badge ou certificat (futur)
8. Impact comptabilisé dans les métriques
```

## PU-08 : Projet bénévole

```
1. Citoyen → "Créer un projet bénévole" [OP-110]
2. Ajout de tâches [OP-111]
3. Optionnel : création d'une campagne de financement associée [OP-120]
4. Publication du projet (status → recruiting)
5. D'autres citoyens consultent et s'inscrivent aux tâches [OP-112]
6. Coordinateur confirme les participations
7. Exécution des tâches
8. Coordinateur valide les heures [OP-113]
9. Résumé d'impact renseigné
10. Impact comptabilisé [OP-140]
```

## PU-09 : Forum communautaire

```
1. Visiteur → Page forum (/{locale}/forum)
2. Navigation par catégories de forum
3. Si authentifié : "Nouveau sujet" [OP-050]
4. Rédaction du sujet + premier message
5. D'autres citoyens répondent [OP-051]
6. Threading possible (réponse à un message spécifique)
7. Modération : épinglage / verrouillage [OP-052] par modérateurs
8. Signalement de messages problématiques → médiation
```

## PU-10 : Place de marché solidaire

```
1. Citoyen → Petites annonces (/{locale}/classifieds)
2. Filtrage par catégorie, prix, localisation, état
3. "Publier une annonce" [OP-060]
4. Annonce en attente de modération
5. Après approbation : annonce visible dans le listing
6. Autre citoyen intéressé → "Contacter le vendeur" [OP-061]
7. Conversation privée entre acheteur et vendeur
8. Transaction éventuelle via portefeuille [OP-081]
9. Annonce marquée comme vendue ou expire automatiquement après 30 jours
```

## PU-11 : Tableau de bord de transparence

```
1. Visiteur → Page Transparence (/{locale}/transparency)
2. Vue des métriques d'impact globales (chiffres clés animés)
3. Graphiques temporels : évolution par trimestre
4. Détail par domaine : bénévolat, médiation, éducation, financement
5. Rapports publiés téléchargeables / consultables
6. Données vérifiables et traçables
```

---

# 5. PLAN UI

> Description logique des vues. Pas de maquettes — uniquement la structure, les composants, et les données affichées. Toutes les pages supportent les 4 variantes CSS (initial, retro, modern, futuristic) et les 4 locales (fr, en, ar, es).

## 5.1 Structure de navigation

### Navigation principale (Header)

```
Logo | Annuaire | Magazine | Forum | Services | Événements | Éducation | Bénévolat | Transparence | [Langue] | [Thème] | [Auth/Profil]
```

Sur mobile (≤ 1024px) : menu hamburger dans un `Sheet` drawer (comportement existant).

### Navigation secondaire (footer)

```
À propos | Contact | Mentions légales | CGU | Politique de confidentialité | Réseaux sociaux
```

### Dashboard utilisateur

Menu latéral (visible après authentification) :

```
Mon profil
Mes lieux (si owner)
Mes articles (si author)
Mes annonces
Mes services
Mes réservations
Mes inscriptions (événements + éducation + bénévolat)
Mes favoris
Messagerie
Notifications
Portefeuille
Médiation (si mediator : cas assignés ; sinon : mes signalements)
Mon contenu éducatif (si educator)
```

### Panneau d'administration

Menu latéral admin :

```
Dashboard (statistiques globales)
Utilisateurs (liste, recherche, rôles)
Modération (file d'attente : lieux, articles, annonces, signalements)
Taxonomie (catégories, attributs, tags)
Économie (commissions, transactions, wallets)
Métriques & Transparence (métriques, rapports)
Audit (journal d'audit)
Configuration (paramètres système)
```

## 5.2 Pages publiques

### Page : Annuaire des lieux (`/{locale}/places`)

- **Composants** : SearchBar, FilterPanel (catégorie, type, tags, distance, prix, note), MapView (optionnel), PlaceGrid/PlaceList, Pagination
- **Données** : Résultats de `OP-024` avec traductions dans le locale courant
- **Interactions** : Recherche en temps réel (debounce 300ms), filtres appliqués via URL query params, switch vue carte/liste

### Page : Détail d'un lieu (`/{locale}/places/{slug}`)

- **Composants** : PlaceHeader (nom, catégorie, note, photos hero), Gallery, PlaceInfo (horaires, contact, accessibilité, audience), AttributeList, Map (position), ReviewSection (liste d'avis + formulaire), CommentSection
- **Données** : `place` + `place_translation` + `place_attribute_value` + `review[]` + `sub_rating[]`
- **Interactions** : Écrire un avis (if auth + not owner + not already reviewed), répondre (if owner), ajouter favori, partager, signaler

### Page : Magazine (`/{locale}/magazine`)

- **Composants** : FeaturedArticle, ArticleGrid, CategoryFilter, Pagination
- **Données** : Articles `published`, triés par `published_at` DESC

### Page : Article (`/{locale}/magazine/{slug}`)

- **Composants** : ArticleHeader (couverture, titre, auteur, date), ArticleContent (rendu des blocs JSON), PlaceEmbedCard, ComparisonTable, CommentSection, RelatedArticles
- **Données** : `article` + `article_content` + `article_place_link[]` + `article_place_comparison[]` + `comment[]`

### Page : Forum (`/{locale}/forum`)

- **Composants** : CategoryList (forum), ThreadList, ThreadItem (titre, auteur, date, post_count, pinned badge, locked badge), NewThreadButton, Pagination
- **Données** : `forum_thread[]` triés par `is_pinned` DESC, `last_post_at` DESC

### Page : Fil de forum (`/{locale}/forum/{category_slug}/{thread_slug}`)

- **Composants** : ThreadHeader, ForumPostList (threaded), ForumPostItem (auteur, avatar, date, contenu, actions), ReplyForm
- **Données** : `forum_thread` + `forum_post[]` ordonnés par `created_at`

### Page : Services (`/{locale}/services`)

- **Composants** : ServiceGrid, ServiceCard (titre, prix, prestataire, note lieu), CategoryFilter, Pagination
- **Données** : `local_service[]` active, avec `place` joint si applicable

### Page : Événements (`/{locale}/events`)

- **Composants** : EventCalendar (vue mois), EventList (vue liste), EventCard (titre, date, lieu, type, participants), FilterPanel (type, date range, gratuit/payant)
- **Données** : `event[]` futurs, triés par `start_at`

### Page : Éducation (`/{locale}/education`)

- **Composants** : ModuleGrid, ModuleCard (titre, éducateur, difficulté badge, durée, gratuit badge, leçons count, enrollments count), CategoryFilter, DifficultyFilter
- **Données** : `education_module[]` published

### Page : Module éducatif (`/{locale}/education/{slug}`)

- **Composants** : ModuleHeader (couverture, titre, description, éducateur), LessonList (ordonnée, indiquant progression si inscrit), EnrollButton, ProgressBar (si inscrit)
- **Données** : `education_module` + `education_lesson[]` + `education_enrollment` (si auth)

### Page : Leçon (`/{locale}/education/{module_slug}/{lesson_slug}`)

- **Composants** : LessonContent (rendu blocs JSON), PreviousNext navigation, MarkCompleteButton, ProgressIndicator
- **Données** : `education_lesson` + `education_progress` (si inscrit)

### Page : Bénévolat (`/{locale}/volunteer`)

- **Composants** : ProjectGrid, ProjectCard (titre, coordinateur, dates, barre de progression volontaires, barre de progression financement), FilterPanel (catégorie, statut, lieu)
- **Données** : `volunteer_project[]` non-draft

### Page : Projet bénévole (`/{locale}/volunteer/{slug}`)

- **Composants** : ProjectHeader, TaskList (tâches avec status, compétences, inscriptions), SignUpButton, FundingProgress (si campagne liée), DonationForm
- **Données** : `volunteer_project` + `volunteer_task[]` + `volunteer_participation[]` + `funding_campaign`

### Page : Annonces (`/{locale}/classifieds`)

- **Composants** : ClassifiedGrid, ClassifiedCard (titre, prix, état, photo, localisation), CategoryFilter, PriceFilter, ConditionFilter, Pagination
- **Données** : `classified[]` active

### Page : Transparence (`/{locale}/transparency`)

- **Composants** : ImpactDashboard (chiffres clés avec animation compteur), ImpactChart (graphiques par domaine), ReportList (rapports publiés)
- **Données** : `impact_metric[]` + `transparency_report[]` published

### Page : Sentiers (`/{locale}/trails`)

- **Composants** : TrailGrid, TrailCard (nom, difficulté badge, distance, durée, dénivelé), TrailMap (overview), DifficultyFilter
- **Données** : `trail[]`

### Page : Sentier (`/{locale}/trails/{slug}`)

- **Composants** : TrailHeader, TrailMap (tracé GPX + POIs), POIList, Gallery, CommentSection, FavoriteButton
- **Données** : `trail` + `poi[]` + `image[]` + `comment[]`

## 5.3 Pages authentifiées (Dashboard)

### Dashboard : Profil (`/{locale}/profile`)

- **Composants** : ProfileForm (édition de tous les champs profil), AvatarUpload, RoleBadges
- **Données** : `profile` + `user_role[]`

### Dashboard : Mes lieux (`/{locale}/dashboard/places`)

- **Composants** : PlaceList (avec status badge : pending, published, rejected, archived), CreatePlaceButton, PlaceActions (edit, archive, view stats)
- **Données** : `place[]` où `owner_id = user`

### Dashboard : Messagerie (`/{locale}/dashboard/messages`)

- **Composants** : ConversationList (triée par last_message_at, unread indicator), MessageView (messages chronologiques, auteur, date), ComposeForm
- **Données** : `conversation[]` (as participant) + `message[]` + `conversation_participant[]`

### Dashboard : Portefeuille (`/{locale}/dashboard/wallet`)

- **Composants** : BalanceDisplay, TransactionHistory (paginée, filtrable par type), CreditForm (lien vers paiement externe), TransferForm
- **Données** : `wallet` + `transaction[]`

### Dashboard : Notifications (`/{locale}/dashboard/notifications`)

- **Composants** : NotificationList (groupées par type, mark-as-read, link vers target), MarkAllReadButton
- **Données** : `notification[]` triées par `created_at` DESC

### Dashboard : Favoris (`/{locale}/dashboard/favorites`)

- **Composants** : FavoriteList (onglets : Lieux / Événements / Sentiers), RemoveFavoriteButton
- **Données** : `favorite[]` avec entités jointes

### Dashboard : Mes réservations (`/{locale}/dashboard/bookings`)

- **Composants** : BookingList (séparées : à venir / passées / annulées), BookingCard (service, date, status, prix), CancelButton
- **Données** : `booking[]` où `customer_id = user`

## 5.4 Pages d'administration

### Admin : Modération (`/{locale}/admin/moderation`)

- **Onglets** : Lieux en attente | Articles en attente | Annonces en attente | Signalements
- **Composants** : ModerationQueue (entity preview, approve/reject buttons, reason textarea)
- **Données** : `place[] status=pending_review` + `article[] status=pending_review` + `classified[] status=pending_review` + `mediation_case[] status=opened`

### Admin : Utilisateurs (`/{locale}/admin/users`)

- **Composants** : UserTable (avec filtres, recherche, rôle badges), UserDetail (profil + rôles + historique), RoleAssignmentForm
- **Données** : `user[]` + `profile[]` + `user_role[]`

### Admin : Taxonomie (`/{locale}/admin/taxonomy`)

- **Onglets** : Catégories | Attributs | Tags
- **Composants** : CategoryTree (drag-drop pour reorder), CategoryForm, AttributeDefinitionList, TagManagement
- **Données** : `category[]` + `attribute_definition[]` + `tag[]`

### Admin : Audit (`/{locale}/admin/audit`)

- **Composants** : AuditLogTable (filtres : type, user, date range, entity), LogDetail
- **Données** : `audit_log[]` paginé

---

# 6. EXIGENCES NON FONCTIONNELLES

## 6.1 Performance

| Métrique | Objectif | Mesure |
|---|---|---|
| Time to First Byte (TTFB) | < 200ms (pages SSR) | Lighthouse, WebPageTest |
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Total Blocking Time (TBT) | < 200ms | Lighthouse |
| API Response Time (p95) | < 300ms | Serveur monitoring |
| API Response Time (p99) | < 1s | Serveur monitoring |
| Database Query Time (p95) | < 50ms | Query logging |
| Search Query Time (full-text) | < 500ms | Custom metric |
| Concurrent Users | 1 000 simultanés | Load testing |
| Page Weight (total) | < 500KB sans images | Build analytics |
| JavaScript Bundle | < 50KB (total client JS) | Build analytics |

## 6.2 Disponibilité & Fiabilité

| Exigence | Objectif |
|---|---|
| Uptime | 99.5% (hors maintenance planifiée) |
| RPO (Recovery Point Objective) | 1 heure (PostgreSQL point-in-time recovery) |
| RTO (Recovery Time Objective) | 4 heures |
| Données critiques sauvegardées | Daily automated backups, 30 jours rétention |
| Déploiement sans interruption | Zero-downtime deploys via Vercel |
| Rollback | < 5 minutes via git revert + redeploy |

## 6.3 Sécurité

| Exigence | Détails |
|---|---|
| Authentification | Better Auth (email/password + OAuth providers) |
| Autorisation | RBAC + ABAC (permissions.ts existant, étendu) |
| HTTPS | Obligatoire (TLS 1.3 minimum) |
| Headers sécurité | CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy (existant) |
| Validation des entrées | 15+ vecteurs d'attaque validés par validate-user.ts (existant) |
| Rate Limiting | Par endpoint, configurable (existant, à étendre) |
| Audit Logging | Toutes opérations d'écriture sur entités critiques |
| Données sensibles | Mots de passe hashés via bcrypt (Better Auth). Pas de données sensibles en clair dans les logs |
| CSRF | Token-based pour formulaires, Origin header pour API |
| Session | HTTP-only, secure, SameSite=Strict cookies (Better Auth) |
| File Uploads | Vérification MIME type réel, limite 10 Mo, stockage hors webroot |
| SQL Injection | Drizzle ORM parameterized queries (protection native) |

## 6.4 Accessibilité

| Exigence | Objectif |
|---|---|
| Standard | WCAG 2.2 AA |
| Navigation clavier | 100% des fonctionnalités accessibles |
| Lecteur d'écran | Sémantique HTML, ARIA labels, live regions |
| Contraste | Ratio minimum 4.5:1 (texte), 3:1 (grand texte, icônes) |
| Focus visible | Tous les éléments interactifs |
| RTL | Support complet pour l'arabe |
| Responsive | 320px à 2560px |
| Images | Alt text obligatoire sur tous les uploads |

## 6.5 Internationalisation

| Exigence | Détails |
|---|---|
| Locales supportées | fr (défaut), en, ar, es |
| Routing | Préfixé : `/{locale}/...` |
| Contenu statique | Fichiers JSON plats (`src/i18n/`) |
| Contenu dynamique | Traductions en base (place_translation, article_content) |
| RTL | Layout miroir complet pour `ar` |
| Dates & Nombres | Formatage via `Intl` API selon locale |
| SEO | Balises `hreflang`, sitemap multilingue |

## 6.6 Scalabilité

| Dimension | Objectif initial | Objectif 12 mois |
|---|---|---|
| Lieux | 500 | 5 000 |
| Articles | 100 | 1 000 |
| Utilisateurs | 1 000 | 10 000 |
| Avis | 2 000 | 50 000 |
| Messages (privés) | 10 000 | 500 000 |
| Transactions | 1 000 | 50 000 |

## 6.7 Maintenabilité

| Exigence | Détails |
|---|---|
| Couverture de tests | ≥85% lignes, ≥85% fonctions, ≥80% branches |
| TypeScript strict | `strict: true`, pas de `any` sauf justifié |
| Documentation inline | JSDoc pour toutes les fonctions publiques |
| Schema migrations | Versionées, idempotentes, aucune perte de données |
| Code review | Obligatoire avant merge |
| Linting | ESLint + lint-staged |
| Format | Prettier (config partagée) |
| Dépendances | Audit mensuel, pas de vulnerabilité critical/high |

---

# 7. INTÉGRATIONS EXTERNES

## 7.1 Services actuellement intégrés

| Service | Usage | Configuration |
|---|---|---|
| **PostgreSQL** | Base de données principale | `DATABASE_URL_*` (local/prod/test) |
| **Better Auth** | Authentification & sessions | `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` |
| **SMTP** (configurable) | Emails transactionnels | `SMTP_PROVIDER`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| **Vercel** | Déploiement & hosting | Adapter Astro Vercel |

## 7.2 Services à intégrer

### Cartographie & Géolocalisation

| Service | Usage | Justification |
|---|---|---|
| **OpenStreetMap / Leaflet** | Affichage de cartes | Open source, gratuit, respect vie privée |
| **Nominatim** (OSM) | Géocodage (adresse → coordonnées) | Gratuit, pas de clé API requise |
| **MapLibre GL JS** | Rendu de cartes vectorielles | Alternative open-source à Mapbox GL |

**Intégration prévue** :

- Composant `<Map>` Astro avec hydratation `client:visible`
- Géocodage côté serveur (API route) avec cache des résultats
- Stockage des coordonnées en `decimal(10,7)` dans `place`, `trail`, `poi`
- Recherche par rayon via formule Haversine en SQL

### Paiement externe

| Service | Usage | Justification |
|---|---|---|
| **Stripe** (prévu) | Crédit portefeuille depuis CB | Leader, API robuste, webhooks fiables |

**Intégration prévue** :

- API route `POST /api/payments/create-session` → crée session Stripe Checkout
- Webhook `POST /api/payments/webhook` → réception événement `checkout.session.completed`
- Le webhook déclenche `OP-080` (crédit portefeuille)
- Idempotence via `idempotency_key` = Stripe session ID
- Mode test disponible via `STRIPE_TEST_KEY`

### Fichiers & Stockage

| Service | Usage | Justification |
|---|---|---|
| **S3-compatible** (Cloudflare R2, AWS S3) | Stockage d'images et médias | Scalable, CDN, coût maîtrisé |

**Intégration prévue** :

- Upload via API route `POST /api/uploads`
- Proxy de redimensionnement (ou utilisation d'Astro Image)
- Formats cibles : WebP (principal), AVIF (progressif)
- Structure de stockage : `/{content_type}/{year}/{month}/{uuid}.{ext}`
- Nettoyage des orphelins via job planifié

### Temps réel (messagerie)

| Service | Usage | Justification |
|---|---|---|
| **Server-Sent Events (SSE)** | Notifications en temps réel | Natif HTTP, pas de dépendance externe, adapté au modèle SSR |

**Intégration prévue** :

- API route `GET /api/sse/notifications` → stream SSE
- L'utilisateur se reconnecte automatiquement si déconnexion
- Polling fallback pour navigateurs incompatibles (< 5%)
- Notifications de messages, avis, réservations, médiation

### Recherche full-text

| Service | Usage | Justification |
|---|---|---|
| **pg_trgm** (PostgreSQL) | Recherche full-text et fuzzy | Natif PostgreSQL, pas de service externe |

**Intégration prévue** :

- Extension `pg_trgm` activée
- Index GIN sur `place_translation.name`, `place_translation.description`
- Index GIN sur `article.title`, `forum_thread.title`
- Opérateur `%` pour la recherche fuzzy, `@@` pour full-text

### Tracé GPX

| Service | Usage | Justification |
|---|---|---|
| **gpxparser** (npm) | Parsing fichiers GPX pour sentiers | Léger, compatible Node.js |

**Intégration prévue** :

- Upload GPX via API route
- Parsing côté serveur → extraction des coordonnées, distance, dénivelé
- Stockage du tracé en `jsonb` ou URL vers fichier GPX
- Rendu sur carte avec Leaflet/MapLibre

## 7.3 Webhooks entrants

| Source | Endpoint | Événements |
|---|---|---|
| Stripe | `POST /api/payments/webhook` | `checkout.session.completed`, `payment_intent.failed` |

**Sécurité des webhooks** :

- Vérification de signature Stripe (`stripe.webhooks.constructEvent`)
- Rate limiting spécifique (100/min)
- Idempotence sur l'ID d'événement
- Logging complet dans `audit_log`

## 7.4 APIs exposées (futures)

| Endpoint | Usage | Authentification |
|---|---|---|
| `GET /api/v1/places` | API publique des lieux | API key ou anonyme (rate limited) |
| `GET /api/v1/events` | API publique des événements | API key ou anonyme |
| `GET /api/v1/transparency` | API publique des métriques | Anonyme |

Versioning via préfixe `/api/v1/`. Documentation OpenAPI générée automatiquement (futur).

---

# 8. TÂCHES D'IMPLÉMENTATION

> Work packages ordonnés par dépendances. Chaque tâche est autonome, testable, et délivrable. Les estimations sont en jours de travail (1 dev senior). `[EXISTANT]` signifie que l'infrastructure est déjà en place.

## WP-0 : Fondations (Pré-requis)

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-001 | Activer `pg_trgm` extension en migration | — | 0.25j | P0 |
| T-002 | Créer table `profile` + migration | — | 0.5j | P0 |
| T-003 | Hook Better Auth post-signup : créer profile, wallet, user_role(citizen) | T-002 | 1j | P0 |
| T-004 | Créer table `wallet` + migration | — | 0.5j | P0 |
| T-005 | Créer table `transaction` + migration | T-004 | 0.5j | P0 |
| T-006 | Créer table `notification` + migration | — | 0.5j | P0 |
| T-007 | Créer table `user_role` + migration | — | 0.5j | P0 |
| T-008 | API SSE pour notifications temps réel | T-006 | 1.5j | P1 |
| T-009 | Composant `<Map>` avec Leaflet/MapLibre + hydratation client:visible | — | 2j | P1 |
| T-010 | Service upload fichiers (images) vers S3-compatible | — | 2j | P1 |
| T-011 | Middleware RBAC étendu pour les nouveaux rôles | T-007 | 1j | P0 |
| T-012 | Utilitaire de notification (créer + push SSE) | T-006, T-008 | 1j | P1 |
| T-013 | Créer table `favorite` + migration | — | 0.25j | P1 |
| T-014 | Créer table `image` + migration + polymorphic link | T-010 | 0.5j | P1 |

**Sous-total WP-0** : ~12j

## WP-1 : Taxonomie

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-020 | Créer tables `category` + `category_translation` + migration | — | 0.5j | P0 |
| T-021 | Créer tables `tag` + `tag_translation` + migration | — | 0.5j | P0 |
| T-022 | Créer tables `attribute_definition` + `attribute_def_translation` + migration | — | 0.5j | P0 |
| T-023 | Seed catégories initiales (7 types × 4 langues) | T-020 | 1j | P0 |
| T-024 | Seed attributs par catégorie | T-022 | 1j | P1 |
| T-025 | Admin CRUD catégories (pages + API routes) | T-020 | 2j | P1 |
| T-026 | Admin CRUD tags | T-021 | 1j | P1 |
| T-027 | Admin CRUD attributs | T-022 | 1.5j | P1 |

**Sous-total WP-1** : ~7j

## WP-2 : Gestion des lieux

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-030 | Créer tables `place` + `place_translation` + migration | WP-1 | 1j | P0 |
| T-031 | Créer table `place_attribute_value` + migration | T-030, T-022 | 0.5j | P0 |
| T-032 | Créer table `place_tag` (join table) + migration | T-030, T-021 | 0.25j | P0 |
| T-033 | API CRUD place (OP-020, OP-022, OP-023) | T-030 | 3j | P0 |
| T-034 | API approbation/rejet (OP-021) | T-033 | 1j | P0 |
| T-035 | Page annuaire (filtres, pagination, recherche full-text) | T-033 | 3j | P0 |
| T-036 | Page détail lieu (avec traductions, attributs, carte) | T-033, T-009 | 2j | P0 |
| T-037 | Formulaire multi-étapes création de lieu (dashboard propriétaire) | T-033, T-010 | 3j | P0 |
| T-038 | Dashboard propriétaire : mes lieux | T-033 | 1j | P0 |
| T-039 | Recherche géospatiale (rayon Haversine) | T-035 | 1j | P1 |
| T-040 | Galerie photos liée à un lieu | T-014, T-030 | 1j | P1 |

**Sous-total WP-2** : ~16.75j

## WP-3 : Système d'avis

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-050 | Créer tables `review` + `sub_rating` + migration | WP-2 | 0.5j | P0 |
| T-051 | API CRUD review (OP-040, OP-041, OP-042) | T-050 | 2j | P0 |
| T-052 | Calcul et mise à jour `place.average_rating` | T-051 | 0.5j | P0 |
| T-053 | Section avis sur page lieu (liste + formulaire + sous-notations) | T-051 | 2j | P0 |
| T-054 | Réponse propriétaire à un avis | T-051 | 0.5j | P1 |

**Sous-total WP-3** : ~5.5j

## WP-4 : Contenu éditorial (Magazine)

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-060 | Créer tables `article` + `article_content` + migration | — | 0.5j | P0 |
| T-061 | Créer tables `article_place_link` + `article_place_comparison` + migration | T-060, WP-2 | 0.5j | P1 |
| T-062 | Éditeur de contenu riche (blocs JSON) | T-060 | 4j | P0 |
| T-063 | API CRUD article (OP-030, OP-031, OP-032, OP-034) | T-060 | 2j | P0 |
| T-064 | Page magazine (listing) | T-063 | 1.5j | P0 |
| T-065 | Page article (rendu bloc, intégrations lieu) | T-063, T-061 | 2j | P0 |
| T-066 | Dashboard auteur | T-063 | 1.5j | P0 |

**Sous-total WP-4** : ~12j

## WP-5 : Commentaires & signalements

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-070 | Créer table `comment` (polymorphique) + migration | — | 0.5j | P0 |
| T-071 | Composant CommentSection réutilisable (articles, lieux, sentiers) | T-070 | 2j | P0 |
| T-072 | API CRUD comment (OP-042 analogue) | T-070 | 1j | P0 |
| T-073 | Système de signalement (flag, notification modérateur) | T-070 | 1.5j | P1 |

**Sous-total WP-5** : ~5j

## WP-6 : Forum communautaire

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-080 | Créer tables `forum_thread` + `forum_post` + migration | — | 0.5j | P1 |
| T-081 | Créer table `forum_category` + migration | — | 0.25j | P1 |
| T-082 | API CRUD forum (OP-050, OP-051, OP-052) | T-080 | 2j | P1 |
| T-083 | Page forum (listing catégories + threads) | T-082 | 2j | P1 |
| T-084 | Page fil de discussion (threading) | T-082 | 2j | P1 |

**Sous-total WP-6** : ~6.75j

## WP-7 : Annonces

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-090 | Créer table `classified` + migration | — | 0.5j | P1 |
| T-091 | API CRUD classified (OP-060, OP-061) | T-090 | 1.5j | P1 |
| T-092 | Page annonces (listing + filtres) | T-091 | 2j | P1 |
| T-093 | Expiration automatique à 30 jours | T-090 | 0.5j | P2 |

**Sous-total WP-7** : ~4.5j

## WP-8 : Événements

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-100 | Créer tables `event` + `event_participant` + migration | — | 0.5j | P1 |
| T-101 | API CRUD event (OP-071, OP-072, OP-073) | T-100 | 2j | P1 |
| T-102 | Page événements (vue calendrier + liste) | T-101 | 2.5j | P1 |
| T-103 | Page détail événement + inscription | T-101 | 1.5j | P1 |

**Sous-total WP-8** : ~6.5j

## WP-9 : Messagerie

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-110 | Créer tables `conversation` + `conversation_participant` + `message` + migration | — | 0.5j | P1 |
| T-111 | API messagerie (OP-070, OP-071) | T-110 | 2j | P1 |
| T-112 | Interface messagerie (liste conversations + vue messages + composition) | T-111 | 3j | P1 |
| T-113 | Indicateur de messages non lus | T-112, T-008 | 1j | P2 |

**Sous-total WP-9** : ~6.5j

## WP-10 : Économie & Portefeuille

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-120 | API portefeuille (OP-080, OP-081) | T-004, T-005 | 2j | P1 |
| T-121 | Intégration Stripe Checkout + webhook | T-120 | 3j | P1 |
| T-122 | Dashboard portefeuille (solde, historique, crédit) | T-120 | 2j | P1 |
| T-123 | Système de commissions automatisé | T-120 | 1j | P2 |

**Sous-total WP-10** : ~8j

## WP-11 : Services locaux & réservations

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-130 | Créer tables `local_service` + `booking` + migration | WP-2 | 0.5j | P1 |
| T-131 | API CRUD services (OP-082, OP-083, OP-084) | T-130 | 2j | P1 |
| T-132 | Page services (listing + filtres) | T-131 | 2j | P1 |
| T-133 | Page détail service + réservation | T-131, WP-10 | 2j | P1 |
| T-134 | Dashboard "Mes réservations" (client + prestataire) | T-131 | 1.5j | P1 |

**Sous-total WP-11** : ~8j

## WP-12 : Sentiers & POIs

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-140 | Créer tables `trail` + `poi` + migration | — | 0.5j | P2 |
| T-141 | Parsing GPX côté serveur | T-140 | 1j | P2 |
| T-142 | Page sentiers (listing + filtres) | T-140 | 2j | P2 |
| T-143 | Page détail sentier (carte tracé + POIs) | T-141, T-009 | 2j | P2 |

**Sous-total WP-12** : ~5.5j

## WP-13 : Groupes communautaires

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-150 | Créer tables `group` + `group_member` + migration | — | 0.5j | P2 |
| T-151 | API CRUD groups | T-150 | 1.5j | P2 |
| T-152 | Page groupes (listing + création + gestion membres) | T-151 | 2j | P2 |

**Sous-total WP-13** : ~4j

## WP-14 : Médiation

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-160 | Créer tables `mediation_case` + `mediation_session` + `mediation_agreement` + `mediation_signature` + migration | — | 1j | P1 |
| T-161 | API médiation (OP-090 à OP-094) | T-160 | 3j | P1 |
| T-162 | Panneau médiateur (cas assignés, sessions, suivi) | T-161 | 2.5j | P1 |
| T-163 | Flux de signalement → ouverture de cas | T-161, T-073 | 1j | P1 |

**Sous-total WP-14** : ~7.5j

## WP-15 : Éducation

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-170 | Créer tables `education_module` + `education_lesson` + `education_enrollment` + `education_progress` + migration | — | 1j | P2 |
| T-171 | API éducation (OP-100 à OP-104) | T-170 | 2j | P2 |
| T-172 | Page catalogue modules | T-171 | 2j | P2 |
| T-173 | Page module + leçon (progression, rendu contenu) | T-171 | 2.5j | P2 |
| T-174 | Dashboard éducateur | T-171 | 1.5j | P2 |

**Sous-total WP-15** : ~9j

## WP-16 : Bénévolat

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-180 | Créer tables `volunteer_project` + `volunteer_task` + `volunteer_participation` + migration | — | 0.5j | P2 |
| T-181 | API bénévolat (OP-110 à OP-113) | T-180 | 2j | P2 |
| T-182 | Page projets bénévoles (listing + détail) | T-181 | 2j | P2 |
| T-183 | Inscription aux tâches et suivi des heures | T-181 | 1.5j | P2 |

**Sous-total WP-16** : ~6j

## WP-17 : Financement participatif

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-190 | Créer tables `funding_campaign` + `donation` + migration | — | 0.5j | P2 |
| T-191 | API financement (OP-120 à OP-122) | T-190, WP-10 | 2j | P2 |
| T-192 | Composant financement (barre de progression, formulaire don) | T-191 | 1.5j | P2 |

**Sous-total WP-17** : ~4j

## WP-18 : Transparence & Impact

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-200 | Créer tables `impact_metric` + `transparency_report` + migration | — | 0.5j | P2 |
| T-201 | API métriques et rapports (OP-140, OP-141) | T-200 | 1.5j | P2 |
| T-202 | Page transparence (dashboard, graphiques, rapports) | T-201 | 3j | P2 |
| T-203 | Compteurs d'impact mis à jour par triggers ou cron | T-200 | 1.5j | P2 |

**Sous-total WP-18** : ~6.5j

## WP-19 : Admin & Modération

| # | Tâche | Dépendance | Estimation | Priorité |
|---|---|---|---|---|
| T-210 | Panneau admin : dashboard statistiques | WP-0 | 2j | P1 |
| T-211 | Panneau admin : file de modération | WP-2, WP-4, WP-7 | 3j | P1 |
| T-212 | Panneau admin : gestion utilisateurs & rôles | WP-0 | 2j | P1 |
| T-213 | Panneau admin : gestion taxonomie | WP-1 | 1.5j | P1 |
| T-214 | Panneau admin : journal d'audit | — [EXISTANT] | 1j | P1 |
| T-215 | Panneau admin : économie (transactions, wallets) | WP-10 | 1.5j | P2 |

**Sous-total WP-19** : ~11j

## Résumé des estimations

| Work Package | Estimation | Priorité dominante |
|---|---|---|
| WP-0 : Fondations | 12j | P0 |
| WP-1 : Taxonomie | 7j | P0 |
| WP-2 : Gestion des lieux | 16.75j | P0 |
| WP-3 : Système d'avis | 5.5j | P0 |
| WP-4 : Contenu éditorial | 12j | P0 |
| WP-5 : Commentaires & signalements | 5j | P0-P1 |
| WP-6 : Forum | 6.75j | P1 |
| WP-7 : Annonces | 4.5j | P1 |
| WP-8 : Événements | 6.5j | P1 |
| WP-9 : Messagerie | 6.5j | P1 |
| WP-10 : Économie | 8j | P1 |
| WP-11 : Services & réservations | 8j | P1 |
| WP-12 : Sentiers | 5.5j | P2 |
| WP-13 : Groupes | 4j | P2 |
| WP-14 : Médiation | 7.5j | P1 |
| WP-15 : Éducation | 9j | P2 |
| WP-16 : Bénévolat | 6j | P2 |
| WP-17 : Financement | 4j | P2 |
| WP-18 : Transparence | 6.5j | P2 |
| WP-19 : Admin & modération | 11j | P1 |
| **TOTAL** | **~152j** | — |

### Ordre d'implémentation recommandé

```
Phase 1 (P0 — MVP core) : WP-0 → WP-1 → WP-2 → WP-3 → WP-4 → WP-5
  ~59.25j — Fondations + Lieux + Avis + Articles + Commentaires

Phase 2 (P1 — Écosystème) : WP-6 → WP-9 → WP-10 → WP-11 → WP-14 → WP-19
  ~54.25j — Forum + Messagerie + Économie + Services + Médiation + Admin

Phase 3 (P2 — Extension) : WP-7 → WP-8 → WP-12 → WP-13 → WP-15 → WP-16 → WP-17 → WP-18
  ~46.5j — Annonces + Événements + Sentiers + Groupes + Éducation + Bénévolat + Financement + Transparence
```

---

# 9. PLAN DE TESTS

> Stratégie de test alignée sur l'infrastructure existante : Vitest (unit + integration), Playwright (E2E). Couverture cible : ≥85% lignes, ≥85% fonctions, ≥80% branches.

## 9.1 Tests unitaires (`tests/unit/`)

Tests isolés, sans base de données, sans réseau. Mocks autorisés.

| Domaine | Fichier test | Fonctions testées |
|---|---|---|
| Validation profil | `profile-validation.test.ts` | Validation bio (longueur, XSS), validation URL (formats), validation téléphone |
| Modèle de permissions | `permissions-extended.test.ts` | Matrice RBAC étendue (owner/author/mediator/educator/moderator), vérification ABAC |
| Calcul de commission | `commission.test.ts` | Calcul des frais, cas limites (montant 0, devise invalide, overflow decimal) |
| Parsing GPX | `gpx-parser.test.ts` | Extraction de coordonnées, calcul distance, calcul dénivelé, fichier invalide |
| Calcul Haversine | `haversine.test.ts` | Distance entre coordonnées, cas limites (pôles, méridien) |
| Génération de slug | `slug.test.ts` | Translittération multilingue (arabe, accents français), unicité, longueur max |
| Blocs JSON article | `article-blocks.test.ts` | Validation de structure, sanitization HTML, rendu |
| Calcul impact | `impact-calculator.test.ts` | Agrégations par domaine, par période, gestion des valeurs nulles |
| Wallet operations | `wallet-operations.test.ts` | Crédit, débit, vérification solde insuffisant, atomicité logique |
| Recherche full-text | `search-query-builder.test.ts` | Construction de requêtes pg_trgm, sanitization, pondération |

## 9.2 Tests d'intégration (`tests/integration/`)

Tests avec base de données réelle (`DATABASE_URL_TEST`). Transactions isolées. Cleanup post-test.

| Domaine | Fichier test | Scénarios |
|---|---|---|
| Cycle de vie lieu | `place-lifecycle.test.ts` | Création → pending → approbation → publication → archivage, rejet + re-soumission |
| Cycle de vie article | `article-lifecycle.test.ts` | Brouillon → soumission → approbation → publication → archivage |
| Système d'avis | `review-system.test.ts` | Création avis + sous-notations, calcul moyenne, interdiction auto-avis |
| Forum | `forum.test.ts` | Création thread, post, reply, épinglage, verrouillage |
| Portefeuille | `wallet.test.ts` | Crédit → débit → solde, transaction simultanée, atomicité |
| Réservation | `booking.test.ts` | Création → confirmation → complétion, annulation + remboursement |
| Inscriptions éducation | `education-enrollment.test.ts` | Inscription → progression leçon → complétion module |
| Médiation | `mediation.test.ts` | Ouverture cas → assignation → session → accord → signatures → clôture |
| Messagerie | `messaging.test.ts` | Création conversation, envoi message, lecture, marquage lu |
| Notification | `notification.test.ts` | Création, lecture, marquage lu, filtrage par type |
| Financement | `funding.test.ts` | Campagne → donations → atteinte objectif, échec objectif |
| Bénévolat | `volunteering.test.ts` | Projet → tâches → participation → validation heures |
| Taxonomie | `taxonomy.test.ts` | CRUD catégories + tags + attributs, traductions, intégrité référentielle |
| Favoris | `favorites.test.ts` | Ajout, suppression, toggle, limitation par type |
| Recherche | `search.test.ts` | Full-text multi-langue, recherche géo par rayon, filtres combinés |

## 9.3 Tests E2E (`tests/e2e/`)

Tests Playwright. Navigateur complet. Scénarios utilisateur entiers.

| Scénario | Fichier test | Parcours |
|---|---|---|
| Inscription complète | `auth-flow.spec.ts` | Inscription → vérification email → login → profile visible |
| Soumission lieu | `place-submission.spec.ts` | Login owner → formulaire multi-étapes → soumission → vérification status pending |
| Modération lieu | `place-moderation.spec.ts` | Login admin → file modération → approbation → vérification lieu publié |
| Publication article | `article-publishing.spec.ts` | Login author → éditeur → soumission → admin valide → article visible |
| Recherche lieu | `place-search.spec.ts` | Page annuaire → recherche texte → filtres → résultats → clic détail |
| Réservation | `booking-flow.spec.ts` | Login client → page service → réservation → confirmation prestataire |
| Forum | `forum-flow.spec.ts` | Login → nouveau sujet → réponse → vérification thread |
| Multilingue | `i18n-flow.spec.ts` | Navigation FR → switch EN → vérification traductions → switch AR → vérification RTL |
| Accessibilité | `a11y-audit.spec.ts` | Scan axe-core sur pages clés (accueil, annuaire, article, forum, login) |
| Responsive | `responsive.spec.ts` | Viewport mobile (375px) → menu hamburger → navigation → formulaires |

## 9.4 Tests de sécurité (`tests/e2e/security/`)

Extension des tests de sécurité existants aux nouvelles entités.

| Scénario | Fichier test | Vecteurs |
|---|---|---|
| Injection lieu | `place-security.spec.ts` | XSS dans nom/description, SQLi dans filtres de recherche, path traversal dans upload |
| Injection article | `article-security.spec.ts` | XSS dans blocs JSON, injection markdown |
| Escalade de privilèges | `privilege-escalation.spec.ts` | Citizen tente OP admin, user A tente modifier lieu de user B, rôle forgé |
| Rate limiting étendu | `rate-limiting.spec.ts` | Limites par endpoint pour toutes les nouvelles API routes |
| IDOR (Insecure Direct Object Reference) | `idor.spec.ts` | Accès à wallet d'autrui, modification profil d'autrui, lecture message d'autrui |
| Upload malveillant | `upload-security.spec.ts` | Bypass MIME type, fichier trop gros, nom de fichier dangereux, double extension |

## 9.5 Fixtures nécessaires

| Fixture | Fichier | Contenu |
|---|---|---|
| Utilisateurs de test | `auth-fixtures.ts` [EXISTANT] | Étendu avec rôles owner, author, mediator, educator, moderator, admin |
| Payloads sécurité | `security-payloads.ts` [EXISTANT] | Étendu avec payloads spécifiques lieu, article, forum |
| Données taxonomie | `taxonomy-fixtures.ts` | Catégories, tags, attributs de test |
| Données lieux | `place-fixtures.ts` | Lieux dans tous les status, avec traductions multi-langues |
| Données articles | `article-fixtures.ts` | Articles brouillon, soumis, publiés, avec blocs JSON variés |
| Données portefeuille | `wallet-fixtures.ts` | Wallets avec soldes variés, transactions de test |

---

# 10. GESTION DES MÉDIAS

## 10.1 Types de médias supportés

| Type | Formats acceptés | Taille max | Usage |
|---|---|---|---|
| Image (lieu) | JPEG, PNG, WebP, AVIF | 10 Mo | Galerie de lieu, couverture |
| Image (article) | JPEG, PNG, WebP, AVIF | 10 Mo | Couverture, images dans blocs |
| Image (profil) | JPEG, PNG, WebP | 5 Mo | Avatar utilisateur |
| Fichier GPX | .gpx (XML) | 20 Mo | Tracé de sentier |
| Document (médiation) | PDF | 10 Mo | Accord de médiation signé |

## 10.2 Pipeline d'upload

```
1. Client envoie fichier via FormData → POST /api/uploads
2. Serveur vérifie :
   a. Authentification (session valide)
   b. Taille (Content-Length ≤ limite)
   c. MIME type réel (magic bytes, pas seulement extension)
   d. Nom de fichier (sanitization : suppression caractères spéciaux, double extension)
3. Génération UUID pour le fichier
4. Optimisation image côté serveur :
   a. Redimensionnement si largeur > 2048px
   b. Conversion WebP (qualité 80%)
   c. Génération thumbnail (400px largeur)
5. Upload vers stockage S3 : /{content_type}/{year}/{month}/{uuid}.webp
6. Retour de l'URL publique (CDN)
7. Entrée créée dans table `image`
```

## 10.3 Structure de stockage

```
/places/{year}/{month}/{uuid}.webp          — Photos de lieux
/places/{year}/{month}/{uuid}_thumb.webp     — Thumbnails
/articles/{year}/{month}/{uuid}.webp         — Images d'articles
/profiles/{year}/{month}/{uuid}.webp         — Avatars
/trails/{year}/{month}/{uuid}.gpx            — Fichiers GPX
/mediation/{year}/{month}/{uuid}.pdf         — Documents de médiation
```

## 10.4 Nettoyage

- Job planifié (cron quotidien) scanne les fichiers sans référence dans `image` ou les autres tables
- Grace period de 24h avant suppression (évite race conditions avec uploads en cours)
- Log des suppressions dans `audit_log`

---

# 11. TÂCHES DE FOND & PLANIFICATION

## 11.1 Jobs planifiés

| Job | Fréquence | Description | Implémentation |
|---|---|---|---|
| Expiration annonces | Quotidien, 02:00 UTC | Passe les `classified` avec `expires_at < now()` en status `expired` | API route interne / cron |
| Nettoyage médias orphelins | Quotidien, 03:00 UTC | Supprime les fichiers sans référence (grace 24h) | API route interne / cron |
| Mise à jour métriques d'impact | Quotidien, 04:00 UTC | Recalcule les compteurs `impact_metric` | API route interne / cron |
| Notification rappel réservation | Quotidien, 08:00 UTC | Envoie rappel J-1 pour réservations à venir | API route interne / cron |
| Fermeture campagnes financement | Quotidien, 00:00 UTC | Passe les campagnes avec `end_date < today()` en `completed` ou `failed` | API route interne / cron |
| Purge sessions expirées | Quotidien, 05:00 UTC | Better Auth gère nativement ; nettoyage additionnel des sessions orphelines | API route interne / cron |
| Export RGPD | À la demande | Génération du fichier d'export pour un utilisateur (30 jours délai) | API route dédiée |
| Anonymisation suppression | 30j après demande | Anonymise les données utilisateur après la période de grâce | API route interne / cron |

## 11.2 Stratégie d'exécution

**Option retenue** : API routes internes déclenchées par un service cron externe (Vercel Cron, GitHub Actions scheduler, ou cron système pour déploiement Node).

Format : `GET /api/cron/{job-name}` avec header d'authentification `Authorization: Bearer {CRON_SECRET}`.

Chaque job :
- Vérifie le token d'authentification
- Log le début et la fin dans `audit_log`
- Capture et log les erreurs sans interrompre les items restants
- Retourne un résumé JSON : `{ processed: N, errors: N, duration_ms: N }`

## 11.3 Événements déclenchés (side effects)

| Événement | Déclencheur | Actions |
|---|---|---|
| Utilisateur créé | POST /api/auth/sign-up | Créer profile + wallet + user_role(citizen) |
| Lieu approuvé | Admin approuve (OP-021) | Notification owner, mise à jour compteur impact_metric |
| Avis créé | Citizen poste avis (OP-040) | Notification owner du lieu, recalcul average_rating |
| Article publié | Admin approuve (OP-032) | Notification auteur, indexation recherche |
| Message envoyé | Citizen envoie message (OP-071) | Notification destinataire(s), SSE push |
| Réservation confirmée | Prestataire confirme (OP-083) | Notification client, débit wallet |
| Cas médiation assigné | Admin assigne (OP-091) | Notification médiateur + parties, création conversation |
| Don effectué | Citizen fait un don (OP-121) | Notification créateur campagne, recalcul current_amount |
| Module complété | Enrollment → progress 100% | Notification citoyen, mise à jour impact_metric |
| Heures bénévolat validées | Coordinateur valide (OP-113) | Mise à jour impact_metric |

---

# 12. OBSERVABILITÉ & ANALYTICS

## 12.1 Audit logging

**Table existante** : `audit_log` (schema dans `src/database/schemas/audit-log.ts`).

| Champ | Contenu |
|---|---|
| `action` | Nom de l'opération (ex: `place.create`, `review.create`, `wallet.debit`) |
| `entity_type` | Type d'entité (ex: `place`, `review`, `transaction`) |
| `entity_id` | ID de l'entité concernée |
| `user_id` | Utilisateur ayant effectué l'action |
| `metadata` | JSON : données avant/après, contexte additionnel |
| `ip_address` | IP de la requête |
| `created_at` | Timestamp |

**Événements loggés** :
- Toute création / modification / suppression d'entité
- Toute opération financière (transaction, don, commission)
- Toute action de modération (approbation, rejet, ban)
- Toute assignation / modification de rôle
- Toute connexion / déconnexion / échec d'auth
- Tout accès à des données sensibles (export profil, données admin)

## 12.2 Métriques applicatives

| Métrique | Type | Source |
|---|---|---|
| Nombre de lieux publiés | Counter | `place` where `status = published` |
| Nombre d'articles publiés | Counter | `article` where `status = published` |
| Nombre d'avis | Counter | `review` count |
| Volume du forum | Counter | `forum_post` count |
| Insertions / jour | Gauge | `audit_log` count grouped by date |
| Temps de réponse API (p95) | Histogram | Middleware timing |
| Taux d'erreur API | Rate | Middleware error counting |
| Utilisateurs actifs (DAU) | Gauge | Sessions uniques par jour |
| Taux de conversion inscription → profil complété | Rate | `profile` where `bio IS NOT NULL` / total users |
| Volume transactions | Gauge | `transaction` sum par période |

## 12.3 Health check

`GET /api/health` — Endpoint sans authentification.

```json
{
  "status": "ok",
  "version": "2.0.0",
  "timestamp": "2026-02-13T12:00:00Z",
  "checks": {
    "database": "ok",
    "smtp": "ok",
    "storage": "ok"
  }
}
```

Chaque check retourne `"ok"`, `"degraded"`, ou `"down"`. Le status global est le pire des checks.

---

# 13. MIGRATIONS & SEED DATA

## 13.1 Stratégie de migration

**Infrastructure existante** : `pnpm db:generate` + `pnpm db:migrate` (scripts dans `scripts/db/`).

### Ordre de création des tables

Les nouvelles tables doivent être créées dans l'ordre suivant (respect des dépendances FK) :

```
Vague 1 (aucune dépendance métier) :
  profile, wallet, user_role, notification, favorite, image,
  category, category_translation, tag, tag_translation,
  attribute_definition, attribute_def_translation

Vague 2 (dépend de Vague 1) :
  place, place_translation, place_attribute_value, place_tag,
  article, article_content,
  forum_category, forum_thread, forum_post,
  group, group_member,
  trail, poi,
  classified,
  event, event_participant,
  education_module, education_lesson,
  volunteer_project, volunteer_task

Vague 3 (dépend de Vague 2) :
  review, sub_rating, comment,
  local_service, booking,
  article_place_link, article_place_comparison,
  conversation, conversation_participant, message,
  education_enrollment, education_progress,
  volunteer_participation,
  mediation_case, mediation_session, mediation_agreement, mediation_signature,
  impact_metric, transparency_report

Vague 4 (dépend de Vague 3) :
  transaction (dépend wallet + booking + donation),
  funding_campaign, donation
```

### Convention de nommage des fichiers de migration

```
{NNNN}_{descriptive_name}.sql
```

Exemple :
```
0006_create_profile_wallet_roles.sql
0007_create_taxonomy_tables.sql
0008_create_place_tables.sql
0009_create_article_tables.sql
0010_create_forum_tables.sql
...
```

### Règles

- UNE migration = UNE unité logique (un domaine)
- Chaque migration est idempotente (IF NOT EXISTS sur CREATE)
- Jamais de DROP en production sans migration de données préalable
- Les données existantes (9 tables auth + audit) ne sont jamais touchées
- Chaque migration est testée localement avant commit

## 13.2 Seed data

**Infrastructure existante** : `pnpm db:seed` avec fichiers `*.data.ts` dans `src/lib/database/data/`.

### Fichiers de seed à créer

| Ordre | Fichier | Contenu | Quantité |
|---|---|---|---|
| 10 | `10-categories.data.ts` | 7 types de catégories × 4 langues | 28 traductions |
| 11 | `11-attribute-definitions.data.ts` | ~30 définitions d'attributs × 4 langues | ~120 traductions |
| 12 | `12-tags.data.ts` | ~50 tags courants × 4 langues | ~200 traductions |
| 20 | `20-places.data.ts` | 10 lieux de démonstration (diversité de types) | 10 |
| 21 | `21-place-translations.data.ts` | Traductions FR + EN pour les 10 lieux | 20 |
| 22 | `22-place-attributes.data.ts` | ~5 attributs par lieu | ~50 |
| 30 | `30-articles.data.ts` | 5 articles de démonstration | 5 |
| 31 | `31-article-content.data.ts` | Contenu FR + EN pour les 5 articles | 10 |
| 40 | `40-forum-categories.data.ts` | 5 catégories de forum × 4 langues | 20 |
| 50 | `50-education-modules.data.ts` | 3 modules éducatifs avec leçons | 3 modules + 9 leçons |

### Données de démonstration

Toutes les données de seed sont réalistes et contextuellement pertinentes :
- Lieux : commerces, restaurants, espaces culturels, services de quartier — noms et descriptions crédibles
- Articles : guides pratiques, comparatifs de quartier, reportages locaux
- Tags : thématiques réelles (bio, accessible PMR, wifi gratuit, parking, terrasse, etc.)
- Catégories forum : vie de quartier, entraide, culture, sport, administration
- Modules éducatifs : citoyenneté numérique, compostage urbain, premiers secours
-ANNECY BIEN SUR

Aucun "Lorem ipsum", aucun "Test 1", aucun "Example".

---

# 14. RISQUES & HYPOTHÈSES

## 14.1 Risques techniques

| # | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Performance full-text dégradée au-delà de 50k entrées | Moyenne | Élevé | Monitoring p95, migration vers search externe (MeiliSearch) en fallback |
| R-02 | Complexité du système de permissions à mesure que les rôles s'accumulent | Élevée | Moyen | Tests exhaustifs de la matrice, review systématique lors d'ajout de rôle |
| R-03 | Conflit d'atomicité sur les transactions portefeuille sous charge | Faible | Critique | Transactions SQL SERIALIZABLE, retry automatique, tests de charge |
| R-04 | Surcharge de la messagerie (spam) | Moyenne | Moyen | Rate limiting par conversation, détection de patterns, signalement |
| R-05 | Complexité de l'éditeur de blocs JSON (article) | Élevée | Élevé | Bibliothèque existante (tiptap, editor.js) adaptée plutôt que from scratch |
| R-06 | Coût stockage S3 croissant avec les uploads | Faible | Faible | Compression agressive, nettoyage orphelins, quotas par utilisateur |
| R-07 | Intégration Stripe : complexité fiscale et conformité | Moyenne | Élevé | Phase initiale sans argent réel (portefeuille virtuel), ajout paiement en Phase 2 |
| R-08 | Disponibilité des APIs de géocodage (Nominatim) | Faible | Moyen | Cache résultats, fallback sur coordonnées manuelles |
| R-09 | Croissance exponentielle des notifications | Moyenne | Moyen | Agrégation intelligente (batch), TTL 90 jours, pagination |
| R-10 | GPX parsing : fichiers volumineux / malformés | Faible | Faible | Limite de taille 20Mo, validation XSD, timeout 30s |

## 14.2 Risques organisationnels

| # | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R-11 | Manque de modérateurs pour la file de validation | Élevée | Élevé | Auto-approbation après N publications validées (trust score), modération communautaire |
| R-12 | Contenu insuffisant au lancement | Élevée | Élevé | Seed data réaliste, partenariats locaux pré-lancement, import de données ouvertes |
| R-13 | Adoption médiation : méfiante initiale | Moyenne | Moyen | Formation médiateurs, processus transparent, garanties de confidentialité |
| R-14 | Multi-langue : coût de traduction du contenu dynamique | Élevée | Moyen | Minimum FR + EN, ajout AR + ES progressif, traduction communautaire |

## 14.3 Hypothèses

| # | Hypothèse | Validée par |
|---|---|---|
| H-01 | PostgreSQL est suffisant jusqu'à 10k utilisateurs sans partitionnement | Tests de charge Phase 1 |
| H-02 | SSE est suffisant pour le temps réel (pas besoin de WebSocket) | Évaluation en Phase 2 si limites atteintes |
| H-03 | Le portefeuille virtuel précède le paiement réel | Décision produit, pas technique |
| H-04 | Le système de médiation est viable sans cadre légal formalisé | Validation juridique avant Phase 2 |
| H-05 | La cartographie OpenStreetMap est suffisante en couverture | Vérification sur les zones cibles |
| H-06 | Vercel gère le volume de SSR sans scaling custom | Monitoring, migration vers Node standalone si nécessaire |
| H-07 | Les utilisateurs fournissent du contenu de qualité | Modération + guidelines + gamification impact |

---

# 15. ANNEXES NORMATIVES

## 15.1 Catalogue des énumérations

### Statuts d'entité

```typescript
// Lieu
type PlaceStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';

// Article
type ArticleStatus = 'draft' | 'submitted' | 'published' | 'archived';

// Annonce
type ClassifiedStatus = 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'archived';

// Réservation
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled_by_client' | 'cancelled_by_provider' | 'no_show';

// Médiation
type MediationStatus = 'opened' | 'assigned' | 'in_progress' | 'agreement_reached' | 'resolved' | 'closed' | 'failed';

// Événement
type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

// Module éducatif
type ModuleStatus = 'draft' | 'published' | 'archived';

// Projet bénévole
type VolunteerProjectStatus = 'draft' | 'recruiting' | 'in_progress' | 'completed' | 'cancelled';

// Tâche bénévole
type VolunteerTaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// Campagne de financement
type FundingCampaignStatus = 'draft' | 'active' | 'completed' | 'failed' | 'cancelled';

// Rapport de transparence
type ReportStatus = 'draft' | 'published';
```

### Types

```typescript
// Catégorie
type CategoryType = 'accommodation' | 'gastronomy' | 'activity' | 'service' | 'culture' | 'education' | 'health';

// Transaction
type TransactionType = 'credit' | 'debit' | 'commission' | 'refund' | 'donation' | 'transfer';

// Événement
type EventType = 'workshop' | 'meetup' | 'festival' | 'conference' | 'exhibition' | 'sport' | 'concert' | 'market';

// Annonce condition
type ClassifiedCondition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';

// Difficulté (sentier / éducation)
type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert';

// Médiation type
type MediationType = 'commercial' | 'interpersonal' | 'content' | 'service';

// Notification type
type NotificationType = 'review' | 'message' | 'booking' | 'moderation' | 'mediation' | 'system' | 'donation' | 'education' | 'volunteer';

// Image content type
type ImageContentType = 'place' | 'article' | 'profile' | 'event' | 'trail' | 'classified';

// Rôle
type UserRoleType = 'citizen' | 'owner' | 'author' | 'mediator' | 'educator' | 'moderator' | 'admin';

// Attribut type de valeur
type AttributeValueType = 'text' | 'number' | 'boolean' | 'select' | 'multi_select';

// Section de sous-notation (avis)
type SubRatingSection = 'cleanliness' | 'service' | 'value' | 'location' | 'atmosphere' | 'food' | 'comfort' | 'accessibility';
```

## 15.2 Catalogue des codes d'erreur

### Erreurs d'authentification (AUTH_*)

| Code | HTTP | Message | Contexte |
|---|---|---|---|
| `AUTH_UNAUTHORIZED` | 401 | Non authentifié | Token absent ou expiré |
| `AUTH_FORBIDDEN` | 403 | Accès interdit | Rôle insuffisant |
| `AUTH_INVALID_CREDENTIALS` | 401 | Identifiants invalides | Login échoué |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email non vérifié | Action requérant vérification |
| `AUTH_RATE_LIMITED` | 429 | Trop de tentatives | Rate limit atteint |
| `AUTH_ACCOUNT_BANNED` | 403 | Compte suspendu | Utilisateur banni |

### Erreurs de validation (VAL_*)

| Code | HTTP | Message | Contexte |
|---|---|---|---|
| `VAL_REQUIRED_FIELD` | 400 | Champ requis manquant | Champ obligatoire absent |
| `VAL_INVALID_FORMAT` | 400 | Format invalide | Email, téléphone, URL mal formé |
| `VAL_TOO_LONG` | 400 | Valeur trop longue | Dépassement de la longueur max |
| `VAL_TOO_SHORT` | 400 | Valeur trop courte | En dessous de la longueur min |
| `VAL_INVALID_RANGE` | 400 | Valeur hors limites | Nombre hors [min, max] |
| `VAL_DUPLICATE` | 409 | Valeur en doublon | Unicité violée (slug, email, etc.) |
| `VAL_INVALID_ENUM` | 400 | Valeur non autorisée | Valeur hors liste d'enum |
| `VAL_XSS_DETECTED` | 400 | Contenu dangereux détecté | Payload XSS intercepté |
| `VAL_SQLI_DETECTED` | 400 | Contenu dangereux détecté | Payload SQLi intercepté |

### Erreurs métier (BIZ_*)

| Code | HTTP | Message | Contexte |
|---|---|---|---|
| `BIZ_NOT_FOUND` | 404 | Ressource introuvable | Entité inexistante ou non publiée |
| `BIZ_ALREADY_EXISTS` | 409 | Déjà existant | Avis déjà posté, inscription déjà faite |
| `BIZ_INSUFFICIENT_BALANCE` | 402 | Solde insuffisant | Wallet ne couvre pas le montant |
| `BIZ_SELF_ACTION` | 403 | Action sur soi-même interdite | Auto-avis, auto-réservation, etc. |
| `BIZ_EDIT_WINDOW_EXPIRED` | 403 | Fenêtre de modification expirée | Délai 15min ou 30min dépassé |
| `BIZ_ENTITY_LOCKED` | 423 | Entité verrouillée | Thread verrouillé, cas médiation clos |
| `BIZ_CAPACITY_REACHED` | 409 | Capacité atteinte | Événement complet, tâche complète |
| `BIZ_INVALID_TRANSITION` | 422 | Transition de statut invalide | Ex: draft → published sans passer par pending |
| `BIZ_MODERATION_REQUIRED` | 403 | En attente de modération | Lieu/article/annonce non encore approuvé |
| `BIZ_CAMPAIGN_ENDED` | 410 | Campagne terminée | Don sur campagne close |
| `BIZ_THREAD_LOCKED` | 423 | Fil verrouillé | Post dans un thread verrouillé |

### Erreurs système (SYS_*)

| Code | HTTP | Message | Contexte |
|---|---|---|---|
| `SYS_INTERNAL_ERROR` | 500 | Erreur serveur | Erreur non gérée |
| `SYS_DATABASE_ERROR` | 503 | Service indisponible | Connexion DB perdue |
| `SYS_STORAGE_ERROR` | 503 | Service de stockage indisponible | S3 en panne |
| `SYS_SMTP_ERROR` | 503 | Service email indisponible | SMTP en panne |
| `SYS_TIMEOUT` | 504 | Timeout | Requête trop longue |
| `SYS_UPLOAD_FAILED` | 500 | Upload échoué | Erreur pendant le transfert |

## 15.3 Index des opérations

| ID | Nom | Section |
|---|---|---|
| OP-001 | Créer un compte utilisateur | 3.1 |
| OP-002 | Mettre à jour le profil | 3.1 |
| OP-003 | Supprimer son compte (RGPD) | 3.1 |
| OP-004 | Exporter ses données (RGPD) | 3.1 |
| OP-005 | Assigner un rôle | 3.1 |
| OP-010 | Créer une catégorie | 3.2 |
| OP-011 | Créer un tag | 3.2 |
| OP-012 | Créer une définition d'attribut | 3.2 |
| OP-020 | Soumettre un lieu | 3.3 |
| OP-021 | Approuver / Rejeter un lieu | 3.3 |
| OP-022 | Mettre à jour un lieu | 3.3 |
| OP-023 | Archiver un lieu | 3.3 |
| OP-024 | Rechercher des lieux | 3.3 |
| OP-030 | Créer un brouillon d'article | 3.4 |
| OP-031 | Soumettre un article | 3.4 |
| OP-032 | Approuver / Rejeter un article | 3.4 |
| OP-033 | Lier un lieu à un article | 3.4 |
| OP-034 | Archiver un article | 3.4 |
| OP-040 | Créer un avis | 3.5 |
| OP-041 | Modifier un avis | 3.5 |
| OP-042 | Supprimer un avis | 3.5 |
| OP-043 | Ajouter / Retirer un favori | 3.5 |
| OP-050 | Créer un sujet de forum | 3.6 |
| OP-051 | Répondre dans un fil | 3.6 |
| OP-052 | Épingler / Verrouiller un fil | 3.6 |
| OP-060 | Publier une annonce | 3.7 |
| OP-061 | Contacter un annonceur | 3.7 |
| OP-070 | Créer une conversation | 3.8 |
| OP-071 | Envoyer un message | 3.8 |
| OP-072 | Créer un événement | 3.9 |
| OP-073 | S'inscrire à un événement | 3.9 |
| OP-080 | Créditer le portefeuille | 3.10 |
| OP-081 | Transférer des fonds | 3.10 |
| OP-082 | Créer une réservation | 3.11 |
| OP-083 | Confirmer une réservation | 3.11 |
| OP-084 | Annuler une réservation | 3.11 |
| OP-090 | Ouvrir un cas de médiation | 3.12 |
| OP-091 | Assigner un médiateur | 3.12 |
| OP-092 | Planifier une session | 3.12 |
| OP-093 | Rédiger un accord | 3.12 |
| OP-094 | Signer un accord | 3.12 |
| OP-100 | Créer un module éducatif | 3.13 |
| OP-101 | Ajouter une leçon | 3.13 |
| OP-102 | Publier un module | 3.13 |
| OP-103 | S'inscrire à un module | 3.13 |
| OP-104 | Compléter une leçon | 3.13 |
| OP-110 | Créer un projet bénévole | 3.14 |
| OP-111 | Ajouter une tâche | 3.14 |
| OP-112 | S'inscrire à une tâche | 3.14 |
| OP-113 | Valider des heures | 3.14 |
| OP-120 | Créer une campagne de financement | 3.15 |
| OP-121 | Faire un don | 3.15 |
| OP-122 | Clôturer une campagne | 3.15 |
| OP-140 | Mettre à jour une métrique d'impact | 3.15 |
| OP-141 | Publier un rapport de transparence | 3.15 |

---

# 16. CHECKLISTS QUALITÉ

## 16.1 Checklist pré-implémentation (par entité)

- [ ] Table(s) et migration(s) créées
- [ ] Schema Drizzle écrit dans `src/database/schemas/`
- [ ] Schema exporté dans le barrel file `src/database/schemas.ts`
- [ ] `pnpm db:generate` exécuté sans erreur
- [ ] `pnpm db:migrate` exécuté localement
- [ ] Types TypeScript auto-générés (`astro sync`)
- [ ] Indexes de performance créés (voir Section 1.2)
- [ ] Seed data préparé (si applicable)

## 16.2 Checklist par API route

- [ ] Route créée dans `src/pages/api/`
- [ ] `export const prerender = false`
- [ ] Validation des entrées (Zod schema)
- [ ] Authentification vérifiée (`Astro.locals.user`)
- [ ] Autorisation vérifiée (RBAC + ABAC, permissions.ts)
- [ ] Rate limiting appliqué
- [ ] Headers de sécurité injectés (CSP, X-Frame-Options, etc.)
- [ ] Audit log écrit pour les opérations d'écriture
- [ ] Notifications déclenchées (side effects)
- [ ] Codes d'erreur standardisés (Section 15.2)
- [ ] Tests d'intégration écrits
- [ ] Tests de sécurité écrits
- [ ] `pnpm astro check` passe

## 16.3 Checklist par page Astro

- [ ] Fichier créé dans `src/pages/{locale}/`
- [ ] Layout approprié (BaseLayout ou DocLayout)
- [ ] Textes via i18n JSON (`src/i18n/{locale}.json`)
- [ ] Liens via `getRelativeLocaleUrl()`
- [ ] Support des 4 variantes CSS
- [ ] Accessibilité WCAG 2.2 AA :
  - [ ] Sémantique HTML (headings, landmarks, lists)
  - [ ] `alt` sur toutes les images
  - [ ] Labels sur tous les formulaires
  - [ ] Focus visible sur tous les éléments interactifs
  - [ ] Contraste vérifié (4.5:1 / 3:1)
  - [ ] Navigation clavier complète
  - [ ] ARIA attributes pour les composants dynamiques
- [ ] Responsive (320px → 2560px)
- [ ] RTL correct pour `ar`
- [ ] Meta tags (title, description, og:*)
- [ ] Pas de JavaScript client sauf nécessité justifiée
- [ ] `pnpm astro check` passe

## 16.4 Checklist par composant UI

- [ ] Props typées avec interface TypeScript
- [ ] Props `variant`, `color`, `className` supportées (si applicable)
- [ ] Rest props spreadés sur l'élément racine
- [ ] Styles scoped dans le fichier `.astro`
- [ ] Fonctionne dans les 4 variantes
- [ ] Accessible (rôle, aria-label, sémantique)
- [ ] Documenté dans la page docs correspondante
- [ ] Exemples live dans toutes les variantes

## 16.5 Checklist par domaine fonctionnel (avant merge)

- [ ] Toutes les tables créées et migrées
- [ ] Toutes les opérations (OP-*) implémentées
- [ ] Permissions vérifiées (matrice Section 2)
- [ ] Tests unitaires écrits et passent
- [ ] Tests d'intégration écrits et passent
- [ ] Tests E2E écrits et passent (si applicable)
- [ ] Tests de sécurité écrits et passent
- [ ] Seed data créé
- [ ] i18n : clés ajoutées dans les 4 fichiers JSON
- [ ] Pages créées dans les 4 locales
- [ ] Documentation docs (EN + FR) mise à jour
- [ ] `pnpm astro check` → 0 erreur
- [ ] `pnpm test:all` → 0 échec
- [ ] Couverture ≥ seuils (85/85/80)
- [ ] `pnpm run readme:generate` exécuté
- [ ] Review code complète

---

*Fin du document. Ce fichier est la source de vérité pour toute implémentation de fonctionnalité dans Concordia.*
