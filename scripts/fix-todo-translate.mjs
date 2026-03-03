#!/usr/bin/env node
/**
 * scripts/fix-todo-translate.mjs
 * 
 * Replaces ALL "[TODO:translate] French text" entries with proper translations
 * in en.json, es.json, and ar.json.
 * 
 * Strategy: read fr.json as source of truth, provide real translations.
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');

// ===========================================================
// ENGLISH translations for all French source texts
// ===========================================================
const EN = {
  // --- nav ---
  "Tableau de bord": "Dashboard",
  "Administration": "Administration",
  // --- docs sidebar ---
  "Démarrage": "Getting Started",
  "Introduction": "Introduction",
  "UI Atoms": "UI Atoms",
  "UI Blocks": "UI Blocks",
  "UI Data": "UI Data",
  "UI with JavaScript": "UI with JavaScript",
  "Variantes": "Variants",
  "Layouts": "Layouts",
  "Templates": "Templates",
  "Lien": "Link",
  "Bouton": "Button",
  "Champ de saisie": "Input Field",
  "Carte": "Card",
  "Badge": "Badge",
  "Alerte": "Alert",
  "Formulaire": "Form",
  "Onglets": "Tabs",
  "NewTab": "NewTab",
  "Code": "Code",
  "Raccourci clavier": "Keyboard Shortcut",
  "Tableau": "Table",
  "Info-bulle": "Tooltip",
  "Interrupteur": "Switch",
  "Panel": "Panel",
  "Vidéo": "Video",
  "Dialogue": "Dialog",
  "Notification": "Notification",
  "Menu déroulant": "Dropdown Menu",
  "Accordéon": "Accordion",
  "Avatar": "Avatar",
  "Fil d'Ariane": "Breadcrumb",
  "Pagination": "Pagination",
  "Barre de progression": "Progress Bar",
  "Squelette": "Skeleton",
  "Galerie": "Gallery",
  "Chronologie": "Timeline",
  "Slider": "Slider",
  "Initial": "Initial",
  "Rétro": "Retro",
  "Moderne": "Modern",
  "Futuriste": "Futuristic",
  "Layout de base": "Base Layout",
  "Layout de documentation": "Documentation Layout",
  "En-tête": "Header",
  "Pied de page": "Footer",
  "Table des matières": "Table of Contents",
  "Menu dropdown": "Dropdown Menu",

  // --- docs.intro ---
  "Bienvenue dans le système de design - Guide complet des composants, variants et bonnes pratiques":
    "Welcome to the design system - Complete guide to components, variants and best practices",
  "Bienvenue dans la documentation du système de design. Cette bibliothèque propose une collection complète de composants UI avec plusieurs variants visuels pour s'adapter à différents styles et besoins.":
    "Welcome to the design system documentation. This library offers a complete collection of UI components with multiple visual variants to adapt to different styles and needs.",
  "Qu'est-ce que ce système de design ?": "What is this design system?",
  "Ce système de design est construit avec Astro et CSS natif, offrant :":
    "This design system is built with Astro and native CSS, offering:",
  "Des composants réutilisables": "Reusable components",
  "Link, Button, Input, Card, Badge, Alert, etc.": "Link, Button, Input, Card, Badge, Alert, etc.",
  "Plusieurs variants visuels": "Multiple visual variants",
  "Initial, Retro, Modern, Futuristic": "Initial, Retro, Modern, Futuristic",
  "CSS natif avec variables": "Native CSS with variables",
  "Personnalisation facile via CSS custom properties": "Easy customization via CSS custom properties",
  "Design tokens": "Design tokens",
  "Couleurs, typographie, spacing et composants": "Colors, typography, spacing and components",
  "Accessibilité": "Accessibility",
  "Construit avec les meilleures pratiques d'accessibilité": "Built with accessibility best practices",
  "Performance optimale": "Optimal performance",
  "Chargement progressif et CSS minimal": "Progressive loading and minimal CSS",
  "Structure du projet": "Project structure",
  "Le projet est organisé de manière logique pour faciliter la navigation et la maintenance :":
    "The project is logically organized to facilitate navigation and maintenance:",
  "Les variants": "Variants",
  "Chaque composant peut être affiché dans différents styles visuels appelés <strong>variants</strong>. Les quatre variants disponibles sont :":
    "Each component can be displayed in different visual styles called <strong>variants</strong>. The four available variants are:",
  "Design épuré et moderne avec des lignes nettes et des couleurs subtiles.":
    "Clean and modern design with crisp lines and subtle colors.",
  "Retro": "Retro",
  "Inspiration vintage avec des polices caractère et des couleurs nostalgiques.":
    "Vintage inspiration with character fonts and nostalgic colors.",
  "Modern": "Modern",
  "Style contemporain avec des dégradés et des effets visuels élégants.":
    "Contemporary style with gradients and elegant visual effects.",
  "Futuristic": "Futuristic",
  "Design avant-gardiste avec néon, glassmorphism et effets cyberpunk.":
    "Avant-garde design with neon, glassmorphism and cyberpunk effects.",
  "Comment utiliser": "How to use",
  "Pour utiliser un variant spécifique, passez simplement la prop <code>variant</code> au composant :":
    "To use a specific variant, simply pass the <code>variant</code> prop to the component:",
  "Mode sombre": "Dark mode",
  "Tous les composants supportent automatiquement le mode sombre. Le système détecte automatiquement la préférence de l'utilisateur et applique le thème approprié.":
    "All components automatically support dark mode. The system automatically detects user preference and applies the appropriate theme.",
  "Commencer": "Get started",
  "Explorez les différentes sections de la documentation pour découvrir tous les composants et leurs possibilités.":
    "Explore the different sections of the documentation to discover all components and their possibilities.",

  // --- docs.button ---
  "Composant Button": "Button Component",
  "Documentation complète du composant Button avec tous les variants et exemples":
    "Complete documentation of the Button component with all variants and examples",
  'Le composant <code class="inline-code">Button</code> est un bouton réutilisable qui supporte 4 variants visuels, plusieurs couleurs, des icônes et une accessibilité totale.':
    'The <code class="inline-code">Button</code> component is a reusable button that supports 4 visual variants, multiple colors, icons and full accessibility.',
  "Le composant est disponible dans": "The component is available in",
  "Type du bouton HTML": "HTML button type",
  "Style visuel du bouton": "Button visual style",
  "Couleur du bouton": "Button color",
  "Désactive le bouton": "Disables the button",
  "Icône (name et side: left | right)": "Icon (name and side: left | right)",
  "Label d'accessibilité pour lecteurs d'écran": "Accessibility label for screen readers",
  "Classes CSS additionnelles": "Additional CSS classes",

  // --- auth ---
  "Mettre à jour le profil": "Update profile",

  // --- blog ---
  "Actualités": "News",
  "Tutoriels": "Tutorials",
  "Versions": "Releases",
  "Temps de lecture": "Reading time",
  "Auteur": "Author",
  "Auteurs": "Authors",

  // --- places ---
  "Annuaire des lieux": "Places Directory",
  "Découvrez les lieux, commerces et services de votre territoire": "Discover places, shops and services in your area",
  "Rechercher un lieu...": "Search for a place...",
  "Filtres": "Filters",
  "Catégorie": "Category",
  "Type": "Type",
  "Gamme de prix": "Price range",
  "Note": "Rating",
  "Distance": "Distance",
  "Aucun lieu trouvé": "No places found",
  "Carte": "Map",
  "Liste": "List",
  "En attente de validation": "Pending review",
  "Publié": "Published",
  "Archivé": "Archived",
  "Rejeté": "Rejected",
  "Ajouter un lieu": "Add a place",
  "Modifier le lieu": "Edit place",
  "Contact": "Contact",
  "Horaires": "Hours",
  "Avis": "Reviews",
  "Écrire un avis": "Write a review",
  "Aucun avis pour le moment": "No reviews yet",
  "Ajouter aux favoris": "Add to favorites",
  "Retirer des favoris": "Remove from favorites",
  "Partager": "Share",
  "Signaler": "Report",

  // --- blog ---
  "Blog": "Blog",
  "Publications, guides et reportages sur le territoire": "Publications, guides and reports about the area",
  "À la une": "Featured",
  "Derniers billets": "Latest posts",
  "Lire la suite": "Read more",
  "Publié le": "Published on",
  "Catégories": "Categories",
  "Billets similaires": "Related articles",
  "Commentaires": "Comments",
  "Écrire un commentaire": "Write a comment",
  "Aucun billet pour le moment": "No posts yet",

  // --- forum ---
  "Forum": "Forum",
  "Échangez avec la communauté": "Engage with the community",
  "Nouveau sujet": "New thread",
  "Sujets": "Threads",
  "Messages": "Messages",
  "Réponses": "Replies",
  "Dernière activité": "Last activity",
  "Épinglé": "Pinned",
  "Verrouillé": "Locked",
  "Répondre": "Reply",
  "Aucun sujet pour le moment": "No threads yet",
  "Ce sujet est verrouillé": "This thread is locked",

  // --- events ---
  "Événements": "Events",
  "Découvrez les événements de votre territoire": "Discover events in your area",
  "Calendrier": "Calendar",
  "Prochain événement": "Next event",
  "Participer": "Attend",
  "Annuler la participation": "Cancel attendance",
  "Complet": "Full",
  "Gratuit": "Free",
  "Payant": "Paid",
  "Lieu": "Location",
  "Date": "Date",
  "Organisateur": "Organizer",
  "Participants": "Participants",
  "Ajouter au calendrier": "Add to calendar",
  "Aucun événement à venir": "No upcoming events",

  // --- services ---
  "Services": "Services",
  "Explorez les services disponibles": "Explore available services",
  "Proposer un service": "Offer a service",
  "Demander un service": "Request a service",
  "Prix": "Price",
  "Durée": "Duration",
  "Disponibilité": "Availability",
  "Réserver": "Book",
  "Aucun service disponible": "No services available",

  // --- governance ---
  "Gouvernance": "Governance",
  "Participez aux décisions de la cité-état numérique": "Participate in digital city-state decisions",
  "Propositions actives": "Active proposals",
  "Voter": "Vote",
  "Proposition": "Proposal",
  "En cours": "In progress",
  "Terminée": "Completed",
  "Rejetée": "Rejected",
  "Approuvée": "Approved",
  "Votes pour": "Votes for",
  "Votes contre": "Votes against",
  "Créer une proposition": "Create a proposal",

  // --- organizations ---
  "Organisations": "Organizations",
  "Annuaire des organisations et associations": "Directory of organizations and associations",
  "Créer une organisation": "Create an organization",
  "Membres": "Members",
  "Rejoindre": "Join",
  "Quitter": "Leave",
  "En attente": "Pending",
  "Membre": "Member",
  "Administrateur": "Administrator",
  "Modérateur": "Moderator",

  // --- common labels ---
  "Rechercher...": "Search...",
  "Chargement...": "Loading...",
  "Enregistrer": "Save",
  "Annuler": "Cancel",
  "Supprimer": "Delete",
  "Modifier": "Edit",
  "Voir plus": "See more",
  "Retour": "Back",
  "Suivant": "Next",
  "Précédent": "Previous",
  "Oui": "Yes",
  "Non": "No",
  "Confirmer": "Confirm",
  "Fermer": "Close",
  "Ouvrir": "Open",
  "Erreur": "Error",
  "Succès": "Success",
  "Attention": "Warning",
  "Information": "Information",

  // --- auth pages ---
  "/fr/auth/verifier-email": "/en/auth/verify-email",
  
  // --- catch-all for common patterns ---
  "Aucun résultat": "No results",
  "Charger plus": "Load more",
  "Menu": "Menu",
  "Profil": "Profile",
  "Paramètres": "Settings",
  "Déconnexion": "Log out",
  "Connexion": "Log in",
  "Inscription": "Sign up",
};

// ===========================================================
// SPANISH translations
// ===========================================================
const ES = {
  "Tableau de bord": "Panel de control",
  "Administration": "Administración",
  "Démarrage": "Inicio",
  "Introduction": "Introducción",
  "UI Atoms": "Átomos UI",
  "UI Blocks": "Bloques UI",
  "UI Data": "Datos UI",
  "UI with JavaScript": "UI con JavaScript",
  "Variantes": "Variantes",
  "Layouts": "Layouts",
  "Templates": "Plantillas",
  "Lien": "Enlace",
  "Bouton": "Botón",
  "Champ de saisie": "Campo de entrada",
  "Carte": "Tarjeta",
  "Badge": "Insignia",
  "Alerte": "Alerta",
  "Formulaire": "Formulario",
  "Onglets": "Pestañas",
  "NewTab": "NewTab",
  "Code": "Código",
  "Raccourci clavier": "Atajo de teclado",
  "Tableau": "Tabla",
  "Info-bulle": "Tooltip",
  "Interrupteur": "Interruptor",
  "Panel": "Panel",
  "Vidéo": "Video",
  "Dialogue": "Diálogo",
  "Notification": "Notificación",
  "Menu déroulant": "Menú desplegable",
  "Accordéon": "Acordeón",
  "Avatar": "Avatar",
  "Fil d'Ariane": "Migas de pan",
  "Pagination": "Paginación",
  "Barre de progression": "Barra de progreso",
  "Squelette": "Esqueleto",
  "Galerie": "Galería",
  "Chronologie": "Línea de tiempo",
  "Slider": "Slider",
  "Initial": "Inicial",
  "Rétro": "Retro",
  "Moderne": "Moderno",
  "Futuriste": "Futurista",
  "Layout de base": "Layout base",
  "Layout de documentation": "Layout de documentación",
  "En-tête": "Encabezado",
  "Pied de page": "Pie de página",
  "Table des matières": "Tabla de contenidos",
  "Menu dropdown": "Menú desplegable",

  // docs.intro
  "Bienvenue dans le système de design - Guide complet des composants, variants et bonnes pratiques":
    "Bienvenido al sistema de diseño - Guía completa de componentes, variantes y buenas prácticas",
  "Bienvenue dans la documentation du système de design. Cette bibliothèque propose une collection complète de composants UI avec plusieurs variants visuels pour s'adapter à différents styles et besoins.":
    "Bienvenido a la documentación del sistema de diseño. Esta biblioteca ofrece una colección completa de componentes UI con múltiples variantes visuales para adaptarse a diferentes estilos y necesidades.",
  "Qu'est-ce que ce système de design ?": "¿Qué es este sistema de diseño?",
  "Ce système de design est construit avec Astro et CSS natif, offrant :":
    "Este sistema de diseño está construido con Astro y CSS nativo, ofreciendo:",
  "Des composants réutilisables": "Componentes reutilizables",
  "Link, Button, Input, Card, Badge, Alert, etc.": "Link, Button, Input, Card, Badge, Alert, etc.",
  "Plusieurs variants visuels": "Múltiples variantes visuales",
  "Initial, Retro, Modern, Futuristic": "Initial, Retro, Modern, Futuristic",
  "CSS natif avec variables": "CSS nativo con variables",
  "Personnalisation facile via CSS custom properties": "Personalización fácil mediante CSS custom properties",
  "Design tokens": "Design tokens",
  "Couleurs, typographie, spacing et composants": "Colores, tipografía, espaciado y componentes",
  "Accessibilité": "Accesibilidad",
  "Construit avec les meilleures pratiques d'accessibilité": "Construido con las mejores prácticas de accesibilidad",
  "Performance optimale": "Rendimiento óptimo",
  "Chargement progressif et CSS minimal": "Carga progresiva y CSS mínimo",
  "Structure du projet": "Estructura del proyecto",
  "Le projet est organisé de manière logique pour faciliter la navigation et la maintenance :":
    "El proyecto está organizado de manera lógica para facilitar la navegación y el mantenimiento:",
  "Les variants": "Las variantes",
  "Chaque composant peut être affiché dans différents styles visuels appelés <strong>variants</strong>. Les quatre variants disponibles sont :":
    "Cada componente puede mostrarse en diferentes estilos visuales llamados <strong>variantes</strong>. Las cuatro variantes disponibles son:",
  "Design épuré et moderne avec des lignes nettes et des couleurs subtiles.":
    "Diseño limpio y moderno con líneas nítidas y colores sutiles.",
  "Retro": "Retro",
  "Inspiration vintage avec des polices caractère et des couleurs nostalgiques.":
    "Inspiración vintage con tipografías con carácter y colores nostálgicos.",
  "Modern": "Moderno",
  "Style contemporain avec des dégradés et des effets visuels élégants.":
    "Estilo contemporáneo con degradados y efectos visuales elegantes.",
  "Futuristic": "Futurista",
  "Design avant-gardiste avec néon, glassmorphism et effets cyberpunk.":
    "Diseño vanguardista con neón, glassmorphism y efectos cyberpunk.",
  "Comment utiliser": "Cómo usar",
  "Pour utiliser un variant spécifique, passez simplement la prop <code>variant</code> au composant :":
    "Para usar una variante específica, simplemente pase la prop <code>variant</code> al componente:",
  "Mode sombre": "Modo oscuro",
  "Tous les composants supportent automatiquement le mode sombre. Le système détecte automatiquement la préférence de l'utilisateur et applique le thème approprié.":
    "Todos los componentes soportan automáticamente el modo oscuro. El sistema detecta automáticamente la preferencia del usuario y aplica el tema apropiado.",
  "Commencer": "Comenzar",
  "Explorez les différentes sections de la documentation pour découvrir tous les composants et leurs possibilités.":
    "Explore las diferentes secciones de la documentación para descubrir todos los componentes y sus posibilidades.",

  // docs.button
  "Composant Button": "Componente Button",
  "Documentation complète du composant Button avec tous les variants et exemples":
    "Documentación completa del componente Button con todas las variantes y ejemplos",
  'Le composant <code class="inline-code">Button</code> est un bouton réutilisable qui supporte 4 variants visuels, plusieurs couleurs, des icônes et une accessibilité totale.':
    'El componente <code class="inline-code">Button</code> es un botón reutilizable que soporta 4 variantes visuales, múltiples colores, iconos y accesibilidad completa.',
  "Le composant est disponible dans": "El componente está disponible en",
  "Type du bouton HTML": "Tipo de botón HTML",
  "Style visuel du bouton": "Estilo visual del botón",
  "Couleur du bouton": "Color del botón",
  "Désactive le bouton": "Desactiva el botón",
  "Icône (name et side: left | right)": "Icono (nombre y lado: left | right)",
  "Label d'accessibilité pour lecteurs d'écran": "Etiqueta de accesibilidad para lectores de pantalla",
  "Classes CSS additionnelles": "Clases CSS adicionales",

  // auth
  "Mettre à jour le profil": "Actualizar perfil",

  // blog
  "Actualités": "Noticias",
  "Tutoriels": "Tutoriales",
  "Versions": "Versiones",
  "Temps de lecture": "Tiempo de lectura",
  "Auteur": "Autor",
  "Auteurs": "Autores",

  // places
  "Annuaire des lieux": "Directorio de lugares",
  "Découvrez les lieux, commerces et services de votre territoire": "Descubra los lugares, comercios y servicios de su territorio",
  "Rechercher un lieu...": "Buscar un lugar...",
  "Filtres": "Filtros",
  "Catégorie": "Categoría",
  "Type": "Tipo",
  "Gamme de prix": "Rango de precios",
  "Note": "Nota",
  "Distance": "Distancia",
  "Aucun lieu trouvé": "Ningún lugar encontrado",
  "Carte": "Mapa",
  "Liste": "Lista",
  "En attente de validation": "Pendiente de validación",
  "Publié": "Publicado",
  "Archivé": "Archivado",
  "Rejeté": "Rechazado",
  "Ajouter un lieu": "Añadir un lugar",
  "Modifier le lieu": "Editar lugar",
  "Contact": "Contacto",
  "Horaires": "Horarios",
  "Avis": "Opiniones",
  "Écrire un avis": "Escribir una opinión",
  "Aucun avis pour le moment": "Ninguna opinión por el momento",
  "Ajouter aux favoris": "Añadir a favoritos",
  "Retirer des favoris": "Quitar de favoritos",
  "Partager": "Compartir",
  "Signaler": "Reportar",

  // blog
  "Blog": "Blog",
  "Publications, guides et reportages sur le territoire": "Publicaciones, guías y reportajes sobre el territorio",
  "À la une": "Destacados",
  "Derniers billets": "Últimas publicaciones",
  "Lire la suite": "Leer más",
  "Publié le": "Publicado el",
  "Catégories": "Categorías",
  "Billets similaires": "Artículos relacionados",
  "Commentaires": "Comentarios",
  "Écrire un commentaire": "Escribir un comentario",
  "Aucun billet pour le moment": "Ninguna publicación por el momento",

  // forum
  "Forum": "Foro",
  "Échangez avec la communauté": "Intercambie con la comunidad",
  "Nouveau sujet": "Nuevo tema",
  "Sujets": "Temas",
  "Messages": "Mensajes",
  "Réponses": "Respuestas",
  "Dernière activité": "Última actividad",
  "Épinglé": "Fijado",
  "Verrouillé": "Bloqueado",
  "Répondre": "Responder",
  "Aucun sujet pour le moment": "Ningún tema por el momento",
  "Ce sujet est verrouillé": "Este tema está bloqueado",

  // events
  "Événements": "Eventos",
  "Découvrez les événements de votre territoire": "Descubra los eventos de su territorio",
  "Calendrier": "Calendario",
  "Prochain événement": "Próximo evento",
  "Participer": "Participar",
  "Annuler la participation": "Cancelar participación",
  "Complet": "Completo",
  "Gratuit": "Gratuito",
  "Payant": "De pago",
  "Lieu": "Lugar",
  "Date": "Fecha",
  "Organisateur": "Organizador",
  "Participants": "Participantes",
  "Ajouter au calendrier": "Añadir al calendario",
  "Aucun événement à venir": "Ningún evento próximo",

  // services
  "Services": "Servicios",
  "Explorez les services disponibles": "Explore los servicios disponibles",
  "Proposer un service": "Ofrecer un servicio",
  "Demander un service": "Solicitar un servicio",
  "Prix": "Precio",
  "Durée": "Duración",
  "Disponibilité": "Disponibilidad",
  "Réserver": "Reservar",
  "Aucun service disponible": "Ningún servicio disponible",

  // governance
  "Gouvernance": "Gobernanza",
  "Participez aux décisions de la cité-état numérique": "Participe en las decisiones de la ciudad-estado digital",
  "Propositions actives": "Propuestas activas",
  "Voter": "Votar",
  "Proposition": "Propuesta",
  "En cours": "En curso",
  "Terminée": "Terminada",
  "Rejetée": "Rechazada",
  "Approuvée": "Aprobada",
  "Votes pour": "Votos a favor",
  "Votes contre": "Votos en contra",
  "Créer une proposition": "Crear una propuesta",

  // organizations
  "Organisations": "Organizaciones",
  "Annuaire des organisations et associations": "Directorio de organizaciones y asociaciones",
  "Créer une organisation": "Crear una organización",
  "Membres": "Miembros",
  "Rejoindre": "Unirse",
  "Quitter": "Salir",
  "En attente": "Pendiente",
  "Membre": "Miembro",
  "Administrateur": "Administrador",
  "Modérateur": "Moderador",

  // common
  "Rechercher...": "Buscar...",
  "Chargement...": "Cargando...",
  "Enregistrer": "Guardar",
  "Annuler": "Cancelar",
  "Supprimer": "Eliminar",
  "Modifier": "Editar",
  "Voir plus": "Ver más",
  "Retour": "Volver",
  "Suivant": "Siguiente",
  "Précédent": "Anterior",
  "Oui": "Sí",
  "Non": "No",
  "Confirmer": "Confirmar",
  "Fermer": "Cerrar",
  "Ouvrir": "Abrir",
  "Erreur": "Error",
  "Succès": "Éxito",
  "Attention": "Atención",
  "Information": "Información",

  "/fr/auth/verifier-email": "/es/auth/verificar-email",
  "Aucun résultat": "Sin resultados",
  "Charger plus": "Cargar más",
  "Menu": "Menú",
  "Profil": "Perfil",
  "Paramètres": "Configuración",
  "Déconnexion": "Cerrar sesión",
  "Connexion": "Iniciar sesión",
  "Inscription": "Registrarse",
};

// ===========================================================
// ARABIC translations
// ===========================================================
const AR = {
  "Tableau de bord": "لوحة التحكم",
  "Administration": "الإدارة",
  "Démarrage": "البداية",
  "Introduction": "مقدمة",
  "UI Atoms": "ذرات واجهة المستخدم",
  "UI Blocks": "كتل واجهة المستخدم",
  "UI Data": "بيانات واجهة المستخدم",
  "UI with JavaScript": "واجهة المستخدم مع JavaScript",
  "Variantes": "المتغيرات",
  "Layouts": "التخطيطات",
  "Templates": "القوالب",
  "Lien": "رابط",
  "Bouton": "زر",
  "Champ de saisie": "حقل الإدخال",
  "Carte": "بطاقة",
  "Badge": "شارة",
  "Alerte": "تنبيه",
  "Formulaire": "نموذج",
  "Onglets": "علامات التبويب",
  "NewTab": "علامة تبويب جديدة",
  "Code": "كود",
  "Raccourci clavier": "اختصار لوحة المفاتيح",
  "Tableau": "جدول",
  "Info-bulle": "تلميح",
  "Interrupteur": "مفتاح",
  "Panel": "لوحة",
  "Vidéo": "فيديو",
  "Dialogue": "حوار",
  "Notification": "إشعار",
  "Menu déroulant": "قائمة منسدلة",
  "Accordéon": "أكورديون",
  "Avatar": "صورة رمزية",
  "Fil d'Ariane": "مسار التنقل",
  "Pagination": "ترقيم الصفحات",
  "Barre de progression": "شريط التقدم",
  "Squelette": "هيكل",
  "Galerie": "معرض",
  "Chronologie": "خط زمني",
  "Slider": "شريط منزلق",
  "Initial": "أولي",
  "Rétro": "كلاسيكي",
  "Moderne": "حديث",
  "Futuriste": "مستقبلي",
  "Layout de base": "التخطيط الأساسي",
  "Layout de documentation": "تخطيط التوثيق",
  "En-tête": "رأس الصفحة",
  "Pied de page": "تذييل الصفحة",
  "Table des matières": "جدول المحتويات",
  "Menu dropdown": "قائمة منسدلة",

  // docs.intro
  "Bienvenue dans le système de design - Guide complet des composants, variants et bonnes pratiques":
    "مرحبًا في نظام التصميم - دليل شامل للمكونات والمتغيرات وأفضل الممارسات",
  "Bienvenue dans la documentation du système de design. Cette bibliothèque propose une collection complète de composants UI avec plusieurs variants visuels pour s'adapter à différents styles et besoins.":
    "مرحبًا في توثيق نظام التصميم. تقدم هذه المكتبة مجموعة كاملة من مكونات واجهة المستخدم مع متغيرات بصرية متعددة للتكيف مع الأنماط والاحتياجات المختلفة.",
  "Qu'est-ce que ce système de design ?": "ما هو نظام التصميم هذا؟",
  "Ce système de design est construit avec Astro et CSS natif, offrant :":
    "تم بناء نظام التصميم هذا باستخدام Astro و CSS الأصلي، ويقدم:",
  "Des composants réutilisables": "مكونات قابلة لإعادة الاستخدام",
  "Link, Button, Input, Card, Badge, Alert, etc.": "Link, Button, Input, Card, Badge, Alert, إلخ.",
  "Plusieurs variants visuels": "متغيرات بصرية متعددة",
  "Initial, Retro, Modern, Futuristic": "Initial, Retro, Modern, Futuristic",
  "CSS natif avec variables": "CSS أصلي مع متغيرات",
  "Personnalisation facile via CSS custom properties": "تخصيص سهل عبر خصائص CSS المخصصة",
  "Design tokens": "رموز التصميم",
  "Couleurs, typographie, spacing et composants": "ألوان، خطوط، تباعد ومكونات",
  "Accessibilité": "إمكانية الوصول",
  "Construit avec les meilleures pratiques d'accessibilité": "مبني وفق أفضل ممارسات إمكانية الوصول",
  "Performance optimale": "أداء مثالي",
  "Chargement progressif et CSS minimal": "تحميل تدريجي و CSS بسيط",
  "Structure du projet": "هيكل المشروع",
  "Le projet est organisé de manière logique pour faciliter la navigation et la maintenance :":
    "المشروع منظم بطريقة منطقية لتسهيل التصفح والصيانة:",
  "Les variants": "المتغيرات",
  "Chaque composant peut être affiché dans différents styles visuels appelés <strong>variants</strong>. Les quatre variants disponibles sont :":
    "يمكن عرض كل مكون بأنماط بصرية مختلفة تسمى <strong>المتغيرات</strong>. المتغيرات الأربعة المتاحة هي:",
  "Design épuré et moderne avec des lignes nettes et des couleurs subtiles.":
    "تصميم نظيف وعصري بخطوط واضحة وألوان رقيقة.",
  "Retro": "كلاسيكي",
  "Inspiration vintage avec des polices caractère et des couleurs nostalgiques.":
    "إلهام كلاسيكي بخطوط مميزة وألوان حنين.",
  "Modern": "حديث",
  "Style contemporain avec des dégradés et des effets visuels élégants.":
    "أسلوب معاصر مع تدرجات وتأثيرات بصرية أنيقة.",
  "Futuristic": "مستقبلي",
  "Design avant-gardiste avec néon, glassmorphism et effets cyberpunk.":
    "تصميم طليعي مع نيون وتأثيرات زجاجية وسايبربانك.",
  "Comment utiliser": "كيفية الاستخدام",
  "Pour utiliser un variant spécifique, passez simplement la prop <code>variant</code> au composant :":
    "لاستخدام متغير محدد، ما عليك سوى تمرير خاصية <code>variant</code> إلى المكون:",
  "Mode sombre": "الوضع الداكن",
  "Tous les composants supportent automatiquement le mode sombre. Le système détecte automatiquement la préférence de l'utilisateur et applique le thème approprié.":
    "جميع المكونات تدعم الوضع الداكن تلقائيًا. يكتشف النظام تلقائيًا تفضيل المستخدم ويطبق السمة المناسبة.",
  "Commencer": "ابدأ",
  "Explorez les différentes sections de la documentation pour découvrir tous les composants et leurs possibilités.":
    "استكشف الأقسام المختلفة من التوثيق لاكتشاف جميع المكونات وإمكانياتها.",

  // docs.button
  "Composant Button": "مكون الزر",
  "Documentation complète du composant Button avec tous les variants et exemples":
    "توثيق كامل لمكون الزر مع جميع المتغيرات والأمثلة",
  'Le composant <code class="inline-code">Button</code> est un bouton réutilisable qui supporte 4 variants visuels, plusieurs couleurs, des icônes et une accessibilité totale.':
    'مكون <code class="inline-code">Button</code> هو زر قابل لإعادة الاستخدام يدعم 4 متغيرات بصرية وألوان متعددة وأيقونات وإمكانية وصول كاملة.',
  "Le composant est disponible dans": "المكون متوفر في",
  "Type du bouton HTML": "نوع زر HTML",
  "Style visuel du bouton": "النمط البصري للزر",
  "Couleur du bouton": "لون الزر",
  "Désactive le bouton": "يعطل الزر",
  "Icône (name et side: left | right)": "أيقونة (الاسم والجانب: left | right)",
  "Label d'accessibilité pour lecteurs d'écran": "تسمية إمكانية الوصول لقارئات الشاشة",
  "Classes CSS additionnelles": "فئات CSS إضافية",

  // auth
  "Mettre à jour le profil": "تحديث الملف الشخصي",

  // blog
  "Actualités": "أخبار",
  "Tutoriels": "دروس تعليمية",
  "Versions": "إصدارات",
  "Temps de lecture": "وقت القراءة",
  "Auteur": "مؤلف",
  "Auteurs": "مؤلفون",

  // places
  "Annuaire des lieux": "دليل الأماكن",
  "Découvrez les lieux, commerces et services de votre territoire": "اكتشف الأماكن والمتاجر والخدمات في منطقتك",
  "Rechercher un lieu...": "البحث عن مكان...",
  "Filtres": "تصفيات",
  "Catégorie": "فئة",
  "Type": "نوع",
  "Gamme de prix": "نطاق الأسعار",
  "Note": "تقييم",
  "Distance": "المسافة",
  "Aucun lieu trouvé": "لم يتم العثور على أماكن",
  "Carte": "خريطة",
  "Liste": "قائمة",
  "En attente de validation": "في انتظار المراجعة",
  "Publié": "منشور",
  "Archivé": "مؤرشف",
  "Rejeté": "مرفوض",
  "Ajouter un lieu": "إضافة مكان",
  "Modifier le lieu": "تعديل المكان",
  "Contact": "اتصال",
  "Horaires": "المواعيد",
  "Avis": "آراء",
  "Écrire un avis": "كتابة رأي",
  "Aucun avis pour le moment": "لا توجد آراء حتى الآن",
  "Ajouter aux favoris": "إضافة إلى المفضلة",
  "Retirer des favoris": "إزالة من المفضلة",
  "Partager": "مشاركة",
  "Signaler": "إبلاغ",

  // blog
  "Blog": "مدونة",
  "Publications, guides et reportages sur le territoire": "منشورات وأدلة وتقارير عن المنطقة",
  "À la une": "المميزة",
  "Derniers billets": "آخر المنشورات",
  "Lire la suite": "اقرأ المزيد",
  "Publié le": "نُشر في",
  "Catégories": "الفئات",
  "Billets similaires": "مقالات مشابهة",
  "Commentaires": "تعليقات",
  "Écrire un commentaire": "كتابة تعليق",
  "Aucun billet pour le moment": "لا توجد منشورات حتى الآن",

  // forum
  "Forum": "منتدى",
  "Échangez avec la communauté": "تبادل مع المجتمع",
  "Nouveau sujet": "موضوع جديد",
  "Sujets": "المواضيع",
  "Messages": "الرسائل",
  "Réponses": "الردود",
  "Dernière activité": "آخر نشاط",
  "Épinglé": "مثبت",
  "Verrouillé": "مقفل",
  "Répondre": "الرد",
  "Aucun sujet pour le moment": "لا توجد مواضيع حتى الآن",
  "Ce sujet est verrouillé": "هذا الموضوع مقفل",

  // events
  "Événements": "فعاليات",
  "Découvrez les événements de votre territoire": "اكتشف فعاليات منطقتك",
  "Calendrier": "التقويم",
  "Prochain événement": "الفعالية القادمة",
  "Participer": "المشاركة",
  "Annuler la participation": "إلغاء المشاركة",
  "Complet": "مكتمل",
  "Gratuit": "مجاني",
  "Payant": "مدفوع",
  "Lieu": "المكان",
  "Date": "التاريخ",
  "Organisateur": "المنظم",
  "Participants": "المشاركون",
  "Ajouter au calendrier": "إضافة إلى التقويم",
  "Aucun événement à venir": "لا توجد فعاليات قادمة",

  // services
  "Services": "خدمات",
  "Explorez les services disponibles": "استكشف الخدمات المتاحة",
  "Proposer un service": "عرض خدمة",
  "Demander un service": "طلب خدمة",
  "Prix": "السعر",
  "Durée": "المدة",
  "Disponibilité": "التوفر",
  "Réserver": "الحجز",
  "Aucun service disponible": "لا توجد خدمات متاحة",

  // governance
  "Gouvernance": "الحوكمة",
  "Participez aux décisions de la cité-état numérique": "شارك في قرارات الدولة-المدينة الرقمية",
  "Propositions actives": "المقترحات النشطة",
  "Voter": "تصويت",
  "Proposition": "مقترح",
  "En cours": "قيد التنفيذ",
  "Terminée": "مكتملة",
  "Rejetée": "مرفوضة",
  "Approuvée": "موافق عليها",
  "Votes pour": "أصوات مع",
  "Votes contre": "أصوات ضد",
  "Créer une proposition": "إنشاء مقترح",

  // organizations
  "Organisations": "المنظمات",
  "Annuaire des organisations et associations": "دليل المنظمات والجمعيات",
  "Créer une organisation": "إنشاء منظمة",
  "Membres": "الأعضاء",
  "Rejoindre": "الانضمام",
  "Quitter": "المغادرة",
  "En attente": "قيد الانتظار",
  "Membre": "عضو",
  "Administrateur": "مدير",
  "Modérateur": "مشرف",

  // common
  "Rechercher...": "بحث...",
  "Chargement...": "جارٍ التحميل...",
  "Enregistrer": "حفظ",
  "Annuler": "إلغاء",
  "Supprimer": "حذف",
  "Modifier": "تعديل",
  "Voir plus": "عرض المزيد",
  "Retour": "رجوع",
  "Suivant": "التالي",
  "Précédent": "السابق",
  "Oui": "نعم",
  "Non": "لا",
  "Confirmer": "تأكيد",
  "Fermer": "إغلاق",
  "Ouvrir": "فتح",
  "Erreur": "خطأ",
  "Succès": "نجاح",
  "Attention": "تحذير",
  "Information": "معلومات",

  "/fr/auth/verifier-email": "/ar/auth/verify-email",
  "Aucun résultat": "لا توجد نتائج",
  "Charger plus": "تحميل المزيد",
  "Menu": "القائمة",
  "Profil": "الملف الشخصي",
  "Paramètres": "الإعدادات",
  "Déconnexion": "تسجيل الخروج",
  "Connexion": "تسجيل الدخول",
  "Inscription": "إنشاء حساب",
};

// ===========================================================
// Main: process each locale
// ===========================================================
function translateValue(value, translations) {
  if (typeof value !== 'string') return value;
  if (!value.startsWith('[TODO:translate] ')) return value;
  
  const frText = value.replace('[TODO:translate] ', '');
  
  // Look up in translations dict
  if (translations[frText]) {
    return translations[frText];
  }
  
  // Try trimmed
  const trimmed = frText.trim();
  if (translations[trimmed]) {
    return translations[trimmed];
  }
  
  // Not found — return as WARNING
  return `[MISSING] ${frText}`;
}

function processObj(obj, translations) {
  let count = 0;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string' && obj[key].includes('[TODO:translate]')) {
      const result = translateValue(obj[key], translations);
      obj[key] = result;
      count++;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += processObj(obj[key], translations);
    }
  }
  return count;
}

const LOCALE_MAP = {
  'en': EN,
  'es': ES,
  'ar': AR,
};

let totalFixed = 0;

for (const [locale, translations] of Object.entries(LOCALE_MAP)) {
  const filePath = path.join(I18N_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const fixed = processObj(data, translations);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✅ ${locale}.json: ${fixed} translations fixed`);
  totalFixed += fixed;
  
  // Check for any remaining
  const remaining = JSON.stringify(data).match(/\[TODO:translate\]/g);
  const missing = JSON.stringify(data).match(/\[MISSING\]/g);
  if (remaining) console.log(`   ⚠️ ${remaining.length} still have [TODO:translate]`);
  if (missing) console.log(`   ⚠️ ${missing.length} marked [MISSING] (need manual translation)`);
}

console.log(`\n📊 Total: ${totalFixed} translations fixed`);

// Final count
for (const locale of ['en', 'es', 'ar']) {
  const content = fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf8');
  const todo = (content.match(/TODO:translate/g) || []).length;
  const missing = (content.match(/\[MISSING\]/g) || []).length;
  console.log(`  ${locale}.json: ${todo} TODO remaining, ${missing} MISSING`);
}
