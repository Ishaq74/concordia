#!/usr/bin/env node
/**
 * scripts/i18n-docs-phase5-tablecell.mjs
 * 
 * Phase 5: Translate all hardcoded <TableCell> description texts
 * and <li> items in doc pages.
 * 
 * Strategy:
 * - TYPE cells (string, boolean, enum) → leave as-is (code refs)
 * - DEFAULT cells (-, false, true, initial) → leave as-is (code defaults)  
 * - "required" defaults → d.required ?? "Required"
 * - DESCRIPTION cells → translate via docs.common keys
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');
const DOCS_BASE = path.join('src', 'pages', '[lang]', 'docs');

// ============================================================
// Common description translations: text → { key, fr, en, es, ar }
// ============================================================
const DESC_MAP = [
  // className descriptions
  { texts: ["Additional CSS classes", "Custom CSS classes", "Classes CSS supplémentaires", "CSS classes"], key: "descAdditionalCss", fr: "Classes CSS supplémentaires", en: "Additional CSS classes", es: "Clases CSS adicionales", ar: "فئات CSS إضافية" },
  // Visual style / variant
  { texts: ["Visual style", "Button visual style", "Visual style of the alert", "Visual style of the table", "Visual style of the dropdown", "Visual style of the tooltip", "Visual style of the link", "Visual style of the badge", "Visual style of the switch", "Visual style of the component", "Visual style of the accordion", "Visual style of the avatar", "Visual style of the breadcrumb", "Visual style of the gallery", "Visual style of the pagination", "Visual style of the progressbar", "Visual style of the skeleton", "Visual style of the slider", "Visual style of the timeline", "Visual style of the tabs", "Visual style of the code block", "Variante de style visuel"], key: "descVisualStyle", fr: "Style visuel du composant", en: "Visual style", es: "Estilo visual", ar: "النمط البصري" },
  // Button color / Color  
  { texts: ["Button color", "Component color", "Color", "Couleur du bouton", "Couleur"], key: "descColor", fr: "Couleur du composant", en: "Component color", es: "Color del componente", ar: "لون المكون" },
  // Disabled desc
  { texts: ["Disables the button", "Disables the component", "Disable the component", "Disables interaction", "Désactive le composant"], key: "descDisabled", fr: "Désactive le composant", en: "Disables the component", es: "Desactiva el componente", ar: "يعطل المكون" },
  // ARIA label
  { texts: ["ARIA accessibility label", "Accessibility label", "ARIA label", "Label d'accessibilité ARIA", "Accessible label"], key: "descAriaLabel", fr: "Label d'accessibilité ARIA", en: "ARIA accessibility label", es: "Etiqueta de accesibilidad ARIA", ar: "تسمية إمكانية الوصول ARIA" },
  // Icon desc
  { texts: ["Icon (name and side: left | right)", "Icon to display", "Icon name", "Icon name (Lucide)", "Custom icon", "Nom de l'icône"], key: "descIcon", fr: "Icône à afficher", en: "Icon to display", es: "Icono a mostrar", ar: "أيقونة للعرض" },
  // HTML button type  
  { texts: ["HTML button type", "Type de bouton HTML"], key: "descButtonType", fr: "Type de bouton HTML", en: "HTML button type", es: "Tipo de botón HTML", ar: "نوع زر HTML" },
  // Severity level
  { texts: ["Severity level", "Alert severity", "Niveau de sévérité"], key: "descSeverity", fr: "Niveau de sévérité", en: "Severity level", es: "Nivel de severidad", ar: "مستوى الخطورة" },
  // Alert title
  { texts: ["Alert title", "Titre de l'alerte"], key: "descAlertTitle", fr: "Titre de l'alerte", en: "Alert title", es: "Título de la alerta", ar: "عنوان التنبيه" },
  // Alert message
  { texts: ["Alert message", "Message de l'alerte"], key: "descAlertMessage", fr: "Message de l'alerte", en: "Alert message", es: "Mensaje de la alerta", ar: "رسالة التنبيه" },
  // Custom icon (with default by status)
  { texts: ["Custom icon (otherwise default icon by status)", "Icône personnalisée (sinon icône par défaut selon le statut)"], key: "descCustomIcon", fr: "Icône personnalisée (sinon icône par défaut selon le statut)", en: "Custom icon (otherwise default icon by status)", es: "Icono personalizado (sino icono por defecto según el estado)", ar: "أيقونة مخصصة (وإلا أيقونة افتراضية حسب الحالة)" },
  // Show close button
  { texts: ["Show a close button", "Afficher un bouton fermer", "Shows a close button"], key: "descShowClose", fr: "Afficher un bouton fermer", en: "Show a close button", es: "Mostrar un botón de cierre", ar: "إظهار زر إغلاق" },
  // Shadow depth
  { texts: ["Shadow depth", "Profondeur de l'ombre"], key: "descShadow", fr: "Profondeur de l'ombre", en: "Shadow depth", es: "Profundidad de sombra", ar: "عمق الظل" },
  // Hover/focus effects
  { texts: ["Hover/focus effects", "Effets survol/focus"], key: "descHoverFocus", fr: "Effets survol/focus", en: "Hover/focus effects", es: "Efectos hover/focus", ar: "تأثيرات التمرير/التركيز" },
  // Image URL
  { texts: ["Image URL", "URL de l'image", "Image source URL"], key: "descImageUrl", fr: "URL de l'image", en: "Image URL", es: "URL de la imagen", ar: "رابط الصورة" },
  // Alt text
  { texts: ["Alt text", "Texte alternatif", "Alternative text"], key: "descAltText", fr: "Texte alternatif", en: "Alt text", es: "Texto alternativo", ar: "نص بديل" },
  // Aspect ratio
  { texts: ['CSS aspect-ratio (e.g. "16/9")', "Ratio CSS (ex: 16/9)", "CSS aspect-ratio"], key: "descAspectRatio", fr: "Ratio CSS (ex: \"16/9\")", en: "CSS aspect-ratio (e.g. \"16/9\")", es: "Proporción CSS (ej: \"16/9\")", ar: "نسبة عرض CSS (مثال: \"16/9\")" },
  // Metadata entries
  { texts: ["Metadata entries", "Entrées de métadonnées"], key: "descMetadata", fr: "Entrées de métadonnées", en: "Metadata entries", es: "Entradas de metadatos", ar: "إدخالات البيانات الوصفية" },
  // Description text
  { texts: ["Description text", "Texte de description"], key: "descText", fr: "Texte de description", en: "Description text", es: "Texto de descripción", ar: "نص الوصف" },
  // Truncate text
  { texts: ["Truncate text", "Tronquer le texte"], key: "descTruncate", fr: "Tronquer le texte", en: "Truncate text", es: "Truncar texto", ar: "اقتطاع النص" },
  // Max lines
  { texts: ["Max lines", "Max lignes", "Maximum lines"], key: "descMaxLines", fr: "Nombre maximum de lignes", en: "Max lines", es: "Líneas máximas", ar: "الحد الأقصى للأسطر" },
  // Content alignment  
  { texts: ["Content alignment", "Alignement du contenu"], key: "descAlignment", fr: "Alignement du contenu", en: "Content alignment", es: "Alineación del contenido", ar: "محاذاة المحتوى" },
  // Menu items  
  { texts: ["Menu items array", "Menu items", "Tableau d'éléments de menu"], key: "descMenuItems", fr: "Tableau d'éléments de menu", en: "Menu items array", es: "Array de elementos del menú", ar: "مصفوفة عناصر القائمة" },
  // Menu position
  { texts: ["Menu position relative to the trigger", "Position du menu par rapport au déclencheur", "Position relative to trigger"], key: "descMenuPosition", fr: "Position du menu par rapport au déclencheur", en: "Menu position relative to the trigger", es: "Posición del menú relativa al disparador", ar: "موضع القائمة بالنسبة للمشغل" },
  // Button text / label
  { texts: ["Button text", "Texte du bouton", "Trigger button text"], key: "descButtonText", fr: "Texte du bouton", en: "Button text", es: "Texto del botón", ar: "نص الزر" },
  // Button icon
  { texts: ["Button icon", "Icône du bouton"], key: "descButtonIcon", fr: "Icône du bouton", en: "Button icon", es: "Icono del botón", ar: "أيقونة الزر" },
  // Required (for defaults)
  { texts: ["required", "Required", "Requis", "requis"], key: "required", fr: "Requis", en: "Required", es: "Requerido", ar: "مطلوب" },
  // Unique ID  
  { texts: ["ID unique pour le checkbox caché", "Unique ID for the hidden checkbox", "Unique ID"], key: "descUniqueId", fr: "ID unique pour le checkbox caché", en: "Unique ID for the hidden checkbox", es: "ID único para el checkbox oculto", ar: "معرف فريد لمربع الاختيار المخفي" },
  // Checkbox ID must match
  { texts: ["ID du checkbox (doit correspondre à Sheet.id)", "Checkbox ID (must match Sheet.id)"], key: "descCheckboxId", fr: "ID du checkbox (doit correspondre à Sheet.id)", en: "Checkbox ID (must match Sheet.id)", es: "ID del checkbox (debe corresponder a Sheet.id)", ar: "معرف مربع الاختيار (يجب أن يتطابق مع Sheet.id)" },
  // Side from which sheet slides
  { texts: ["Côté depuis lequel le sheet glisse", "Side from which the sheet slides"], key: "descSheetSide", fr: "Côté depuis lequel le sheet glisse", en: "Side from which the sheet slides", es: "Lado desde el cual se desliza el sheet", ar: "الجانب الذي ينزلق منه الـ sheet" },
  // Dialog size
  { texts: ["Dialog maximum width", "Largeur maximale du dialogue", "Maximum width"], key: "descDialogWidth", fr: "Largeur maximale du dialogue", en: "Dialog maximum width", es: "Ancho máximo del diálogo", ar: "الحد الأقصى لعرض الحوار" },
  // Tooltip/position
  { texts: ["Tooltip position", "Position de l'info-bulle"], key: "descTooltipPosition", fr: "Position de l'info-bulle", en: "Tooltip position", es: "Posición del tooltip", ar: "موضع التلميح" },
  // Tooltip text
  { texts: ["Text to display in tooltip", "Texte à afficher dans l'info-bulle", "Tooltip text", "Text to display"], key: "descTooltipText", fr: "Texte à afficher dans l'info-bulle", en: "Text to display in tooltip", es: "Texto a mostrar en el tooltip", ar: "النص المراد عرضه في التلميح" },
  // Delay
  { texts: ["Delay before showing (ms)", "Délai avant affichage (ms)", "Show delay in ms"], key: "descDelay", fr: "Délai avant affichage (ms)", en: "Delay before showing (ms)", es: "Retraso antes de mostrar (ms)", ar: "التأخير قبل العرض (بالمللي ثانية)" },
  // Video/media  
  { texts: ["Video source URL", "URL de la source vidéo", "Video URL"], key: "descVideoUrl", fr: "URL de la source vidéo", en: "Video source URL", es: "URL de la fuente de video", ar: "رابط مصدر الفيديو" },
  { texts: ["Show playback controls", "Afficher les contrôles de lecture"], key: "descShowControls", fr: "Afficher les contrôles de lecture", en: "Show playback controls", es: "Mostrar controles de reproducción", ar: "إظهار عناصر التحكم في التشغيل" },
  { texts: ["Autoplay the video", "Lecture automatique", "Auto-play video"], key: "descAutoplay", fr: "Lecture automatique", en: "Autoplay the video", es: "Reproducción automática del video", ar: "تشغيل تلقائي للفيديو" },
  { texts: ["Loop the video", "Boucler la vidéo", "Loop video"], key: "descLoop", fr: "Boucler la vidéo", en: "Loop the video", es: "Repetir el video", ar: "تكرار الفيديو" },
  { texts: ["Mute by default", "Muet par défaut", "Muted"], key: "descMuted", fr: "Muet par défaut", en: "Mute by default", es: "Silenciado por defecto", ar: "صامت بشكل افتراضي" },
  { texts: ["Video width", "Largeur de la vidéo"], key: "descVideoWidth", fr: "Largeur de la vidéo", en: "Video width", es: "Ancho del video", ar: "عرض الفيديو" },
  { texts: ["Video height", "Hauteur de la vidéo"], key: "descVideoHeight", fr: "Hauteur de la vidéo", en: "Video height", es: "Altura del video", ar: "ارتفاع الفيديو" },
  { texts: ["Poster image URL", "URL de l'image poster"], key: "descPoster", fr: "URL de l'image poster", en: "Poster image URL", es: "URL de la imagen poster", ar: "رابط صورة الملصق" },
  // Switch
  { texts: ["Checked state", "État coché", "Switch state"], key: "descChecked", fr: "État coché", en: "Checked state", es: "Estado marcado", ar: "حالة التحديد" },
  { texts: ["Switch label text", "Texte du label", "Label text"], key: "descLabelText", fr: "Texte du label", en: "Label text", es: "Texto de la etiqueta", ar: "نص التسمية" },
  { texts: ["Error message text", "Texte du message d'erreur", "Error message"], key: "descErrorMessage", fr: "Texte du message d'erreur", en: "Error message text", es: "Texto del mensaje de error", ar: "نص رسالة الخطأ" },
  // Accordion
  { texts: ["Only one panel open at a time", "Un seul panneau ouvert à la fois"], key: "descSingleMode", fr: "Un seul panneau ouvert à la fois", en: "Only one panel open at a time", es: "Solo un panel abierto a la vez", ar: "لوحة واحدة فقط مفتوحة في كل مرة" },
  { texts: ["Panel title", "Titre du panneau", "Item title"], key: "descPanelTitle", fr: "Titre du panneau", en: "Panel title", es: "Título del panel", ar: "عنوان اللوحة" },
  { texts: ["Panel content", "Contenu du panneau", "Item content"], key: "descPanelContent", fr: "Contenu du panneau", en: "Panel content", es: "Contenido del panel", ar: "محتوى اللوحة" },
  { texts: ["Open by default", "Ouvert par défaut"], key: "descOpenDefault", fr: "Ouvert par défaut", en: "Open by default", es: "Abierto por defecto", ar: "مفتوح بشكل افتراضي" },
  // Pagination
  { texts: ["Current active page", "Page active actuelle"], key: "descCurrentPage", fr: "Page active actuelle", en: "Current active page", es: "Página activa actual", ar: "الصفحة النشطة الحالية" },
  { texts: ["Total number of pages", "Nombre total de pages"], key: "descTotalPages", fr: "Nombre total de pages", en: "Total number of pages", es: "Número total de páginas", ar: "العدد الإجمالي للصفحات" },
  { texts: ["Base URL for links", "URL de base pour les liens"], key: "descBaseUrl", fr: "URL de base pour les liens", en: "Base URL for links", es: "URL base para los enlaces", ar: "الرابط الأساسي للروابط" },
  { texts: ["Number of pages around current", "Nombre de pages autour de la courante"], key: "descSiblingCount", fr: "Nombre de pages autour de la courante", en: "Number of pages around current", es: "Número de páginas alrededor de la actual", ar: "عدد الصفحات حول الحالية" },
  { texts: ["Show first/last page buttons", "Afficher les boutons première/dernière page"], key: "descShowEdges", fr: "Afficher les boutons première/dernière page", en: "Show first/last page buttons", es: "Mostrar botones primera/última página", ar: "إظهار أزرار الصفحة الأولى/الأخيرة" },
  // Progress bar
  { texts: ["Progress value (0-100)", "Valeur de progression (0-100)"], key: "descProgressValue", fr: "Valeur de progression (0-100)", en: "Progress value (0-100)", es: "Valor de progreso (0-100)", ar: "قيمة التقدم (0-100)" },
  { texts: ["Custom label text", "Texte du label personnalisé"], key: "descCustomLabel", fr: "Texte du label personnalisé", en: "Custom label text", es: "Texto de etiqueta personalizado", ar: "نص التسمية المخصص" },
  { texts: ["Show percentage text", "Afficher le pourcentage"], key: "descShowPercent", fr: "Afficher le pourcentage", en: "Show percentage text", es: "Mostrar texto de porcentaje", ar: "إظهار نص النسبة المئوية" },
  { texts: ["Add stripes", "Ajouter des rayures", "Show stripes"], key: "descStripes", fr: "Ajouter des rayures", en: "Add stripes", es: "Agregar rayas", ar: "إضافة خطوط" },
  { texts: ["Animate the stripes", "Animer les rayures"], key: "descAnimateStripes", fr: "Animer les rayures", en: "Animate the stripes", es: "Animar las rayas", ar: "تحريك الخطوط" },
  // Skeleton
  { texts: ["Skeleton shape", "Forme du squelette", "Shape"], key: "descShape", fr: "Forme du skeleton", en: "Skeleton shape", es: "Forma del skeleton", ar: "شكل الهيكل" },
  { texts: ["Animation enabled", "Animation activée", "Enable animation"], key: "descAnimation", fr: "Animation activée", en: "Animation enabled", es: "Animación activada", ar: "تفعيل الحركة" },
  { texts: ["Custom width", "Largeur personnalisée", "Element width"], key: "descWidth", fr: "Largeur personnalisée", en: "Custom width", es: "Ancho personalizado", ar: "عرض مخصص" },
  { texts: ["Custom height", "Hauteur personnalisée", "Element height"], key: "descHeight", fr: "Hauteur personnalisée", en: "Custom height", es: "Altura personalizada", ar: "ارتفاع مخصص" },
  // Gallery
  { texts: ["Array of images", "Tableau d'images", "Image array"], key: "descImageArray", fr: "Tableau d'images", en: "Array of images", es: "Array de imágenes", ar: "مصفوفة الصور" },
  { texts: ["Display mode", "Mode d'affichage"], key: "descDisplayMode", fr: "Mode d'affichage", en: "Display mode", es: "Modo de visualización", ar: "وضع العرض" },
  { texts: ["Number of columns", "Nombre de colonnes"], key: "descColumns", fr: "Nombre de colonnes", en: "Number of columns", es: "Número de columnas", ar: "عدد الأعمدة" },
  { texts: ["Gap between images", "Espacement entre images"], key: "descGap", fr: "Espacement entre images", en: "Gap between images", es: "Espacio entre imágenes", ar: "المسافة بين الصور" },
  // Timeline
  { texts: ["Array of events", "Tableau d'événements", "Events array"], key: "descEventArray", fr: "Tableau d'événements", en: "Array of events", es: "Array de eventos", ar: "مصفوفة الأحداث" },
  { texts: ["Timeline orientation", "Orientation de la timeline"], key: "descOrientation", fr: "Orientation de la timeline", en: "Timeline orientation", es: "Orientación de la línea de tiempo", ar: "اتجاه الخط الزمني" },
  { texts: ["Icon shape", "Forme de l'icône"], key: "descIconShape", fr: "Forme de l'icône", en: "Icon shape", es: "Forma del icono", ar: "شكل الأيقونة" },
  // Breadcrumb
  { texts: ["Breadcrumb items", "Éléments du fil d'Ariane"], key: "descBreadcrumbItems", fr: "Éléments du fil d'Ariane", en: "Breadcrumb items", es: "Elementos de la miga de pan", ar: "عناصر مسار التنقل" },
  { texts: ["Link destination URL", "URL de destination du lien", "Link URL", "Link href"], key: "descLinkUrl", fr: "URL de destination du lien", en: "Link destination URL", es: "URL de destino del enlace", ar: "رابط الوجهة" },
  { texts: ["Current page text", "Texte de la page actuelle"], key: "descCurrentPageText", fr: "Texte de la page actuelle", en: "Current page text", es: "Texto de la página actual", ar: "نص الصفحة الحالية" },
  { texts: ["Custom separator element", "Élément séparateur personnalisé", "Separator character"], key: "descSeparator", fr: "Élément séparateur personnalisé", en: "Custom separator element", es: "Elemento separador personalizado", ar: "عنصر الفاصل المخصص" },
  // Slider
  { texts: ["Slides to display", "Diapositives à afficher", "Items to display"], key: "descSlides", fr: "Diapositives à afficher", en: "Slides to display", es: "Diapositivas a mostrar", ar: "الشرائح للعرض" },
  { texts: ["Show navigation arrows", "Afficher les flèches de navigation"], key: "descShowArrows", fr: "Afficher les flèches de navigation", en: "Show navigation arrows", es: "Mostrar flechas de navegación", ar: "إظهار أسهم التنقل" },
  { texts: ["Auto scroll interval (ms)", "Intervalle de défilement auto (ms)"], key: "descAutoScroll", fr: "Intervalle de défilement auto (ms)", en: "Auto scroll interval (ms)", es: "Intervalo de desplazamiento automático (ms)", ar: "فاصل التمرير التلقائي (بالمللي ثانية)" },
  // Avatar
  { texts: ["Avatar image URL", "URL de l'image avatar", "User image URL"], key: "descAvatarUrl", fr: "URL de l'image avatar", en: "Avatar image URL", es: "URL de la imagen de avatar", ar: "رابط صورة الملف الرمزي" },
  { texts: ["Displayed name", "Nom affiché", "User name"], key: "descName", fr: "Nom affiché", en: "Displayed name", es: "Nombre mostrado", ar: "الاسم المعروض" },
  { texts: ["Avatar size", "Taille de l'avatar"], key: "descAvatarSize", fr: "Taille de l'avatar", en: "Avatar size", es: "Tamaño del avatar", ar: "حجم الصورة الرمزية" },
  { texts: ["Initials to display (fallback)", "Initiales à afficher (fallback)"], key: "descInitials", fr: "Initiales à afficher (fallback)", en: "Initials to display (fallback)", es: "Iniciales a mostrar (respaldo)", ar: "الأحرف الأولى للعرض (احتياطي)" },
  // Tabs
  { texts: ["Tab label", "Label de l'onglet"], key: "descTabLabel", fr: "Label de l'onglet", en: "Tab label", es: "Etiqueta de la pestaña", ar: "تسمية علامة التبويب" },
  { texts: ["Tab content", "Contenu de l'onglet"], key: "descTabContent", fr: "Contenu de l'onglet", en: "Tab content", es: "Contenido de la pestaña", ar: "محتوى علامة التبويب" },
  { texts: ["Default active tab", "Onglet actif par défaut"], key: "descActiveTab", fr: "Onglet actif par défaut", en: "Default active tab", es: "Pestaña activa por defecto", ar: "علامة التبويب النشطة الافتراضية" },
  // Link
  { texts: ["Link URL", "URL du lien"], key: "descLinkHref", fr: "URL du lien", en: "Link URL", es: "URL del enlace", ar: "رابط URL" },
  { texts: ["Link text", "Texte du lien"], key: "descLinkText", fr: "Texte du lien", en: "Link text", es: "Texto del enlace", ar: "نص الرابط" },
  { texts: ["Open in new tab", "Ouvrir dans un nouvel onglet"], key: "descNewTab", fr: "Ouvrir dans un nouvel onglet", en: "Open in new tab", es: "Abrir en nueva pestaña", ar: "فتح في علامة تبويب جديدة" },
  { texts: ["External link indicator", "Indicateur de lien externe", "Show external link icon"], key: "descExternal", fr: "Indicateur de lien externe", en: "External link indicator", es: "Indicador de enlace externo", ar: "مؤشر الرابط الخارجي" },
  // Badge
  { texts: ["Badge text", "Texte du badge", "Badge content"], key: "descBadgeText", fr: "Texte du badge", en: "Badge text", es: "Texto de la insignia", ar: "نص الشارة" },
  { texts: ["Badge status/color", "Statut/couleur du badge"], key: "descBadgeStatus", fr: "Statut/couleur du badge", en: "Badge status/color", es: "Estado/color de la insignia", ar: "حالة/لون الشارة" },
  // Table
  { texts: ["Striped rows", "Lignes rayées", "Alternate row colors"], key: "descStriped", fr: "Lignes rayées", en: "Striped rows", es: "Filas rayadas", ar: "صفوف مخططة" },
  // Kbd
  { texts: ["Key text to display", "Texte de la touche à afficher"], key: "descKeyText", fr: "Texte de la touche à afficher", en: "Key text to display", es: "Texto de la tecla a mostrar", ar: "نص المفتاح للعرض" },
  // Code
  { texts: ["Source code to display", "Code source à afficher", "Code to highlight"], key: "descCodeSource", fr: "Code source à afficher", en: "Source code to display", es: "Código fuente a mostrar", ar: "الكود المصدري للعرض" },
  { texts: ["Programming language", "Langage de programmation", "Code language"], key: "descLanguage", fr: "Langage de programmation", en: "Programming language", es: "Lenguaje de programación", ar: "لغة البرمجة" },
  { texts: ["Show line numbers", "Afficher les numéros de ligne"], key: "descShowLineNumbers", fr: "Afficher les numéros de ligne", en: "Show line numbers", es: "Mostrar números de línea", ar: "إظهار أرقام الأسطر" },
  { texts: ["Color theme", "Thème de couleurs", "Syntax theme"], key: "descTheme", fr: "Thème de couleurs", en: "Color theme", es: "Tema de colores", ar: "سمة الألوان" },
  // Form
  { texts: ["Input name attribute", "Attribut name de l'input"], key: "descInputName", fr: "Attribut name de l'input", en: "Input name attribute", es: "Atributo name del input", ar: "خاصية name للحقل" },
  { texts: ["Input label", "Label de l'input", "Field label"], key: "descInputLabel", fr: "Label de l'input", en: "Input label", es: "Etiqueta del input", ar: "تسمية الحقل" },
  { texts: ["Placeholder text", "Texte placeholder"], key: "descPlaceholder", fr: "Texte placeholder", en: "Placeholder text", es: "Texto placeholder", ar: "نص العنصر النائب" },
  { texts: ["Required field", "Champ obligatoire", "Field is required"], key: "descRequired", fr: "Champ obligatoire", en: "Required field", es: "Campo obligatorio", ar: "حقل مطلوب" },
  // Submit a form / comparison table  
  { texts: ["Submit a form"], key: "descSubmitForm", fr: "Soumettre un formulaire", en: "Submit a form", es: "Enviar un formulario", ar: "إرسال نموذج" },
  { texts: ["JavaScript action"], key: "descJsAction", fr: "Action JavaScript", en: "JavaScript action", es: "Acción JavaScript", ar: "إجراء JavaScript" },
  { texts: ["Navigate to a page"], key: "descNavigate", fr: "Naviguer vers une page", en: "Navigate to a page", es: "Navegar a una página", ar: "الانتقال إلى صفحة" },
  { texts: ["External link"], key: "descExternalLink", fr: "Lien externe", en: "External link", es: "Enlace externo", ar: "رابط خارجي" },
];

// ============================================================
// Add all description keys to docs.common
// ============================================================
function addDescKeys() {
  for (const locale of ['fr', 'en', 'es', 'ar']) {
    const filePath = path.join(I18N_DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let added = 0;
    for (const entry of DESC_MAP) {
      if (!data.docs.common[entry.key]) {
        data.docs.common[entry.key] = entry[locale];
        added++;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  ${locale}.json: +${added} description keys`);
  }
}

// ============================================================
// Replace matching TableCell descriptions in files
// ============================================================
function processFile(filePath) {
  if (!fs.existsSync(filePath)) return { changed: false, replaced: 0 };
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let replacedCount = 0;

  for (const entry of DESC_MAP) {
    for (const text of entry.texts) {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match <TableCell>exactText</TableCell>
      const regex = new RegExp(`<TableCell>${escaped}</TableCell>`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, `<TableCell>{d.${entry.key} ?? "${text}"}</TableCell>`);
        replacedCount += matches.length;
      }
    }
  }

  // Also fix standalone "required" in TableCell (for defaults column)
  content = content.replace(/<TableCell>required<\/TableCell>/g, '<TableCell>{d.required ?? "required"}</TableCell>');
  content = content.replace(/<TableCell>Required<\/TableCell>/g, '<TableCell>{d.required ?? "Required"}</TableCell>');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { changed: true, replaced: replacedCount };
  }
  return { changed: false, replaced: 0 };
}

// ============================================================
// MAIN
// ============================================================
console.log('🔄 Phase 5: Fix TableCell descriptions\n');

console.log('📦 Adding description keys...');
addDescKeys();

const allFiles = [
  'design/alert', 'design/badge', 'design/button', 'design/card',
  'design/code', 'design/dialog', 'design/dropdown', 'design/form',
  'design/kbd', 'design/link', 'design/menudropdown', 'design/sheet',
  'design/switch', 'design/table', 'design/tabs', 'design/tooltip',
  'design/video',
  'components/accordion', 'components/avatar', 'components/breadcrumb',
  'components/gallery', 'components/pagination', 'components/progressbar',
  'components/skeleton', 'components/slider', 'components/timeline',
  'layouts/base', 'layouts/doc',
  'templates/footer', 'templates/header', 'templates/table-of-contents',
];

console.log('\n📝 Replacing TableCell descriptions...');
let totalChanged = 0, totalReplaced = 0;
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  const { changed, replaced } = processFile(fp);
  if (changed) {
    console.log(`  ✅ ${rel} (${replaced} replacements)`);
    totalChanged++;
    totalReplaced += replaced;
  }
}
console.log(`\n📊 Files changed: ${totalChanged}, Total replacements: ${totalReplaced}`);

// Count remaining hardcoded TableCells
let remaining = 0;
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  const matches = (c.match(/<TableCell>[^{<][^<]*<\/TableCell>/g) || [])
    .filter(m => !m.includes('{d.') && !m.includes('{p.'));
  remaining += matches.length;
  if (matches.length > 0) {
    console.log(`  ⚠️ ${rel}: ${matches.length} remaining`);
    for (const m of matches.slice(0, 5)) {
      console.log(`    → ${m.substring(0, 80)}`);
    }
  }
}
console.log(`\nTotal remaining TableCells: ${remaining}`);

// Key count
for (const locale of ['fr', 'en', 'es', 'ar']) {
  const data = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), 'utf8'));
  const count = JSON.stringify(data).match(/"[^"]+"\s*:/g)?.length ?? 0;
  console.log(`  ${locale}.json: ~${count} keys`);
}
