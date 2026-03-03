#!/usr/bin/env node
/**
 * scripts/i18n-docs-phase5b-tablecell.mjs
 * Phase 5b: Fix ALL remaining hardcoded TableCell/td descriptions
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');
const DOCS_BASE = path.join('src', 'pages', '[lang]', 'docs');

// ============================================================
// Additional common keys (cross-file patterns)
// ============================================================
const COMMON_KEYS = {
  descComponentSize:  { fr: "Taille du composant", en: "Component size", es: "Tamaño del componente", ar: "حجم المكون" },
  descVisualStyleVar: { fr: "Variante de style visuel", en: "Visual style variant", es: "Variante de estilo visual", ar: "متغير النمط البصري" },
  descAccentColor:    { fr: "Couleur d'accentuation", en: "Accent color", es: "Color de acento", ar: "لون التمييز" },
  descOpensDefault:   { fr: "Ouvert par défaut", en: "Opens by default", es: "Abierto por defecto", ar: "مفتوح بشكل افتراضي" },
  descActivePageColor:{ fr: "Couleur de la page active", en: "Active page color", es: "Color de la página activa", ar: "لون الصفحة النشطة" },
  descShowControls:   { fr: "Afficher les contrôles natifs", en: "Show native controls", es: "Mostrar controles nativos", ar: "إظهار عناصر التحكم الأصلية" },
  descAutoplay:       { fr: "Lecture automatique", en: "Autoplay", es: "Reproducción automática", ar: "تشغيل تلقائي" },
  descLoopPlayback:   { fr: "Lecture en boucle", en: "Loop playback", es: "Reproducción en bucle", ar: "تشغيل متكرر" },
  descMutedVideo:     { fr: "Vidéo en sourdine", en: "Muted video", es: "Video silenciado", ar: "فيديو صامت" },
  descShowPercentage: { fr: "Afficher le pourcentage", en: "Show percentage", es: "Mostrar porcentaje", ar: "إظهار النسبة المئوية" },
  descShowCaptions:   { fr: "Afficher les légendes", en: "Show captions", es: "Mostrar subtítulos", ar: "إظهار التسميات التوضيحية" },
  descHtmlElement:    { fr: "Élément HTML à afficher", en: "HTML element to render", es: "Elemento HTML a renderizar", ar: "عنصر HTML للعرض" },
  descDestinationUrl: { fr: "URL de destination", en: "Destination URL", es: "URL de destino", ar: "رابط الوجهة" },
  descOpensNewTab:    { fr: "Ouvre dans un nouvel onglet", en: "Opens in new tab", es: "Abre en nueva pestaña", ar: "يفتح في علامة تبويب جديدة" },
  descDocPageTitle:   { fr: "Titre de la page de documentation", en: "Documentation page title", es: "Título de la página de documentación", ar: "عنوان صفحة التوثيق" },
  descPageMetaDesc:   { fr: "Description meta de la page", en: "Page meta description", es: "Descripción meta de la página", ar: "وصف ميتا للصفحة" },
  descDocVisualStyle: { fr: "Style visuel de la documentation", en: "Visual style of the documentation", es: "Estilo visual de la documentación", ar: "النمط البصري للتوثيق" },
  descNavItems:       { fr: "Liste des éléments de navigation", en: "List of navigation items", es: "Lista de elementos de navegación", ar: "قائمة عناصر التنقل" },
  descComponentTitle: { fr: "Titre du composant", en: "Component title", es: "Título del componente", ar: "عنوان المكون" },
  descPreloadStrategy:{ fr: "Stratégie de préchargement", en: "Preload strategy", es: "Estrategia de precarga", ar: "استراتيجية التحميل المسبق" },
  descPlayerWidth:    { fr: "Largeur du lecteur", en: "Player width", es: "Ancho del reproductor", ar: "عرض المشغل" },
  descPlayerHeight:   { fr: "Hauteur du lecteur", en: "Player height", es: "Altura del reproductor", ar: "ارتفاع المشغل" },
  descPreviewImage:   { fr: "Image de prévisualisation avant lecture", en: "Preview image before playback", es: "Imagen de vista previa antes de la reproducción", ar: "صورة المعاينة قبل التشغيل" },
  descVideoVisual:    { fr: "Style visuel du lecteur vidéo", en: "The visual style of the video player", es: "El estilo visual del reproductor de video", ar: "النمط البصري لمشغل الفيديو" },
  descButtonSize:     { fr: "Taille des boutons", en: "Button size", es: "Tamaño de los botones", ar: "حجم الأزرار" },
  descPulseAnimation: { fr: "Active l'animation de pulsation", en: "Enables pulse animation", es: "Activa la animación de pulso", ar: "تفعيل حركة النبض" },
  descCountToDisplay: { fr: "Nombre d'éléments à afficher", en: "Number of items to display", es: "Número de elementos a mostrar", ar: "عدد العناصر للعرض" },
  descRoundedCorners: { fr: "Applique des coins arrondis", en: "Applies rounded corners", es: "Aplica esquinas redondeadas", ar: "يطبق زوايا مستديرة" },
  descRenderCircle:   { fr: "Affiche le skeleton en cercle", en: "Renders the skeleton as a circle", es: "Renderiza el skeleton como un círculo", ar: "يعرض الهيكل على شكل دائرة" },
  descScrollSpeed:    { fr: "Vitesse de défilement (en secondes)", en: "Scroll speed (in seconds)", es: "Velocidad de desplazamiento (en segundos)", ar: "سرعة التمرير (بالثواني)" },
  descPauseOnHover:   { fr: "Pause au survol", en: "Pause on hover", es: "Pausar al pasar el cursor", ar: "إيقاف مؤقت عند التمرير" },
  descShowNavButtons: { fr: "Afficher les boutons de navigation", en: "Show navigation buttons", es: "Mostrar botones de navegación", ar: "إظهار أزرار التنقل" },
  descEnableSnap:     { fr: "Activer le snap-scroll", en: "Enable snap-scroll", es: "Activar snap-scroll", ar: "تفعيل التمرير المفاجئ" },
  descShowScrollbar:  { fr: "Afficher la barre de défilement", en: "Show scrollbar", es: "Mostrar barra de desplazamiento", ar: "إظهار شريط التمرير" },
  descEnableAutoScroll: { fr: "Activer le défilement automatique", en: "Enable automatic scrolling", es: "Activar desplazamiento automático", ar: "تفعيل التمرير التلقائي" },
  descMinItemWidth:   { fr: "Largeur minimale des éléments", en: "Minimum width of items", es: "Ancho mínimo de los elementos", ar: "الحد الأدنى لعرض العناصر" },
  descSpaceBetween:   { fr: "Espacement entre les éléments", en: "Space between items", es: "Espacio entre elementos", ar: "المسافة بين العناصر" },
  descColorScheme:    { fr: "Palette de couleurs du slider", en: "Color scheme of the slider", es: "Esquema de colores del slider", ar: "مخطط ألوان المنزلق" },
  descShowPrevNext:   { fr: "Afficher les boutons précédent/suivant", en: "Show previous/next buttons", es: "Mostrar botones anterior/siguiente", ar: "إظهار أزرار السابق/التالي" },
  descSiblingPages:   { fr: "Nombre de pages de chaque côté de la page actuelle", en: "Number of pages on each side of the current page", es: "Número de páginas a cada lado de la página actual", ar: "عدد الصفحات على كل جانب من الصفحة الحالية" },
  descEventsArray:    { fr: "Tableau d'événements à afficher", en: "Array of events to display", es: "Array de eventos a mostrar", ar: "مصفوفة الأحداث للعرض" },
};

// ============================================================
// Per-file unique keys → page-specific
// ============================================================
const PAGE_KEYS = {
  badge: {
    descBadgeVisual:  { fr: "Style visuel du badge", en: "Badge visual style", es: "Estilo visual de la insignia", ar: "النمط البصري للشارة" },
    descBadgeColor:   { fr: "Couleur du badge", en: "Badge color", es: "Color de la insignia", ar: "لون الشارة" },
    descIconPosition: { fr: "Icône et position", en: "Icon and position", es: "Icono y posición", ar: "الأيقونة والموضع" },
  },
  code: {
    descCodeRequired: { fr: "Code à afficher (requis)", en: "Code to display (required)", es: "Código a mostrar (requerido)", ar: "الكود للعرض (مطلوب)" },
    descShikiTheme:   { fr: "Thème Shiki", en: "Shiki theme", es: "Tema Shiki", ar: "سمة Shiki" },
    descLineWrapping: { fr: "Activer le retour à la ligne", en: "Enable line wrapping", es: "Activar ajuste de línea", ar: "تفعيل التفاف الأسطر" },
    descInlineDisplay:{ fr: "Affichage en ligne", en: "Inline display", es: "Visualización en línea", ar: "عرض مضمن" },
    descTransformers: { fr: "Transformateurs Shiki", en: "Shiki transformers", es: "Transformadores Shiki", ar: "محولات Shiki" },
  },
  form: {
    descFormVisual:   { fr: "Style visuel du formulaire", en: "Visual style of the form", es: "Estilo visual del formulario", ar: "النمط البصري للنموذج" },
    descFormTitle:    { fr: "Titre du formulaire", en: "Form title", es: "Título del formulario", ar: "عنوان النموذج" },
    descFormDesc:     { fr: "Description du formulaire", en: "Form description", es: "Descripción del formulario", ar: "وصف النموذج" },
  },
  link: {
    descBtnTypeIfTag: { fr: "Type de bouton (si tag=\"button\")", en: "Button type (if tag=\"button\")", es: "Tipo de botón (si tag=\"button\")", ar: "نوع الزر (إذا tag=\"button\")" },
    descAppearance:   { fr: "Apparence (lien ou bouton)", en: "Appearance (link or button)", es: "Apariencia (enlace o botón)", ar: "المظهر (رابط أو زر)" },
  },
  menudropdown: {
    descMenuStructure:    { fr: "Structure du menu (requis). Jusqu'à 3 niveaux imbriqués supportés.", en: "Menu structure (required). Up to 3 nested levels supported.", es: "Estructura del menú (requerido). Hasta 3 niveles anidados soportados.", ar: "هيكل القائمة (مطلوب). يدعم حتى 3 مستويات متداخلة." },
    descAbsPlacement:     { fr: "Placement absolu par rapport au déclencheur", en: "Absolute placement relative to the trigger", es: "Posicionamiento absoluto relativo al disparador", ar: "الموضع المطلق بالنسبة للمشغل" },
    descHoverOpen:        { fr: "Ouverture au survol (bureau uniquement)", en: "Open on hover (desktop only)", es: "Abrir al pasar el cursor (solo escritorio)", ar: "فتح عند التمرير (سطح المكتب فقط)" },
    descAccordionMode:    { fr: "Mode \"Accordéon\" intégré pour navigation mobile (sans bordure, fluide)", en: "Integrated \"Accordion\" mode for mobile navigation (borderless, seamless)", es: "Modo \"Acordeón\" integrado para navegación móvil (sin bordes, fluido)", ar: "وضع \"الأكورديون\" المدمج للتنقل عبر الهاتف (بدون حدود، سلس)" },
    descGroupExclusion:   { fr: "Nom du groupe pour exclusion mutuelle (un seul menu ouvert à la fois dans le même groupe)", en: "Group name for mutual exclusion (only one menu open at a time in the same group)", es: "Nombre del grupo para exclusión mutua (solo un menú abierto a la vez en el mismo grupo)", ar: "اسم المجموعة للاستبعاد المتبادل (قائمة واحدة فقط مفتوحة في كل مرة في نفس المجموعة)" },
    descOptionalIcon:     { fr: "Icône optionnelle (chaîne SVG)", en: "Optional icon (SVG string)", es: "Icono opcional (cadena SVG)", ar: "أيقونة اختيارية (سلسلة SVG)" },
  },
  switch: {
    descUniqueIdLabel:  { fr: "Identifiant unique pour lier le label", en: "Unique identifier to link the label", es: "Identificador único para vincular la etiqueta", ar: "معرف فريد لربط التسمية" },
    descFieldName:      { fr: "Nom du champ pour la soumission de formulaire", en: "Field name for form submission", es: "Nombre del campo para envío de formulario", ar: "اسم الحقل لإرسال النموذج" },
    descDefaultChecked: { fr: "État coché par défaut", en: "Default checked state", es: "Estado marcado por defecto", ar: "حالة التحديد الافتراضية" },
    descDisableSwitch:  { fr: "Désactive le switch", en: "Disables the switch", es: "Desactiva el switch", ar: "يعطل المفتاح" },
    descErrorToDisplay: { fr: "Message d'erreur à afficher", en: "Error message to display", es: "Mensaje de error a mostrar", ar: "رسالة خطأ للعرض" },
  },
  tabs: {
    descTabsUniqueId:     { fr: "Identifiant unique pour le widget d'onglets (auto-généré si omis)", en: "Unique identifier for the tabs widget (auto-generated if omitted)", es: "Identificador único para el widget de pestañas (auto-generado si se omite)", ar: "معرف فريد لأداة علامات التبويب (يتم إنشاؤه تلقائيًا إذا تم حذفه)" },
    descTabsVisual:       { fr: "Style visuel du système d'onglets", en: "Visual style of the tabs system", es: "Estilo visual del sistema de pestañas", ar: "النمط البصري لنظام علامات التبويب" },
    descAriaContainer:    { fr: "aria-label sur le conteneur (accessibilité)", en: "aria-label on the container (accessibility)", es: "aria-label en el contenedor (accesibilidad)", ar: "تسمية aria على الحاوية (إمكانية الوصول)" },
    descTabButtonText:    { fr: "Texte affiché dans le bouton d'onglet (requis)", en: "Text displayed in the tab button (required)", es: "Texto mostrado en el botón de pestaña (requerido)", ar: "النص المعروض في زر علامة التبويب (مطلوب)" },
    descRadioGroupName:   { fr: "Nom du groupe radio (doit être identique pour tous les onglets du groupe)", en: "Radio group name (must be identical for all tabs in the group)", es: "Nombre del grupo radio (debe ser idéntico para todas las pestañas del grupo)", ar: "اسم مجموعة الراديو (يجب أن يكون متطابقًا لجميع علامات التبويب في المجموعة)" },
    descDefaultOpenTab:   { fr: "Onglet ouvert par défaut (un seul par groupe)", en: "Default open tab (only one per group)", es: "Pestaña abierta por defecto (solo una por grupo)", ar: "علامة التبويب المفتوحة افتراضيًا (واحدة فقط لكل مجموعة)" },
    descAstroIcon:        { fr: "Nom de l'icône astro-icon (optionnel, ex: \"mdi:home\")", en: "astro-icon icon name (optional, e.g. \"mdi:home\")", es: "Nombre del icono astro-icon (opcional, ej: \"mdi:home\")", ar: "اسم أيقونة astro-icon (اختياري، مثال: \"mdi:home\")" },
  },
  tooltip: {
    descTooltipColor:   { fr: "Couleur du tooltip", en: "Tooltip color", es: "Color del tooltip", ar: "لون التلميح" },
    descTooltipReqText: { fr: "Texte du tooltip (requis)", en: "Tooltip text (required)", es: "Texto del tooltip (requerido)", ar: "نص التلميح (مطلوب)" },
    descTooltipPos:     { fr: "Position du tooltip par rapport à l'élément", en: "Tooltip position relative to the element", es: "Posición del tooltip relativa al elemento", ar: "موضع التلميح بالنسبة للعنصر" },
  },
  accordion: {
    descAccentBorderIcon:  { fr: "Couleur d'accentuation (bordure + icône)", en: "Accent color (border + icon)", es: "Color de acento (borde + icono)", ar: "لون التمييز (الحدود + الأيقونة)" },
    descDisplayedTitle:    { fr: "Titre affiché (ou slot title)", en: "Displayed title (or title slot)", es: "Título mostrado (o slot title)", ar: "العنوان المعروض (أو فتحة العنوان)" },
    descOpensItemDefault:  { fr: "Ouvre l'élément par défaut", en: "Opens the item by default", es: "Abre el elemento por defecto", ar: "يفتح العنصر بشكل افتراضي" },
    descOpenModeSingle:    { fr: "Mode d'ouverture (\"single\" avec groupName)", en: "Open mode (\"single\" with groupName)", es: "Modo de apertura (\"single\" con groupName)", ar: "وضع الفتح (\"single\" مع groupName)" },
    descGroupNameSingle:   { fr: "Nom du groupe pour partager le mode \"single\"", en: "Group name to share \"single\" mode", es: "Nombre del grupo para compartir modo \"single\"", ar: "اسم المجموعة لمشاركة وضع \"single\"" },
    descDetailsClasses:    { fr: "Classes sur l'élément <details>", en: "Classes on the <details> element", es: "Clases en el elemento <details>", ar: "فئات على عنصر <details>" },
    descSummaryClasses:    { fr: "Classes sur le résumé", en: "Classes on the summary", es: "Clases en el resumen", ar: "فئات على الملخص" },
    descContentClasses:    { fr: "Classes sur le wrapper de contenu", en: "Classes on the content wrapper", es: "Clases en el contenedor de contenido", ar: "فئات على غلاف المحتوى" },
  },
  avatar: {
    descAvatarAlt:      { fr: "Texte alternatif pour l'image", en: "Alternative text for the image", es: "Texto alternativo para la imagen", ar: "نص بديل للصورة" },
    descNameInitials:   { fr: "Nom pour générer les initiales (si pas d'image)", en: "Name to generate initials (if no image)", es: "Nombre para generar iniciales (si no hay imagen)", ar: "الاسم لتوليد الأحرف الأولى (إذا لم توجد صورة)" },
  },
  breadcrumb: {
    descCurrentColor: { fr: "Couleur de la page actuelle", en: "Current page color", es: "Color de la página actual", ar: "لون الصفحة الحالية" },
    descUrlRequired:  { fr: "URL de destination (requis)", en: "Destination URL (required)", es: "URL de destino (requerido)", ar: "رابط الوجهة (مطلوب)" },
  },
  gallery: {
    descGalleryImages:  { fr: "Tableau d'images à afficher", en: "Array of images to display", es: "Array de imágenes a mostrar", ar: "مصفوفة الصور للعرض" },
    descGalleryMode:    { fr: "Mode d'affichage de la galerie", en: "Gallery display mode", es: "Modo de visualización de la galería", ar: "وضع عرض المعرض" },
    descColumnsGrid:    { fr: "Nombre de colonnes (grille/maçonnerie)", en: "Number of columns (grid/masonry)", es: "Número de columnas (cuadrícula/mampostería)", ar: "عدد الأعمدة (الشبكة/البناء)" },
    descSpacingImages:  { fr: "Espacement entre les images", en: "Spacing between images", es: "Espaciado entre imágenes", ar: "المسافة بين الصور" },
    descImageRatio:     { fr: "Ratio d'image (grille/amélioré)", en: "Image ratio (grid/enhanced)", es: "Proporción de imagen (cuadrícula/mejorado)", ar: "نسبة الصورة (الشبكة/المحسن)" },
  },
  pagination: {
    descCurrentPage1:  { fr: "Page actuelle (base 1, requis)", en: "Current page (1-based, required)", es: "Página actual (base 1, requerido)", ar: "الصفحة الحالية (تبدأ من 1، مطلوب)" },
    descTotalRequired: { fr: "Nombre total de pages (requis)", en: "Total number of pages (required)", es: "Número total de páginas (requerido)", ar: "العدد الإجمالي للصفحات (مطلوب)" },
  },
  progressbar: {
    descPbVisual:     { fr: "Style visuel de la barre de progression", en: "The visual style of the progress bar", es: "El estilo visual de la barra de progreso", ar: "النمط البصري لشريط التقدم" },
    descPbColor:      { fr: "Couleur de la barre de progression", en: "The color of the progress bar", es: "El color de la barra de progreso", ar: "لون شريط التقدم" },
    descPbValue:      { fr: "Valeur de progression actuelle", en: "The current progress value", es: "El valor de progreso actual", ar: "قيمة التقدم الحالية" },
    descPbMax:        { fr: "Valeur maximale", en: "The maximum value", es: "El valor máximo", ar: "القيمة القصوى" },
    descPbHeight:     { fr: "Hauteur de la barre", en: "The height of the bar", es: "La altura de la barra", ar: "ارتفاع الشريط" },
    descPbLabel:      { fr: "Label personnalisé à afficher", en: "Custom label to display", es: "Etiqueta personalizada a mostrar", ar: "تسمية مخصصة للعرض" },
    descPbStripes:    { fr: "Afficher des rayures diagonales", en: "Show diagonal stripes", es: "Mostrar rayas diagonales", ar: "إظهار خطوط مائلة" },
    descPbAnimStripe: { fr: "Animer les rayures (nécessite striped)", en: "Animate stripes (requires striped)", es: "Animar rayas (requiere striped)", ar: "تحريك الخطوط (يتطلب striped)" },
    descPbAriaLabel:  { fr: "Label d'accessibilité personnalisé", en: "Custom accessibility label", es: "Etiqueta de accesibilidad personalizada", ar: "تسمية إمكانية الوصول المخصصة" },
  },
  skeleton: {
    descSkVisual:     { fr: "Style visuel du skeleton", en: "The visual style of the skeleton", es: "El estilo visual del skeleton", ar: "النمط البصري للهيكل" },
    descSkWidth:      { fr: "Largeur personnalisée (ex: \"200px\", \"50%\")", en: "Custom width (e.g. \"200px\", \"50%\")", es: "Ancho personalizado (ej: \"200px\", \"50%\")", ar: "عرض مخصص (مثال: \"200px\"، \"50%\")" },
    descSkHeight:     { fr: "Hauteur personnalisée (ex: \"20px\", \"3rem\")", en: "Custom height (e.g. \"20px\", \"3rem\")", es: "Altura personalizada (ej: \"20px\", \"3rem\")", ar: "ارتفاع مخصص (مثال: \"20px\"، \"3rem\")" },
    descSkCount:      { fr: "Nombre de skeletons à afficher", en: "Number of skeletons to display", es: "Número de skeletons a mostrar", ar: "عدد الهياكل للعرض" },
  },
  // base layout — all in French originally
  base: {
    descBsTitle:      { fr: "Titre de la page (format: SiteTitle > PageTitle)", en: "Page title (format: SiteTitle > PageTitle)", es: "Título de la página (formato: SiteTitle > PageTitle)", ar: "عنوان الصفحة (التنسيق: SiteTitle > PageTitle)" },
    descBsDesc:       { fr: "Description meta pour SEO", en: "Meta description for SEO", es: "Descripción meta para SEO", ar: "وصف ميتا لتحسين محركات البحث" },
    descBsKeywords:   { fr: "Mots-clés meta pour SEO", en: "Meta keywords for SEO", es: "Palabras clave meta para SEO", ar: "كلمات مفتاحية ميتا لتحسين محركات البحث" },
    descBsAuthor:     { fr: "Auteur de la page", en: "Page author", es: "Autor de la página", ar: "مؤلف الصفحة" },
    descBsOgImage:    { fr: "Image Open Graph pour réseaux sociaux", en: "Open Graph image for social networks", es: "Imagen Open Graph para redes sociales", ar: "صورة Open Graph لشبكات التواصل الاجتماعي" },
    descBsCanonical:  { fr: "URL canonique de la page", en: "Canonical page URL", es: "URL canónica de la página", ar: "عنوان URL الأساسي للصفحة" },
    descBsLocale:     { fr: "Langue de la page (fr, en, es, ar)", en: "Page language (fr, en, es, ar)", es: "Idioma de la página (fr, en, es, ar)", ar: "لغة الصفحة (fr, en, es, ar)" },
    descBsDir:        { fr: "Direction du texte (automatique selon locale)", en: "Text direction (automatic based on locale)", es: "Dirección del texto (automática según locale)", ar: "اتجاه النص (تلقائي حسب اللغة)" },
    descBsRobots:     { fr: "Directives pour robots d'indexation", en: "Directives for indexing robots", es: "Directivas para robots de indexación", ar: "توجيهات لروبوتات الفهرسة" },
    descBsPreload:    { fr: "URLs à précharger", en: "URLs to preload", es: "URLs a precargar", ar: "روابط للتحميل المسبق" },
    descBsExtraCss:   { fr: "Fichiers CSS additionnels", en: "Additional CSS files", es: "Archivos CSS adicionales", ar: "ملفات CSS إضافية" },
    descBsExtraJs:    { fr: "Fichiers JavaScript additionnels", en: "Additional JavaScript files", es: "Archivos JavaScript adicionales", ar: "ملفات JavaScript إضافية" },
    descBsFavicon:    { fr: "Nom du fichier favicon", en: "Favicon file name", es: "Nombre del archivo favicon", ar: "اسم ملف الأيقونة المفضلة" },
    descBsManifest:   { fr: "Chemin vers le manifest PWA", en: "Path to PWA manifest", es: "Ruta al manifiesto PWA", ar: "المسار إلى ملف PWA" },
    descBsTouchIcon:  { fr: "Icône Apple Touch", en: "Apple Touch icon", es: "Icono Apple Touch", ar: "أيقونة Apple Touch" },
  },
  // table.astro descriptions (in <td>)
  table: {
    descTblVisual:    { fr: "Style visuel du tableau", en: "Visual style of the table", es: "Estilo visual de la tabla", ar: "النمط البصري للجدول" },
    descTblZebra:     { fr: "Active l'alternance (zébrée) des lignes pour une meilleure lisibilité", en: "Enables alternate (zebra) rows for better readability", es: "Activa filas alternas (cebra) para mejor legibilidad", ar: "يفعل الصفوف المتناوبة (المخططة) لتحسين القراءة" },
  },
  // header template — French texts
  header: {
    descHeaderVisual: { fr: "Style visuel du header", en: "Header visual style", es: "Estilo visual del encabezado", ar: "النمط البصري للرأس" },
    descHeaderSticky: { fr: "Header fixe en haut (sticky)", en: "Fixed header at top (sticky)", es: "Encabezado fijo en la parte superior (sticky)", ar: "رأس ثابت في الأعلى (sticky)" },
  },
};

// ============================================================
// Add keys to all locale JSONs
// ============================================================
function addAllKeys() {
  for (const locale of ['fr', 'en', 'es', 'ar']) {
    const filePath = path.join(I18N_DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let added = 0;

    // Common keys
    for (const [key, vals] of Object.entries(COMMON_KEYS)) {
      if (!data.docs.common[key]) {
        data.docs.common[key] = vals[locale];
        added++;
      }
    }

    // Per-page keys → docs.pages.{page}.propDescs.{key}
    for (const [pageName, descs] of Object.entries(PAGE_KEYS)) {
      if (!data.docs.pages) data.docs.pages = {};
      if (!data.docs.pages[pageName]) data.docs.pages[pageName] = {};
      if (!data.docs.pages[pageName].propDescs) data.docs.pages[pageName].propDescs = {};
      for (const [key, vals] of Object.entries(descs)) {
        if (!data.docs.pages[pageName].propDescs[key]) {
          data.docs.pages[pageName].propDescs[key] = vals[locale];
          added++;
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  ${locale}.json: +${added} keys`);
  }
}

// ============================================================
// Build replacement map: { exactText → expression }
// ============================================================
function buildReplacementMap(pageName) {
  const map = {};

  // Common keys
  for (const [key, vals] of Object.entries(COMMON_KEYS)) {
    map[vals.en] = `{d.${key} ?? "${vals.en}"}`;
    map[vals.fr] = `{d.${key} ?? "${vals.fr}"}`;
  }

  // Per-page keys  
  const pageDescs = PAGE_KEYS[pageName];
  if (pageDescs) {
    for (const [key, vals] of Object.entries(pageDescs)) {
      const prefix = `p?.propDescs?.${key}`;
      map[vals.en] = `{${prefix} ?? "${vals.en}"}`;
      map[vals.fr] = `{${prefix} ?? "${vals.fr}"}`;
    }
  }

  return map;
}

// ============================================================
// Process a single file
// ============================================================
function processFile(filePath, pageName) {
  if (!fs.existsSync(filePath)) return { changed: false, replaced: 0 };
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let replaced = 0;
  const map = buildReplacementMap(pageName);

  // Ensure the file has the page-specific variable p
  if (PAGE_KEYS[pageName] && !content.includes(`t.docs?.pages?.${pageName}`)) {
    // Add p variable after d variable
    const dRegex = /const d = t\.docs\?\.common \?\? \{\};/;
    if (dRegex.test(content)) {
      content = content.replace(dRegex, `const d = t.docs?.common ?? {};\nconst p = t.docs?.pages?.${pageName} ?? {};`);
    }
  }

  // Replace <TableCell>text</TableCell>
  for (const [text, expr] of Object.entries(map)) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`<TableCell>${escaped}</TableCell>`, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, `<TableCell>${expr}</TableCell>`);
      replaced += matches.length;
    }
  }

  // Also handle <td> for table.astro
  if (pageName === 'table') {
    for (const [text, expr] of Object.entries(map)) {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`<td>${escaped}</td>`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `<td>${expr}</td>`);
        replaced += matches.length;
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { changed: true, replaced };
  }
  return { changed: false, replaced: 0 };
}

// ============================================================
// MAIN
// ============================================================
const FILE_MAP = [
  ['design/badge', 'badge'],
  ['design/code', 'code'],
  ['design/form', 'form'],
  ['design/kbd', 'kbd'],
  ['design/link', 'link'],
  ['design/menudropdown', 'menudropdown'],
  ['design/switch', 'switch'],
  ['design/table', 'table'],
  ['design/tabs', 'tabs'],
  ['design/tooltip', 'tooltip'],
  ['design/video', 'video'],
  ['components/accordion', 'accordion'],
  ['components/avatar', 'avatar'],
  ['components/breadcrumb', 'breadcrumb'],
  ['components/gallery', 'gallery'],
  ['components/pagination', 'pagination'],
  ['components/progressbar', 'progressbar'],
  ['components/skeleton', 'skeleton'],
  ['components/slider', 'slider'],
  ['components/timeline', 'timeline'],
  ['layouts/base', 'base'],
  ['layouts/doc', 'doc'],
  ['templates/header', 'header'],
  ['templates/table-of-contents', 'toc'],
  // Also re-run common on already-processed files
  ['design/alert', 'alert'],
  ['design/button', 'button'],
  ['design/card', 'card'],
  ['design/dialog', 'dialog'],
  ['design/dropdown', 'dropdown'],
  ['design/sheet', 'sheet'],
];

console.log('🔄 Phase 5b: Fix remaining TableCell descriptions\n');

console.log('📦 Adding keys...');
addAllKeys();

console.log('\n📝 Replacing descriptions...');
let totalChanged = 0, totalReplaced = 0;
for (const [rel, pageName] of FILE_MAP) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  const { changed, replaced } = processFile(fp, pageName);
  if (changed) {
    console.log(`  ✅ ${rel} (${replaced})`);
    totalChanged++;
    totalReplaced += replaced;
  }
}
console.log(`\n📊 Changed: ${totalChanged}, Replacements: ${totalReplaced}`);

// Recount remaining  
let remaining = 0;
for (const [rel] of FILE_MAP) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  const tcMatches = (c.match(/<TableCell>[^{<][^<]*<\/TableCell>/g) || [])
    .filter(m => !m.includes('{d.') && !m.includes('{p'));
  const tdMatches = rel === 'design/table' ?
    (c.match(/<td>[^{<][^<]*<\/td>/g) || []).filter(m => !m.includes('{d.') && !m.includes('{p')) : [];
  const total = tcMatches.length + tdMatches.length;
  if (total > 0) {
    remaining += total;
    console.log(`  ⚠️ ${rel}: ${total} remaining`);
    for (const m of [...tcMatches, ...tdMatches].slice(0, 3)) {
      console.log(`    → ${m.substring(0, 80)}`);
    }
  }
}
console.log(`\nTotal remaining: ${remaining}`);

// Key count
for (const locale of ['fr', 'en', 'es', 'ar']) {
  const data = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf8'));
  const count = JSON.stringify(data).match(/"[^"]+"\s*:/g)?.length ?? 0;
  console.log(`  ${locale}.json: ~${count} keys`);
}
