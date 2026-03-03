#!/usr/bin/env node
/**
 * scripts/i18n-docs-complete.mjs
 * 
 * Phase 2: Complete i18n of ALL doc pages.
 * Adds missing common keys + per-page content keys,
 * then transforms remaining hardcoded strings in all doc pages.
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');
const DOCS_BASE = path.join('src', 'pages', '[lang]', 'docs');

// ============================================================
// STEP 1: Add missing translation keys
// ============================================================

const COMMON_KEYS_TO_ADD = {
  fr: {
    // Variant sub-headings (h3)
    variantInitial: "Initial (par défaut)",
    variantRetro: "Retro",
    variantModern: "Modern",
    variantFuturistic: "Futuristic",
    // Additional common section headings
    basicExamples: "Exemples basiques",
    cssCustomization: "Personnalisation CSS",
    cssVariables: "Variables CSS utilisées",
    nativeFeatures: "Fonctionnalités natives",
    structure: "Structure",
    features: "Fonctionnalités",
    fullExample: "Exemple complet",
    seoMetadata: "SEO et Métadonnées",
    themeManagement: "Gestion du thème",
    fonts: "Polices",
    htmlStructure: "Structure HTML",
    includedComponents: "Composants inclus",
    externalTrigger: "Déclencheur externe",
    openingSides: "Côtés d'ouverture",
    howItWorks: "Comment ça marche ?",
    content: "Contenu",
    displayModes: "Modes d'affichage",
    autoplay: "Lecture automatique",
    withTitle: "Avec titre",
    withSlotContent: "Avec contenu personnalisé (slot)",
    dismissible: "Supprimable",
    withCloseButton: "Avec bouton fermer",
    comparisonWithLink: "Comparaison avec Link",
    usageExamples: "Exemples d'utilisation",
    buttonTypes: "Types de bouton",
    buttonsWithIcons: "Boutons avec icônes",
    buttonStates: "États du bouton",
    iconOnLeft: "Icône à gauche",
    iconOnRight: "Icône à droite",
    iconOnly: "Bouton icône seul",
    loginForm: "Formulaire de connexion",
    actionButtons: "Boutons d'action",
    navigationButtons: "Boutons de navigation",
    differentStatuses: "Différents statuts",
    successNotification: "Notification de succès",
    errorMessage: "Message d'erreur",
    importantWarning: "Avertissement important",
    systemInfo: "Information système",
    withCustomIcons: "Avec icônes personnalisées",
    dismissibleAlerts: "Alertes supprimables",
    elevations: "Élévations",
    interactiveCard: "Carte interactive",
    aspectRatios: "Ratios d'image",
    customMeta: "Métadonnées personnalisées",
    footerAlignment: "Alignement du footer",
    syntaxHighlighting: "Coloration syntaxique",
    lineNumbers: "Numéros de ligne",
    codeThemes: "Thèmes de code",
    smallDialog: "Petit",
    largeDialog: "Large",
    editProfile: "Modifier le profil",
    formFields: "Champs de formulaire",
    multipleTriggers: "Déclencheurs multiples",
    subMenus: "Sous-menus",
    nestedMenus: "Menus imbriqués",
    menuWithIcons: "Menu avec icônes",
    menuPositions: "Positions du menu",
    keyboardNavigation: "Navigation clavier",
    modifierKeys: "Touches de modification",
    specialKeys: "Touches spéciales",
    combinations: "Combinaisons",
    linkStyles: "Styles de lien",
    buttonStyle: "Style bouton",
    withSeparators: "Avec séparateurs",
    withEllipsis: "Avec ellipses",
    customSeparator: "Séparateur personnalisé",
    sideRight: "Droit (par défaut)",
    sideLeft: "Gauche",
    sideTop: "Haut",
    sideBottom: "Bas",
    switchStates: "États du switch",
    withLabels: "Avec labels",
    tableWithCaption: "Table avec légende",
    tableStriped: "Table rayée",
    tableWithFooter: "Table avec pied",
    tabsWithIcons: "Onglets avec icônes",
    verticalTabs: "Onglets verticaux",
    autoSwitchTabs: "Changement automatique",
    tooltipPositions: "Positions de l'info-bulle",
    tooltipColors: "Couleurs de l'info-bulle",
    videoControls: "Contrôles vidéo",
    videoSizes: "Tailles vidéo",
    gridMode: "Mode grille",
    masonryMode: "Mode maçonnerie",
    carouselMode: "Mode carrousel",
    lightbox: "Lightbox",
    pageSize: "Taille de page",
    withSteps: "Avec étapes",
    automaticPercent: "Pourcentage automatique",
    customLabel: "Label personnalisé",
    stripesAndAnimations: "Rayures et animations",
    withStripes: "Avec rayures",
    animatedStripes: "Rayures animées",
    skeletonShapes: "Formes de skeleton",
    autoplaySlider: "Défilement automatique",
    sliderNavigation: "Navigation du carrousel",
    horizontalTimeline: "Timeline horizontale",
    verticalTimeline: "Timeline verticale",
    alternateTimeline: "Timeline alternée",
    customIcons: "Icônes personnalisées",
    avatarSizes: "Tailles d'avatar",
    avatarGroup: "Groupe d'avatars",
    avatarWithInitials: "Avec initiales",
    avatarCards: "Cartes d'avatar"
  },
  en: {
    variantInitial: "Initial (Default)",
    variantRetro: "Retro",
    variantModern: "Modern",
    variantFuturistic: "Futuristic",
    basicExamples: "Basic examples",
    cssCustomization: "CSS Customization",
    cssVariables: "CSS Variables Used",
    nativeFeatures: "Native features",
    structure: "Structure",
    features: "Features",
    fullExample: "Full example",
    seoMetadata: "SEO and Metadata",
    themeManagement: "Theme Management",
    fonts: "Fonts",
    htmlStructure: "HTML Structure",
    includedComponents: "Included Components",
    externalTrigger: "External trigger",
    openingSides: "Opening sides",
    howItWorks: "How does it work?",
    content: "Content",
    displayModes: "Display modes",
    autoplay: "Autoplay",
    withTitle: "With title",
    withSlotContent: "With custom content (slot)",
    dismissible: "Dismissible",
    withCloseButton: "With close button",
    comparisonWithLink: "Comparison with Link",
    usageExamples: "Usage Examples",
    buttonTypes: "Button Types",
    buttonsWithIcons: "Buttons with Icons",
    buttonStates: "Button States",
    iconOnLeft: "Icon on Left",
    iconOnRight: "Icon on Right",
    iconOnly: "Icon-Only Button",
    loginForm: "Login Form",
    actionButtons: "Action Buttons",
    navigationButtons: "Navigation Buttons",
    differentStatuses: "Different statuses",
    successNotification: "Success notification",
    errorMessage: "Error message",
    importantWarning: "Important warning",
    systemInfo: "System information",
    withCustomIcons: "With custom icons",
    dismissibleAlerts: "Dismissible alerts",
    elevations: "Elevations",
    interactiveCard: "Interactive card",
    aspectRatios: "Aspect Ratios",
    customMeta: "Custom meta",
    footerAlignment: "Footer alignment",
    syntaxHighlighting: "Syntax highlighting",
    lineNumbers: "Line numbers",
    codeThemes: "Code themes",
    smallDialog: "Small",
    largeDialog: "Large",
    editProfile: "Edit Profile",
    formFields: "Form fields",
    multipleTriggers: "Multiple triggers",
    subMenus: "Sub-menus",
    nestedMenus: "Nested menus",
    menuWithIcons: "Menu with icons",
    menuPositions: "Menu positions",
    keyboardNavigation: "Keyboard navigation",
    modifierKeys: "Modifier keys",
    specialKeys: "Special keys",
    combinations: "Combinations",
    linkStyles: "Link styles",
    buttonStyle: "Button style",
    withSeparators: "With separators",
    withEllipsis: "With ellipsis",
    customSeparator: "Custom separator",
    sideRight: "Right (default)",
    sideLeft: "Left",
    sideTop: "Top",
    sideBottom: "Bottom",
    switchStates: "Switch states",
    withLabels: "With labels",
    tableWithCaption: "Table with caption",
    tableStriped: "Striped table",
    tableWithFooter: "Table with footer",
    tabsWithIcons: "Tabs with icons",
    verticalTabs: "Vertical tabs",
    autoSwitchTabs: "Auto switch",
    tooltipPositions: "Tooltip positions",
    tooltipColors: "Tooltip colors",
    videoControls: "Video controls",
    videoSizes: "Video sizes",
    gridMode: "Grid mode",
    masonryMode: "Masonry mode",
    carouselMode: "Carousel mode",
    lightbox: "Lightbox",
    pageSize: "Page size",
    withSteps: "With steps",
    automaticPercent: "Automatic percentage",
    customLabel: "Custom label",
    stripesAndAnimations: "Stripes and animations",
    withStripes: "With stripes",
    animatedStripes: "Animated stripes",
    skeletonShapes: "Skeleton shapes",
    autoplaySlider: "Autoplay",
    sliderNavigation: "Navigation",
    horizontalTimeline: "Horizontal timeline",
    verticalTimeline: "Vertical timeline",
    alternateTimeline: "Alternate timeline",
    customIcons: "Custom icons",
    avatarSizes: "Avatar sizes",
    avatarGroup: "Avatar group",
    avatarWithInitials: "With initials",
    avatarCards: "Avatar cards"
  },
  es: {
    variantInitial: "Initial (por defecto)",
    variantRetro: "Retro",
    variantModern: "Modern",
    variantFuturistic: "Futuristic",
    basicExamples: "Ejemplos básicos",
    cssCustomization: "Personalización CSS",
    cssVariables: "Variables CSS utilizadas",
    nativeFeatures: "Funcionalidades nativas",
    structure: "Estructura",
    features: "Funcionalidades",
    fullExample: "Ejemplo completo",
    seoMetadata: "SEO y Metadatos",
    themeManagement: "Gestión del tema",
    fonts: "Fuentes",
    htmlStructure: "Estructura HTML",
    includedComponents: "Componentes incluidos",
    externalTrigger: "Disparador externo",
    openingSides: "Lados de apertura",
    howItWorks: "¿Cómo funciona?",
    content: "Contenido",
    displayModes: "Modos de visualización",
    autoplay: "Reproducción automática",
    withTitle: "Con título",
    withSlotContent: "Con contenido personalizado (slot)",
    dismissible: "Descartable",
    withCloseButton: "Con botón cerrar",
    comparisonWithLink: "Comparación con Link",
    usageExamples: "Ejemplos de uso",
    buttonTypes: "Tipos de botón",
    buttonsWithIcons: "Botones con iconos",
    buttonStates: "Estados del botón",
    iconOnLeft: "Icono a la izquierda",
    iconOnRight: "Icono a la derecha",
    iconOnly: "Botón solo icono",
    loginForm: "Formulario de inicio de sesión",
    actionButtons: "Botones de acción",
    navigationButtons: "Botones de navegación",
    differentStatuses: "Diferentes estados",
    successNotification: "Notificación de éxito",
    errorMessage: "Mensaje de error",
    importantWarning: "Advertencia importante",
    systemInfo: "Información del sistema",
    withCustomIcons: "Con iconos personalizados",
    dismissibleAlerts: "Alertas descartables",
    elevations: "Elevaciones",
    interactiveCard: "Tarjeta interactiva",
    aspectRatios: "Proporciones de imagen",
    customMeta: "Metadatos personalizados",
    footerAlignment: "Alineación del footer",
    syntaxHighlighting: "Resaltado de sintaxis",
    lineNumbers: "Números de línea",
    codeThemes: "Temas de código",
    smallDialog: "Pequeño",
    largeDialog: "Grande",
    editProfile: "Editar perfil",
    formFields: "Campos de formulario",
    multipleTriggers: "Disparadores múltiples",
    subMenus: "Submenús",
    nestedMenus: "Menús anidados",
    menuWithIcons: "Menú con iconos",
    menuPositions: "Posiciones del menú",
    keyboardNavigation: "Navegación por teclado",
    modifierKeys: "Teclas modificadoras",
    specialKeys: "Teclas especiales",
    combinations: "Combinaciones",
    linkStyles: "Estilos de enlace",
    buttonStyle: "Estilo botón",
    withSeparators: "Con separadores",
    withEllipsis: "Con puntos suspensivos",
    customSeparator: "Separador personalizado",
    sideRight: "Derecha (por defecto)",
    sideLeft: "Izquierda",
    sideTop: "Arriba",
    sideBottom: "Abajo",
    switchStates: "Estados del switch",
    withLabels: "Con etiquetas",
    tableWithCaption: "Tabla con leyenda",
    tableStriped: "Tabla rayada",
    tableWithFooter: "Tabla con pie",
    tabsWithIcons: "Pestañas con iconos",
    verticalTabs: "Pestañas verticales",
    autoSwitchTabs: "Cambio automático",
    tooltipPositions: "Posiciones del tooltip",
    tooltipColors: "Colores del tooltip",
    videoControls: "Controles de video",
    videoSizes: "Tamaños de video",
    gridMode: "Modo cuadrícula",
    masonryMode: "Modo mampostería",
    carouselMode: "Modo carrusel",
    lightbox: "Lightbox",
    pageSize: "Tamaño de página",
    withSteps: "Con pasos",
    automaticPercent: "Porcentaje automático",
    customLabel: "Etiqueta personalizada",
    stripesAndAnimations: "Rayas y animaciones",
    withStripes: "Con rayas",
    animatedStripes: "Rayas animadas",
    skeletonShapes: "Formas de skeleton",
    autoplaySlider: "Reproducción automática",
    sliderNavigation: "Navegación",
    horizontalTimeline: "Timeline horizontal",
    verticalTimeline: "Timeline vertical",
    alternateTimeline: "Timeline alternada",
    customIcons: "Iconos personalizados",
    avatarSizes: "Tamaños de avatar",
    avatarGroup: "Grupo de avatares",
    avatarWithInitials: "Con iniciales",
    avatarCards: "Tarjetas de avatar"
  },
  ar: {
    variantInitial: "أولي (افتراضي)",
    variantRetro: "كلاسيكي",
    variantModern: "حديث",
    variantFuturistic: "مستقبلي",
    basicExamples: "أمثلة أساسية",
    cssCustomization: "تخصيص CSS",
    cssVariables: "متغيرات CSS المستخدمة",
    nativeFeatures: "الميزات الأصلية",
    structure: "الهيكل",
    features: "الميزات",
    fullExample: "مثال كامل",
    seoMetadata: "SEO والبيانات الوصفية",
    themeManagement: "إدارة السمة",
    fonts: "الخطوط",
    htmlStructure: "هيكل HTML",
    includedComponents: "المكونات المضمنة",
    externalTrigger: "مشغل خارجي",
    openingSides: "جوانب الفتح",
    howItWorks: "كيف يعمل؟",
    content: "المحتوى",
    displayModes: "أوضاع العرض",
    autoplay: "التشغيل التلقائي",
    withTitle: "مع عنوان",
    withSlotContent: "مع محتوى مخصص (slot)",
    dismissible: "قابل للإغلاق",
    withCloseButton: "مع زر إغلاق",
    comparisonWithLink: "مقارنة مع Link",
    usageExamples: "أمثلة الاستخدام",
    buttonTypes: "أنواع الأزرار",
    buttonsWithIcons: "أزرار مع أيقونات",
    buttonStates: "حالات الزر",
    iconOnLeft: "أيقونة على اليسار",
    iconOnRight: "أيقونة على اليمين",
    iconOnly: "زر أيقونة فقط",
    loginForm: "نموذج تسجيل الدخول",
    actionButtons: "أزرار الإجراءات",
    navigationButtons: "أزرار التنقل",
    differentStatuses: "حالات مختلفة",
    successNotification: "إشعار نجاح",
    errorMessage: "رسالة خطأ",
    importantWarning: "تحذير مهم",
    systemInfo: "معلومات النظام",
    withCustomIcons: "مع أيقونات مخصصة",
    dismissibleAlerts: "تنبيهات قابلة للإغلاق",
    elevations: "الارتفاعات",
    interactiveCard: "بطاقة تفاعلية",
    aspectRatios: "نسب الصورة",
    customMeta: "بيانات وصفية مخصصة",
    footerAlignment: "محاذاة التذييل",
    syntaxHighlighting: "تلوين بناء الجملة",
    lineNumbers: "أرقام الأسطر",
    codeThemes: "سمات الكود",
    smallDialog: "صغير",
    largeDialog: "كبير",
    editProfile: "تعديل الملف الشخصي",
    formFields: "حقول النموذج",
    multipleTriggers: "مشغلات متعددة",
    subMenus: "القوائم الفرعية",
    nestedMenus: "القوائم المتداخلة",
    menuWithIcons: "قائمة مع أيقونات",
    menuPositions: "مواضع القائمة",
    keyboardNavigation: "التنقل بلوحة المفاتيح",
    modifierKeys: "مفاتيح التعديل",
    specialKeys: "مفاتيح خاصة",
    combinations: "مجموعات",
    linkStyles: "أنماط الروابط",
    buttonStyle: "نمط الزر",
    withSeparators: "مع فواصل",
    withEllipsis: "مع علامات حذف",
    customSeparator: "فاصل مخصص",
    sideRight: "يمين (افتراضي)",
    sideLeft: "يسار",
    sideTop: "أعلى",
    sideBottom: "أسفل",
    switchStates: "حالات المفتاح",
    withLabels: "مع تسميات",
    tableWithCaption: "جدول مع تسمية",
    tableStriped: "جدول مقلم",
    tableWithFooter: "جدول مع تذييل",
    tabsWithIcons: "علامات تبويب مع أيقونات",
    verticalTabs: "علامات تبويب عمودية",
    autoSwitchTabs: "تبديل تلقائي",
    tooltipPositions: "مواضع التلميح",
    tooltipColors: "ألوان التلميح",
    videoControls: "عناصر تحكم الفيديو",
    videoSizes: "أحجام الفيديو",
    gridMode: "وضع الشبكة",
    masonryMode: "وضع البناء",
    carouselMode: "وضع الشريط الدوار",
    lightbox: "صندوق الضوء",
    pageSize: "حجم الصفحة",
    withSteps: "مع خطوات",
    automaticPercent: "النسبة التلقائية",
    customLabel: "تسمية مخصصة",
    stripesAndAnimations: "خطوط وتحريكات",
    withStripes: "مع خطوط",
    animatedStripes: "خطوط متحركة",
    skeletonShapes: "أشكال الهيكل",
    autoplaySlider: "تشغيل تلقائي",
    sliderNavigation: "التنقل",
    horizontalTimeline: "جدول زمني أفقي",
    verticalTimeline: "جدول زمني عمودي",
    alternateTimeline: "جدول زمني متناوب",
    customIcons: "أيقونات مخصصة",
    avatarSizes: "أحجام الصورة الرمزية",
    avatarGroup: "مجموعة صور رمزية",
    avatarWithInitials: "مع الأحرف الأولى",
    avatarCards: "بطاقات الصورة الرمزية"
  }
};

function addCommonKeys() {
  for (const locale of ['fr', 'en', 'es', 'ar']) {
    const filePath = path.join(I18N_DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.docs) data.docs = {};
    if (!data.docs.common) data.docs.common = {};
    
    const keysToAdd = COMMON_KEYS_TO_ADD[locale];
    let added = 0;
    for (const [key, value] of Object.entries(keysToAdd)) {
      if (!data.docs.common[key]) {
        data.docs.common[key] = value;
        added++;
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  ${locale}.json: +${added} common keys`);
  }
}

// ============================================================
// STEP 2: Transform doc pages — replace ALL remaining hardcoded h2/h3
// ============================================================

// Extended heading map for h2 elements
const H2_MAP = [
  // Already handled by previous script: Installation, Props, Variants, Colors, Sizes, etc.
  // New ones:
  ['Basic Examples', '{d.basicExamples ?? "Basic Examples"}'],
  ['Basic examples', '{d.basicExamples ?? "Basic examples"}'],
  ['Exemples basiques', '{d.basicExamples ?? "Exemples basiques"}'],
  ['CSS Customization', '{d.cssCustomization ?? "CSS Customization"}'],
  ['Personnalisation CSS', '{d.cssCustomization ?? "Personnalisation CSS"}'],
  ['CSS Variables Used', '{d.cssVariables ?? "CSS Variables Used"}'],
  ['Variables CSS', '{d.cssVariables ?? "Variables CSS"}'],
  ['Comparison with Link', '{d.comparisonWithLink ?? "Comparison with Link"}'],
  ['The 4 Variants', '{d.variants ?? "The 4 Variants"}'],
  ['Les 4 Variants', '{d.variants ?? "Les 4 Variants"}'],
  ['Button Types', '{d.buttonTypes ?? "Button Types"}'],
  ['Types de bouton', '{d.buttonTypes ?? "Types de bouton"}'],
  ['Buttons with Icons', '{d.buttonsWithIcons ?? "Buttons with Icons"}'],
  ['Boutons avec icônes', '{d.buttonsWithIcons ?? "Boutons avec icônes"}'],
  ['Button States', '{d.buttonStates ?? "Button States"}'],
  ['États du bouton', '{d.buttonStates ?? "États du bouton"}'],
  ['Usage Examples', '{d.usageExamples ?? "Usage Examples"}'],
  ["Exemples d'utilisation", "{d.usageExamples ?? \"Exemples d'utilisation\"}"],
  ['With custom icons', '{d.withCustomIcons ?? "With custom icons"}'],
  ['Avec icônes personnalisées', '{d.withCustomIcons ?? "Avec icônes personnalisées"}'],
  ['Dismissible alerts', '{d.dismissibleAlerts ?? "Dismissible alerts"}'],
  ['Alertes supprimables', '{d.dismissibleAlerts ?? "Alertes supprimables"}'],
  ['Elevations', '{d.elevations ?? "Elevations"}'],
  ['Élévations', '{d.elevations ?? "Élévations"}'],
  ['Interactive', '{d.interactiveCard ?? "Interactive"}'],
  ['Carte interactive', '{d.interactiveCard ?? "Carte interactive"}'],
  ['Aspect Ratios', '{d.aspectRatios ?? "Aspect Ratios"}'],
  ['Ratios d\'image', '{d.aspectRatios ?? "Ratios d\'image"}'],
  ['Custom meta', '{d.customMeta ?? "Custom meta"}'],
  ['Métadonnées personnalisées', '{d.customMeta ?? "Métadonnées personnalisées"}'],
  ['Footer alignment', '{d.footerAlignment ?? "Footer alignment"}'],
  ['Alignement du footer', '{d.footerAlignment ?? "Alignement du footer"}'],
  ['Syntax highlighting', '{d.syntaxHighlighting ?? "Syntax highlighting"}'],
  ['Coloration syntaxique', '{d.syntaxHighlighting ?? "Coloration syntaxique"}'],
  ['Line numbers', '{d.lineNumbers ?? "Line numbers"}'],
  ['Numéros de ligne', '{d.lineNumbers ?? "Numéros de ligne"}'],
  ['Code themes', '{d.codeThemes ?? "Code themes"}'],
  ['Thèmes de code', '{d.codeThemes ?? "Thèmes de code"}'],
  ['With form', '{d.withForm ?? "With form"}'],
  ['Avec formulaire', '{d.withForm ?? "Avec formulaire"}'],
  ['External trigger', '{d.externalTrigger ?? "External trigger"}'],
  ['Déclencheur externe', '{d.externalTrigger ?? "Déclencheur externe"}'],
  ['Native features', '{d.nativeFeatures ?? "Native features"}'],
  ['Fonctionnalités natives', '{d.nativeFeatures ?? "Fonctionnalités natives"}'],
  ['Sub-menus', '{d.subMenus ?? "Sub-menus"}'],
  ['Sous-menus', '{d.subMenus ?? "Sous-menus"}'],
  ['Nested menus', '{d.nestedMenus ?? "Nested menus"}'],
  ['Menus imbriqués', '{d.nestedMenus ?? "Menus imbriqués"}'],
  ['Menu with icons', '{d.menuWithIcons ?? "Menu with icons"}'],
  ['Menu avec icônes', '{d.menuWithIcons ?? "Menu avec icônes"}'],
  ['Menu positions', '{d.menuPositions ?? "Menu positions"}'],
  ['Positions du menu', '{d.menuPositions ?? "Positions du menu"}'],
  ['Keyboard navigation', '{d.keyboardNavigation ?? "Keyboard navigation"}'],
  ['Navigation clavier', '{d.keyboardNavigation ?? "Navigation clavier"}'],
  ['Modifier keys', '{d.modifierKeys ?? "Modifier keys"}'],
  ['Touches de modification', '{d.modifierKeys ?? "Touches de modification"}'],
  ['Special keys', '{d.specialKeys ?? "Special keys"}'],
  ['Touches spéciales', '{d.specialKeys ?? "Touches spéciales"}'],
  ['Link styles', '{d.linkStyles ?? "Link styles"}'],
  ['Styles de lien', '{d.linkStyles ?? "Styles de lien"}'],
  ['Button style', '{d.buttonStyle ?? "Button style"}'],
  ['Style bouton', '{d.buttonStyle ?? "Style bouton"}'],
  ["Côtés d'ouverture", "{d.openingSides ?? \"Côtés d'ouverture\"}"],
  ['Opening sides', '{d.openingSides ?? "Opening sides"}'],
  ['Comment ça marche ?', '{d.howItWorks ?? "Comment ça marche ?"}'],
  ['How does it work?', '{d.howItWorks ?? "How does it work?"}'],
  ['Contenu', '{d.content ?? "Contenu"}'],
  ['Content', '{d.content ?? "Content"}'],
  ['With labels', '{d.withLabels ?? "With labels"}'],
  ['Avec labels', '{d.withLabels ?? "Avec labels"}'],
  ['Stripes and animations', '{d.stripesAndAnimations ?? "Stripes and animations"}'],
  ['Rayures et animations', '{d.stripesAndAnimations ?? "Rayures et animations"}'],
  ['Single mode (only one open)', '{d.singleMode ?? "Single mode (only one open)"}'],
  ['Mode accordéon', '{d.singleMode ?? "Mode accordéon"}'],
  ['Disabled state', '{d.disabledState ?? "Disabled state"}'],
  ['État désactivé', '{d.disabledState ?? "État désactivé"}'],
  ['Display modes', '{d.displayModes ?? "Display modes"}'],
  ['Modes d\'affichage', '{d.displayModes ?? "Modes d\'affichage"}'],
  ['Utilisation', '{d.usage ?? "Utilisation"}'],
  ['Fonctionnalités', '{d.features ?? "Fonctionnalités"}'],
  ['Structure', '{d.structure ?? "Structure"}'],
  ['Features', '{d.features ?? "Features"}'],
  ['Composants inclus', '{d.includedComponents ?? "Composants inclus"}'],
  ['Included Components', '{d.includedComponents ?? "Included Components"}'],
  ['Responsive', '{d.responsive ?? "Responsive"}'],
  ['Exemple complet', '{d.fullExample ?? "Exemple complet"}'],
  ['Full example', '{d.fullExample ?? "Full example"}'],
  ['SEO et Métadonnées', '{d.seoMetadata ?? "SEO et Métadonnées"}'],
  ['SEO and Metadata', '{d.seoMetadata ?? "SEO and Metadata"}'],
  ['Gestion du thème', '{d.themeManagement ?? "Gestion du thème"}'],
  ['Theme Management', '{d.themeManagement ?? "Theme Management"}'],
  ['Structure HTML', '{d.htmlStructure ?? "Structure HTML"}'],
  ['HTML Structure', '{d.htmlStructure ?? "HTML Structure"}'],
  ['Polices', '{d.fonts ?? "Polices"}'],
  ['Fonts', '{d.fonts ?? "Fonts"}'],
  ['Couleurs des boutons', '{d.colors ?? "Couleurs des boutons"}'],
  ['Different statuses', '{d.differentStatuses ?? "Different statuses"}'],
  ['Différents statuts', '{d.differentStatuses ?? "Différents statuts"}'],
  ['With title', '{d.withTitle ?? "With title"}'],
  ['Avec titre', '{d.withTitle ?? "Avec titre"}'],
  ['With custom content (slot)', '{d.withSlotContent ?? "With custom content (slot)"}'],
  ['Avec contenu personnalisé', '{d.withSlotContent ?? "Avec contenu personnalisé"}'],
  ['Api Reference', '{d.apiReference ?? "Api Reference"}'],
  ['API Reference', '{d.apiReference ?? "API Reference"}'],
  ['Référence API', '{d.apiReference ?? "Référence API"}'],
  ['Autoplay', '{d.autoplay ?? "Autoplay"}'],
  ['Lecture automatique', '{d.autoplay ?? "Lecture automatique"}'],
];

// Extended heading map for h3 elements
const H3_MAP = [
  ['Initial (Default)', '{d.variantInitial ?? "Initial (Default)"}'],
  ['Initial (default)', '{d.variantInitial ?? "Initial (default)"}'],
  ['Initial (Défaut)', '{d.variantInitial ?? "Initial (Défaut)"}'],
  ['Initial (par défaut)', '{d.variantInitial ?? "Initial (par défaut)"}'],
  ['Retro', '{d.variantRetro ?? "Retro"}'],
  ['Modern', '{d.variantModern ?? "Modern"}'],
  ['Futuristic', '{d.variantFuturistic ?? "Futuristic"}'],
  ['Icon on Left', '{d.iconOnLeft ?? "Icon on Left"}'],
  ['Icône à gauche', '{d.iconOnLeft ?? "Icône à gauche"}'],
  ['Icon on Right', '{d.iconOnRight ?? "Icon on Right"}'],
  ['Icône à droite', '{d.iconOnRight ?? "Icône à droite"}'],
  ['Icon-Only Button', '{d.iconOnly ?? "Icon-Only Button"}'],
  ['Bouton icône seul', '{d.iconOnly ?? "Bouton icône seul"}'],
  ['Disabled', '{d.disabled ?? "Disabled"}'],
  ['Désactivé', '{d.disabled ?? "Désactivé"}'],
  ['Login Form', '{d.loginForm ?? "Login Form"}'],
  ['Formulaire de connexion', '{d.loginForm ?? "Formulaire de connexion"}'],
  ['Action Buttons', '{d.actionButtons ?? "Action Buttons"}'],
  ['Boutons d\'action', '{d.actionButtons ?? "Boutons d\'action"}'],
  ['Navigation Buttons', '{d.navigationButtons ?? "Navigation Buttons"}'],
  ['Boutons de navigation', '{d.navigationButtons ?? "Boutons de navigation"}'],
  ['CSS Variables Used', '{d.cssVariables ?? "CSS Variables Used"}'],
  ['Variables CSS utilisées', '{d.cssVariables ?? "Variables CSS utilisées"}'],
  ['Different statuses', '{d.differentStatuses ?? "Different statuses"}'],
  ['Différents statuts', '{d.differentStatuses ?? "Différents statuts"}'],
  ['With title', '{d.withTitle ?? "With title"}'],
  ['Avec titre', '{d.withTitle ?? "Avec titre"}'],
  ['With custom content (slot)', '{d.withSlotContent ?? "With custom content (slot)"}'],
  ['Avec contenu personnalisé (slot)', '{d.withSlotContent ?? "Avec contenu personnalisé (slot)"}'],
  ['Success notification', '{d.successNotification ?? "Success notification"}'],
  ['Notification de succès', '{d.successNotification ?? "Notification de succès"}'],
  ['Error message', '{d.errorMessage ?? "Error message"}'],
  ['Message d\'erreur', '{d.errorMessage ?? "Message d\'erreur"}'],
  ['Important warning', '{d.importantWarning ?? "Important warning"}'],
  ['Avertissement important', '{d.importantWarning ?? "Avertissement important"}'],
  ['System information', '{d.systemInfo ?? "System information"}'],
  ['Information système', '{d.systemInfo ?? "Information système"}'],
  ['Small', '{d.smallDialog ?? "Small"}'],
  ['Large', '{d.largeDialog ?? "Large"}'],
  ['Droit (par défaut)', '{d.sideRight ?? "Droit (par défaut)"}'],
  ['Right (default)', '{d.sideRight ?? "Right (default)"}'],
  ['Gauche', '{d.sideLeft ?? "Gauche"}'],
  ['Left', '{d.sideLeft ?? "Left"}'],
  ['Haut', '{d.sideTop ?? "Haut"}'],
  ['Top', '{d.sideTop ?? "Top"}'],
  ['Bas', '{d.sideBottom ?? "Bas"}'],
  ['Bottom', '{d.sideBottom ?? "Bottom"}'],
  ['Automatic percentage', '{d.automaticPercent ?? "Automatic percentage"}'],
  ['Pourcentage automatique', '{d.automaticPercent ?? "Pourcentage automatique"}'],
  ['Custom label', '{d.customLabel ?? "Custom label"}'],
  ['Label personnalisé', '{d.customLabel ?? "Label personnalisé"}'],
  ['With stripes', '{d.withStripes ?? "With stripes"}'],
  ['Avec rayures', '{d.withStripes ?? "Avec rayures"}'],
  ['Animated stripes', '{d.animatedStripes ?? "Animated stripes"}'],
  ['Rayures animées', '{d.animatedStripes ?? "Rayures animées"}'],
  ['Combinations', '{d.combinations ?? "Combinations"}'],
  ['Combinaisons', '{d.combinations ?? "Combinaisons"}'],
  ['Grid mode', '{d.gridMode ?? "Grid mode"}'],
  ['Mode grille', '{d.gridMode ?? "Mode grille"}'],
  ['Masonry mode', '{d.masonryMode ?? "Masonry mode"}'],
  ['Mode maçonnerie', '{d.masonryMode ?? "Mode maçonnerie"}'],
  ['Carousel mode', '{d.carouselMode ?? "Carousel mode"}'],
  ['Mode carrousel', '{d.carouselMode ?? "Mode carrousel"}'],
  ['Lightbox', '{d.lightbox ?? "Lightbox"}'],
  ['Horizontal', '{d.horizontalTimeline ?? "Horizontal"}'],
  ['Vertical', '{d.verticalTimeline ?? "Vertical"}'],
  ['Alternate', '{d.alternateTimeline ?? "Alternate"}'],
  ['Alternée', '{d.alternateTimeline ?? "Alternée"}'],
];

// TOC title replacement
function fixTocTitles(content) {
  content = content.replace(
    /title="Table of Contents"/g,
    'title={d.tableOfContents ?? "Table of Contents"}'
  );
  content = content.replace(
    /title="Table of contents"/g,
    'title={d.tableOfContents ?? "Table of contents"}'
  );
  content = content.replace(
    /title="Table des matières"/g,
    'title={d.tableOfContents ?? "Table des matières"}'
  );
  content = content.replace(
    /title="Sur cette page"/g,
    'title={d.tableOfContents ?? "Sur cette page"}'
  );
  // Don't double-fix ones already done
  return content;
}

// Replace h2 headings
function fixH2Headings(content) {
  for (const [text, expr] of H2_MAP) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(<h2[^>]*>)\\s*${escaped}\\s*(</h2>)`, 'g');
    content = content.replace(regex, `$1${expr}$2`);
  }
  return content;
}

// Replace h3 headings
function fixH3Headings(content) {
  for (const [text, expr] of H3_MAP) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(<h3[^>]*>)\\s*${escaped}\\s*(</h3>)`, 'g');
    content = content.replace(regex, `$1${expr}$2`);
  }
  return content;
}

// Fix "The component is available in/at" paragraphs
function fixComponentAvailable(content) {
  content = content.replace(
    /<p>The component is available (?:in|at)\s/g,
    '<p>{d.componentAvailableAt ?? "The component is available in"} '
  );
  content = content.replace(
    /<p>Le composant est disponible dans\s/g,
    '<p>{d.componentAvailableAt ?? "Le composant est disponible dans"} '
  );
  content = content.replace(
    /<p>The components are available in\s/g,
    '<p>{d.componentAvailableAt ?? "The components are available in"} '
  );
  return content;
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip already fully-transformed files  
  const original = content;
  
  content = fixTocTitles(content);
  content = fixH2Headings(content);
  content = fixH3Headings(content);
  content = fixComponentAvailable(content);
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// ============================================================
// MAIN
// ============================================================
console.log('🔄 Phase 2: Complete i18n of all doc pages\n');

console.log('📦 Step 1: Adding common keys...');
addCommonKeys();

console.log('\n📝 Step 2: Transforming doc pages...');
const allFiles = [
  'design/alert', 'design/badge', 'design/button', 'design/card',
  'design/code', 'design/dialog', 'design/dropdown', 'design/form',
  'design/kbd', 'design/link', 'design/menudropdown', 'design/sheet',
  'design/switch', 'design/table', 'design/tabs', 'design/tooltip',
  'design/video', 'design/index',
  'components/accordion', 'components/avatar', 'components/breadcrumb',
  'components/gallery', 'components/pagination', 'components/progressbar',
  'components/skeleton', 'components/slider', 'components/timeline',
  'components/index',
  'layouts/base', 'layouts/doc', 'layouts/index',
  'templates/footer', 'templates/header', 'templates/table-of-contents',
  'templates/index',
];

let changed = 0, unchanged = 0;
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  const didChange = processFile(fp);
  if (didChange) {
    console.log(`  ✅ ${rel}`);
    changed++;
  } else {
    console.log(`  ⏩ ${rel} (no changes)`);
    unchanged++;
  }
}

console.log(`\n📊 Summary: ${changed} changed, ${unchanged} unchanged`);

// Count remaining un-i18n'd h2/h3 headings
console.log('\n🔍 Remaining hardcoded headings check...');
let remainingH2 = 0, remainingH3 = 0;
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (!fs.existsSync(fp)) continue;
  const content = fs.readFileSync(fp, 'utf8');
  
  // Find h2 headings with plain text (not {expression})
  const h2matches = content.match(/<h2[^>]*>[^{<]+<\/h2>/g) || [];
  const h3matches = content.match(/<h3[^>]*>[^{<]+<\/h3>/g) || [];
  
  if (h2matches.length > 0 || h3matches.length > 0) {
    const h2filtered = h2matches.filter(m => !m.includes('{d.') && !m.includes('{p.'));
    const h3filtered = h3matches.filter(m => !m.includes('{d.') && !m.includes('{p.'));
    if (h2filtered.length > 0 || h3filtered.length > 0) {
      console.log(`  ⚠️ ${rel}: ${h2filtered.length} h2, ${h3filtered.length} h3 remaining`);
      for (const h of [...h2filtered, ...h3filtered]) {
        console.log(`    → ${h.substring(0, 80)}`);
      }
      remainingH2 += h2filtered.length;
      remainingH3 += h3filtered.length;
    }
  }
}
console.log(`\n  Total remaining: ${remainingH2} h2, ${remainingH3} h3`);

// Count keys
for (const locale of ['fr', 'en', 'es', 'ar']) {
  const data = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf8'));
  const count = JSON.stringify(data).match(/"[^"]+"\s*:/g)?.length ?? 0;
  console.log(`  ${locale}.json: ~${count} keys`);
}
