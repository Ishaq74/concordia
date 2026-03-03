/**
 * Final pass — add ALL remaining missing i18n keys to all 4 locale JSON files.
 * Covers: aria labels, public pages, auth, legal headings, admin blog forms/placeholders/media.
 * Run: node scripts/add-final-i18n-keys.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = resolve(__dirname, "../src/i18n");
const locales = ["fr", "en", "es", "ar"];

const newKeys = {
  // ── Accessibility / ARIA ──────────────────────────────────────────
  aria: {
    features:           { fr: "Fonctionnalités",         en: "Features",              es: "Características",           ar: "الميزات" },
    breadcrumb:         { fr: "Fil d'Ariane",            en: "Breadcrumb",            es: "Migas de pan",              ar: "مسار التنقل" },
    tableOfContents:    { fr: "Table des matières",      en: "Table of contents",     es: "Tabla de contenido",        ar: "جدول المحتويات" },
    authorArticles:     { fr: "Articles de l'auteur",    en: "Author's articles",     es: "Artículos del autor",       ar: "مقالات المؤلف" },
    callToAction:       { fr: "Appel à l'action",        en: "Call to action",        es: "Llamada a la acción",       ar: "دعوة للعمل" },
    organizationsList:  { fr: "Liste des organisations", en: "List of organizations", es: "Lista de organizaciones",   ar: "قائمة المنظمات" },
    emailLabel:         { fr: "Adresse e-mail",          en: "Email address",         es: "Dirección de correo",       ar: "عنوان البريد الإلكتروني" },
  },

  // ── Organizations page ────────────────────────────────────────────
  organizations: {
    pageDescription: {
      fr: "Médias locaux, associations, collectifs — les acteurs qui animent la communauté et produisent du contenu de qualité.",
      en: "Local media, associations, collectives — the actors who enliven the community and produce quality content.",
      es: "Medios locales, asociaciones, colectivos — los actores que animan la comunidad y producen contenido de calidad.",
      ar: "الإعلام المحلي، الجمعيات، التجمعات — الفاعلون الذين ينشطون المجتمع وينتجون محتوى عالي الجودة.",
    },
    reviewCount: { fr: "avis",  en: "reviews", es: "reseñas", ar: "تقييمات" },
  },

  // ── Blog additions ────────────────────────────────────────────────
  blog: {
    authorMetaDesc: {
      fr: "Découvrez les articles écrits par",
      en: "Discover articles written by",
      es: "Descubre los artículos escritos por",
      ar: "اكتشف المقالات التي كتبها",
    },
  },

  // ── Auth additions ────────────────────────────────────────────────
  auth: {
    unknownOrganization: { fr: "Organisation",    en: "Organization",    es: "Organización",    ar: "منظمة" },
    roleMember:          { fr: "Membre",           en: "Member",          es: "Miembro",         ar: "عضو" },
    roleAdmin:           { fr: "Administrateur",   en: "Administrator",   es: "Administrador",   ar: "مدير" },
    roleOwner:           { fr: "Propriétaire",     en: "Owner",           es: "Propietario",     ar: "مالك" },
  },

  // ── Legal page section headings ───────────────────────────────────
  legalPage: {
    // Tab 1 — Mentions Légales
    legalNotices:        { fr: "Mentions Légales",                              en: "Legal Notices",               es: "Avisos legales",                    ar: "إشعارات قانونية" },
    siteIdentity:        { fr: "Identité du Site",                              en: "Site Identity",               es: "Identidad del sitio",               ar: "هوية الموقع" },
    hosting:             { fr: "Hébergement",                                    en: "Hosting",                     es: "Alojamiento",                       ar: "الاستضافة" },
    publicationDirector: { fr: "Directeur de publication",                       en: "Publication Director",        es: "Director de publicación",           ar: "مدير النشر" },
    contactUs:           { fr: "Nous contacter",                                 en: "Contact us",                  es: "Contáctenos",                       ar: "اتصل بنا" },
    byPhone:             { fr: "Par téléphone :",                                en: "By phone:",                   es: "Por teléfono:",                     ar: "عبر الهاتف:" },
    byEmail:             { fr: "Par email :",                                    en: "By email:",                   es: "Por correo:",                       ar: "عبر البريد الإلكتروني:" },
    byMail:              { fr: "Par courrier :",                                 en: "By mail:",                    es: "Por correo postal:",                ar: "عبر البريد:" },
    personalData:        { fr: "Données personnelles",                           en: "Personal Data",               es: "Datos personales",                  ar: "البيانات الشخصية" },
    disputes:            { fr: "Litiges",                                        en: "Disputes",                    es: "Disputas",                          ar: "النزاعات" },
    // Tab 2 — Politique de Confidentialité
    companyInfo:          { fr: "Informations sur l'entreprise",                  en: "Company Information",         es: "Información de la empresa",         ar: "معلومات الشركة" },
    dataCollection:       { fr: "Collecte des données personnelles",              en: "Personal Data Collection",    es: "Recopilación de datos personales",  ar: "جمع البيانات الشخصية" },
    dataCollectionPurpose:{ fr: "But de la collecte des données",                 en: "Purpose of Data Collection",  es: "Propósito de la recopilación",      ar: "غرض جمع البيانات" },
    consent:              { fr: "Consentement",                                   en: "Consent",                     es: "Consentimiento",                    ar: "الموافقة" },
    dataUsage:            { fr: "Utilisation des données",                        en: "Data Usage",                  es: "Uso de datos",                      ar: "استخدام البيانات" },
    dataSharing:          { fr: "Partage des données",                            en: "Data Sharing",                es: "Compartir datos",                   ar: "مشاركة البيانات" },
    userRights:           { fr: "Droits des utilisateurs",                        en: "User Rights",                 es: "Derechos del usuario",              ar: "حقوق المستخدمين" },
    cookies:              { fr: "Cookies et suivi en ligne",                      en: "Cookies and Online Tracking", es: "Cookies y seguimiento en línea",    ar: "ملفات تعريف الارتباط والتتبع" },
    policyUpdates:        { fr: "Mises à jour de la politique de confidentialité",en: "Privacy Policy Updates",      es: "Actualizaciones de la política",    ar: "تحديثات سياسة الخصوصية" },
    contactDetails:       { fr: "Coordonnées de contact",                         en: "Contact Details",             es: "Datos de contacto",                 ar: "تفاصيل الاتصال" },
    // Tab 3 — Conditions Générales de Vente
    termsOfSale:  { fr: "Conditions Générales de Vente", en: "Terms of Sale",            es: "Condiciones generales de venta", ar: "شروط البيع العامة" },
    scope:        { fr: "Champ d'application",           en: "Scope",                     es: "Ámbito de aplicación",           ar: "نطاق التطبيق" },
    orders:       { fr: "Commandes",                     en: "Orders",                    es: "Pedidos",                        ar: "الطلبات" },
    pricing:      { fr: "Prix",                          en: "Pricing",                   es: "Precios",                        ar: "الأسعار" },
    payment:      { fr: "Paiement",                      en: "Payment",                   es: "Pago",                           ar: "الدفع" },
    delivery:     { fr: "Livraison",                     en: "Delivery",                  es: "Entrega",                        ar: "التوصيل" },
    withdrawal:   { fr: "Droit de rétractation",         en: "Right of Withdrawal",       es: "Derecho de desistimiento",       ar: "حق الانسحاب" },
    warranty:     { fr: "Garantie",                      en: "Warranty",                  es: "Garantía",                       ar: "الضمان" },
    liability:    { fr: "Responsabilité",                en: "Liability",                 es: "Responsabilidad",                ar: "المسؤولية" },
  },

  // ── Admin Blog — form placeholders & labels ───────────────────────
  adminBlog: {
    form: {
      titleIn:               { fr: "Titre en",                       en: "Title in",                      es: "Título en",                     ar: "العنوان بـ" },
      subtitlePlaceholder:   { fr: "Sous-titre optionnel…",          en: "Optional subtitle…",            es: "Subtítulo opcional…",           ar: "عنوان فرعي اختياري…" },
      excerptIn:             { fr: "Résumé court en",                en: "Short summary in",              es: "Resumen corto en",              ar: "ملخص قصير بـ" },
      contentPlaceholder:    { fr: "Écrivez votre article en Markdown…", en: "Write your article in Markdown…", es: "Escribe tu artículo en Markdown…", ar: "اكتب مقالك بتنسيق Markdown…" },
      seoSection:            { fr: "SEO —",                          en: "SEO —",                         es: "SEO —",                         ar: "— SEO" },
      seoTitlePlaceholder:   { fr: "Titre pour les moteurs de recherche…",  en: "Title for search engines…",     es: "Título para motores de búsqueda…", ar: "عنوان لمحركات البحث…" },
      seoDescPlaceholder:    { fr: "160 caractères max…",            en: "160 characters max…",           es: "160 caracteres máx…",           ar: "160 حرفاً كحد أقصى…" },
      seoKeywordsPlaceholder:{ fr: "mot-clé1, mot-clé2, mot-clé3…", en: "keyword1, keyword2, keyword3…", es: "palabra1, palabra2, palabra3…", ar: "كلمة1، كلمة2، كلمة3…" },
      slugAutoHint:          { fr: "Auto-généré depuis le titre si vide",  en: "Auto-generated from title if empty",  es: "Auto-generado desde el título si vacío",  ar: "يُنشأ تلقائياً من العنوان إذا كان فارغاً" },
      existingTranslation:   { fr: "Traduction existante",           en: "Existing translation",          es: "Traducción existente",          ar: "ترجمة موجودة" },
      nameIn:                { fr: "Nom en",                         en: "Name in",                       es: "Nombre en",                     ar: "الاسم بـ" },
      firstNameIn:           { fr: "Prénom en",                      en: "First name in",                 es: "Nombre de pila en",             ar: "الاسم الأول بـ" },
      lastNameIn:            { fr: "Nom de famille en",              en: "Last name in",                  es: "Apellido en",                   ar: "اسم العائلة بـ" },
      titleRolePlaceholder:  { fr: "Ex. : Rédacteur en chef",       en: "E.g.: Editor in chief",         es: "Ej.: Redactor jefe",            ar: "مثال: رئيس التحرير" },
      bioIn:                 { fr: "Biographie en",                  en: "Bio in",                        es: "Biografía en",                  ar: "السيرة بـ" },
      seoTitleIn:            { fr: "Titre SEO en",                   en: "SEO Title in",                  es: "Título SEO en",                 ar: "عنوان SEO بـ" },
      seoDescIn:             { fr: "Description SEO en",             en: "SEO Description in",            es: "Descripción SEO en",            ar: "وصف SEO بـ" },
      socialHint:            { fr: "URLs de profils sociaux, une par ligne. Seront stockés en JSON-LD sameAs.", en: "Social profile URLs, one per line. Will be stored as JSON-LD sameAs.", es: "URLs de perfiles sociales, una por línea.", ar: "روابط الملفات الاجتماعية، واحد في كل سطر." },
      authorSlugHint:        { fr: "URL : /blog/author/…",          en: "URL: /blog/author/…",           es: "URL: /blog/author/…",           ar: "…/URL: /blog/author" },
      organization:          { fr: "Organisation",                   en: "Organization",                  es: "Organización",                  ar: "منظمة" },
      none:                  { fr: "Aucune",                         en: "None",                          es: "Ninguna",                       ar: "لا شيء" },
      categorySlugHint:      { fr: "URL de la catégorie : /blog/categorie/…", en: "Category URL: /blog/category/…", es: "URL de la categoría: /blog/categoría/…", ar: "…/رابط التصنيف: /blog/category" },
      categoryNameIn:        { fr: "Nom en",                         en: "Name in",                       es: "Nombre en",                     ar: "الاسم بـ" },
      descriptionIn:         { fr: "Description en",                 en: "Description in",                es: "Descripción en",                ar: "الوصف بـ" },
    },
    articles: {
      searchPlaceholder: { fr: "Titre, slug…",  en: "Title, slug…",  es: "Título, slug…",  ar: "عنوان، slug…" },
      edit:              { fr: "Modifier",       en: "Edit",          es: "Editar",         ar: "تعديل" },
      duplicate:         { fr: "Dupliquer",      en: "Duplicate",     es: "Duplicar",       ar: "تكرار" },
      unpublish:         { fr: "Dépublier",      en: "Unpublish",     es: "Despublicar",    ar: "إلغاء النشر" },
      publish:           { fr: "Publier",        en: "Publish",       es: "Publicar",       ar: "نشر" },
    },
    authors: {
      homeCount:         { fr: "Accueil",   en: "Home",      es: "Inicio",     ar: "الرئيسية" },
      blogCount:         { fr: "Blog",      en: "Blog",      es: "Blog",       ar: "المدونة" },
      articleCount:      { fr: "article",   en: "article",   es: "artículo",   ar: "مقال" },
      articleCountPlural:{ fr: "articles",  en: "articles",  es: "artículos",  ar: "مقالات" },
      home:              { fr: "Accueil",   en: "Home",      es: "Inicio",     ar: "الرئيسية" },
      blog:              { fr: "Blog",      en: "Blog",      es: "Blog",       ar: "المدونة" },
    },
    categories: {
      total:           { fr: "Total",          en: "Total",       es: "Total",       ar: "الإجمالي" },
      featuredCount:   { fr: "En vedette",     en: "Featured",    es: "Destacadas",  ar: "مميزة" },
      featuredFilter:  { fr: "En vedette",     en: "Featured",    es: "Destacadas",  ar: "مميزة" },
      visFeatured:     { fr: "★ En vedette",   en: "★ Featured",  es: "★ Destacada", ar: "★ مميز" },
      visHome:         { fr: "Accueil",        en: "Home",        es: "Inicio",      ar: "الرئيسية" },
      visBlog:         { fr: "Blog",           en: "Blog",        es: "Blog",        ar: "المدونة" },
      visMenu:         { fr: "Menu",           en: "Menu",        es: "Menú",        ar: "القائمة" },
      editAction:      { fr: "Modifier",       en: "Edit",        es: "Editar",      ar: "تعديل" },
      deleteAction:    { fr: "Supprimer",      en: "Delete",      es: "Eliminar",    ar: "حذف" },
    },
    comments: {
      total:   { fr: "total",     en: "total",    es: "total",     ar: "إجمالي" },
      approve: { fr: "Approuver", en: "Approve",  es: "Aprobar",   ar: "موافقة" },
      reject:  { fr: "Rejeter",   en: "Reject",   es: "Rechazar",  ar: "رفض" },
    },
    media: {
      pageTitle:            { fr: "Médias — Blog",                              en: "Media — Blog",                         es: "Medios — Blog",                          ar: "الوسائط — المدونة" },
      slugHint:             { fr: "Caractères autorisés : lettres, chiffres, tirets.", en: "Allowed characters: letters, numbers, hyphens.", es: "Caracteres permitidos: letras, números, guiones.", ar: "الأحرف المسموحة: أحرف، أرقام، شرطات." },
      altPlaceholder:       { fr: "Description de l'image…",                    en: "Image description…",                   es: "Descripción de la imagen…",              ar: "وصف الصورة…" },
      captionPlaceholder:   { fr: "Légende optionnelle…",                       en: "Optional caption…",                    es: "Leyenda opcional…",                      ar: "تعليق اختياري…" },
      descriptionPlaceholder:{ fr: "Description détaillée…",                    en: "Detailed description…",                es: "Descripción detallada…",                 ar: "وصف مفصل…" },
      uploading:            { fr: "Upload en cours…",                           en: "Uploading…",                           es: "Subiendo…",                              ar: "جارٍ الرفع…" },
      fileLabel:            { fr: "Fichier",                                    en: "File",                                 es: "Archivo",                                ar: "ملف" },
      typeLabel:            { fr: "Type",                                       en: "Type",                                 es: "Tipo",                                   ar: "نوع" },
      dateLabel:            { fr: "Date",                                       en: "Date",                                 es: "Fecha",                                  ar: "تاريخ" },
      copyUrl:              { fr: "Copier l'URL",                               en: "Copy URL",                             es: "Copiar URL",                             ar: "نسخ الرابط" },
      altLabel:             { fr: "Texte alternatif",                           en: "Alt text",                             es: "Texto alternativo",                      ar: "نص بديل" },
      captionLabel:         { fr: "Légende",                                    en: "Caption",                              es: "Leyenda",                                ar: "تعليق" },
      descriptionLabel:     { fr: "Description",                                en: "Description",                          es: "Descripción",                            ar: "وصف" },
    },
    common: {
      edit:  { fr: "Modifier", en: "Edit",  es: "Editar", ar: "تعديل" },
      total: { fr: "total",    en: "total", es: "total",  ar: "إجمالي" },
    },
  },
};

// Deep-merge helper: merges `source` into `target` without overwriting existing keys
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      !("fr" in source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      // Leaf: { fr, en, es, ar } — don't overwrite existing
      if (!(key in target)) {
        target[key] = source[key];
      }
    }
  }
}

for (const locale of locales) {
  const filePath = resolve(i18nDir, `${locale}.json`);
  const json = JSON.parse(readFileSync(filePath, "utf-8"));

  // Flatten multilingual leaves into single-locale values
  function extractLocale(obj, loc) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        if (loc in v) {
          out[k] = v[loc]; // leaf node like { fr: "...", en: "..." }
        } else {
          out[k] = extractLocale(v, loc);
        }
      }
    }
    return out;
  }

  const localeKeys = extractLocale(newKeys, locale);
  deepMerge(json, localeKeys);

  writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  const keyCount = JSON.stringify(json).match(/"[^"]+"\s*:/g)?.length || 0;
  console.log(`✅ ${locale}.json updated — ~${keyCount} keys`);
}

console.log("\n🎉 All locale files updated with final i18n keys.");
