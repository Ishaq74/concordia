Plan: Services Module — Complétion totale + Wireframes
TL;DR — Le module services a 3 couches de problèmes critiques :

Pipeline média cassé — le MediaPickerModal écrit dans blogMedia au lieu de servicesMedia, l'API services ignore le tableau media au create/update → le cover n'est jamais sauvegardé.
Fonctionnalités admin manquantes — pas de page détail booking, pas de customer info (juste un ID tronqué), pas de thumbnails dans les tables, pas de gallery management, pas de provider response.
Org-scoping inexistant — le middleware ne met aucun organizationId dans les locals, les pages admin requêtent tous les records globalement, pas de sélecteur d'organisation dans AdminLayout.
Pages publiques loin des wireframes — pas de sidebar filtres, pas de vue calendrier bookings, pas de recherche, formulaire booking non fonctionnel (le <form> n'a ni script ni action).
Le plan Phase C couvre tout : média, admin, organisation, public.

Steps

A. Media Pipeline (correction critique)
Créer /api/admin/services/media — Clone de blog/media.ts adapté pour servicesMedia : upload dans public/uploads/services/, écriture dans table servicesMedia, mêmes validations (10MB, types image). GET pour lister. POST multipart pour upload, JSON pour delete/update metadata (caption, alt, description).

Paramétrer le MediaPickerModal — media-picker.ts a les endpoints hardcodés à media-picker.ts:217 et media-picker.ts:393. Modifier openMediaPicker() pour accepter un paramètre optionnel apiBase (par défaut /api/admin/blog/media). Les pages admin services passeront apiBase: "/api/admin/services/media".

Fixer l'API services create/update — Dans services.ts, les actions create (L136) et update (L189) ignorent le tableau media du payload. Ajouter : après insert/update du listing, supprimer les media links existants puis insérer les nouveaux depuis le tableau media dans servicesMediaLinks.

Ajouter gallery management dans edit.astro — Actuellement le edit.astro ne gère que la cover. Ajouter une section "Galerie" avec multi-sélection via MediaPickerModal, sortable positions, stockage avec type: "gallery" dans servicesMediaLinks.

Afficher les thumbnails dans les tables admin :

services/index.astro — ajouter colonne image avec thumbnail 48px depuis servicesMediaLinks cover join
categories/index.astro — ajouter colonne image depuis featuredImageId join servicesMedia
Fixer le path /uploads/{mediaId} → utiliser le champ url de servicesMedia
B. Bookings complet (détail + calendrier + customer info)
Ajouter le join customer dans l'API bookings — bookings.ts ne joint pas la table user. Ajouter un batch-fetch des users via inArray(user.id, customerIds) pour enrichir chaque booking avec customerName, customerEmail, customerImage.

Créer bookings/[id].astro — Page détail réservation :

Profil client (nom, email, avatar via join user, date inscription)
Infos booking (service, date/heure, durée, prix, statut avec timeline)
Message client + champ réponse provider (éditable, sauvegarde via PATCH)
Actions contextuelles (confirmer, annuler, compléter, no_show) avec showToast
Historique des changements de statut (si auditLog)
Wireframe ref : gestion_des_réservations_organisation panel détail
Ajouter la provider response dans l'API — Étendre le PATCH de bookings.ts pour supporter action: "respond" avec providerResponse text. Permettre aussi l'update de providerResponse dans les actions existantes.

Ajouter vue calendrier dans index.astro — Toggle liste/calendrier. La vue calendrier affiche un mois avec les bookings en points colorés par statut. Clic sur un jour → filtre la liste. Wireframe ref : gestion_des_réservations_organisation calendar view.

Enrichir index.astro liste — Ajouter : nom + email client (via batch join), lien vers page détail, date-range filter côté API (ajouter from/to params dans GET). Remplacer le customerId tronqué par le nom affiché.

C. Organisation scoping
Middleware : extraire l'org context — Dans middleware.ts authSession (~L76), lors du getSession, extraire session.activeOrganizationId et le stocker dans context.locals.organizationId. Ajouter le type dans env.d.ts.

AdminLayout : sélecteur d'organisation — Ajouter un dropdown dans le header de AdminLayout.astro qui liste les orgs de l'utilisateur (via API ou DB query). Changer d'org met à jour activeOrganizationId dans la session Better Auth. Pour les super-admins : option "Toutes les organisations".

API services : filtrer par org — Modifier services.ts GET : si locals.organizationId est set, ajouter where eq(servicesListings.organizationId, orgId). Idem pour bookings, categories. Les super-admins voient tout.

Pages admin : passer l'org context — Toutes les 6 pages admin services doivent utiliser Astro.locals.organizationId pour filtrer les queries. Le formulaire de création pré-remplit organizationId depuis le context.

D. Pages publiques — Refonte wireframes
Refonte index.astro — Conformément aux wireframes services_locaux_1 et services_locaux_2 :
Hero avec barre de recherche (query + localisation)
Section "Catégories populaires" grid avec compteurs
Section "Comment ça marche" 3 étapes
Section "Mieux notés" carousel
CTA final
Script client-side pour recherche/filtrage
Refonte services/[category].astro — Wireframe catégorie_de_services_-_liste_filtrée :
Sidebar filtres : fourchette de prix, note minimum, spécialités (tags), disponibilité
Toggle grille/liste
Tri (Pertinence, Prix, Note, Récent)
Compteur résultats
Pagination améliorée
Script client-side pour filtrage dynamique
Refonte services/[category]/[slug].astro — Wireframe services_locaux_3 :
Galerie d'images zoomable (carrousel)
Provider card complet (avatar, nom, bio, badges Vérifié/Réactif)
Section avis avec avatars + réponses provider imbriquées
Services similaires en bas
Sidebar sticky avec booking form + availability + provider card
Fixer ServiceBooking.astro — Le formulaire n'a aucun script ni action. Ajouter :
Créer un endpoint public /api/services/bookings (POST) pour créer des réservations (avec auth check)
Ajouter un <script> dans ServiceBooking qui fait un fetch au submit, vérifie auth, gère les erreurs, affiche le toast
Vérification de disponibilité côté serveur avant création
Page organisation services — Wireframe services_locaux_4 : page "Nos Services" scoped à une organisation, avec filtres par catégorie, budget, type (groupe/individuel).
E. Nettoyage i18n et verification
Compléter les clés i18n — Ajouter les clés manquantes dans les 4 locales pour : bookings detail (customer info labels, timeline labels, respond placeholder), calendar view (month names, toggle labels), media gallery (add, reorder, remove), org selector (switch org, all orgs), public filters (price range, rating, sort, availability).

Run npx astro check — Validation 0 errors sur tout le projet.

Test de bout en bout — Vérifier le flux : upload cover via MediaPickerModal services → sauvegarder via API → vérifier servicesMedia + servicesMediaLinks → vérifier affichage public via content collection loader.

Verification

npx astro check → 0 errors
Flow test : créer un service via admin avec cover + gallery → vérifier media dans DB → vérifier page publique
Flow test : créer booking via page publique → voir dans admin → changer statut → vérifier toast + customer info
Org test : switch d'org → vérifier que seuls les services de cette org sont visibles
Responsive : vérifier toutes les pages admin à 768px et 480px
Wireframe diff : comparer chaque page publique avec son wireframe screenshot
Decisions

Media dédié vs partagé : API services media séparée (confirmé) — module 100% indépendant
MediaPickerModal paramétrable : ajout d'un paramètre apiBase plutôt que duplication du composant
Booking vue calendrier : toggle dans index.astro, pas un composant séparé
Org-scoping : via middleware locals.organizationId — pas de query param
Public booking endpoint : nouveau /api/services/bookings (public, auth required)