/**
 * Add missing admin i18n keys to all 4 locale JSON files.
 * Run: node scripts/add-admin-i18n-keys.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = resolve(__dirname, "../src/i18n");
const locales = ["fr", "en", "es", "ar"];

// New keys to add (multilingual)
const newKeys = {
  adminPanel: {
    recentActivity: { fr: "Activité récente", en: "Recent activity", es: "Actividad reciente", ar: "النشاط الأخير" },
  },
  adminBlog: {
    articles: {
      subtitle: { fr: "Créez, modifiez et publiez vos contenus.", en: "Create, edit and publish your content.", es: "Cree, edite y publique su contenido.", ar: "أنشئ وعدّل وانشر المحتوى." },
      createCta: { fr: "Créer un article", en: "Create an article", es: "Crear un artículo", ar: "إنشاء مقال" },
      empty: { fr: "Aucun article trouvé.", en: "No articles found.", es: "No se encontraron artículos.", ar: "لم يتم العثور على مقالات." },
      emptyCategory: { fr: "Aucun article dans cette catégorie.", en: "No articles in this category.", es: "No hay artículos en esta categoría.", ar: "لا توجد مقالات في هذه الفئة." },
      tableArticle: { fr: "Article", en: "Article", es: "Artículo", ar: "مقال" },
      tableCategories: { fr: "Catégories", en: "Categories", es: "Categorías", ar: "الفئات" },
      tableAuthors: { fr: "Auteur(s)", en: "Author(s)", es: "Autor(es)", ar: "المؤلف(ون)" },
      tableStatus: { fr: "Statut", en: "Status", es: "Estado", ar: "الحالة" },
      tableFlags: { fr: "Flags", en: "Flags", es: "Flags", ar: "العلامات" },
      tableDate: { fr: "Date", en: "Date", es: "Fecha", ar: "التاريخ" },
      tableActions: { fr: "Actions", en: "Actions", es: "Acciones", ar: "الإجراءات" },
      flagFeatured: { fr: "★ En vedette", en: "★ Featured", es: "★ Destacado", ar: "★ مميز" },
      flagHome: { fr: "Accueil", en: "Home", es: "Inicio", ar: "الرئيسية" },
      flagBlog: { fr: "Blog", en: "Blog", es: "Blog", ar: "المدونة" },
      unpublished: { fr: "Non publié", en: "Unpublished", es: "No publicado", ar: "غير منشور" },
      createdOn: { fr: "Créé le", en: "Created on", es: "Creado el", ar: "أنشئ في" },
      confirmDelete: { fr: "Supprimer cet article ? Cette action est irréversible.", en: "Delete this article? This action is irreversible.", es: "¿Eliminar este artículo? Esta acción es irreversible.", ar: "حذف هذا المقال؟ هذا الإجراء لا رجعة فيه." },
      confirmDuplicate: { fr: "Dupliquer cet article ?", en: "Duplicate this article?", es: "¿Duplicar este artículo?", ar: "تكرار هذا المقال؟" },
    },
    authors: {
      subtitle: { fr: "Gérez les profils des auteurs du blog.", en: "Manage blog author profiles.", es: "Gestione los perfiles de autores.", ar: "إدارة ملفات تعريف المؤلفين." },
      tableAuthor: { fr: "Auteur", en: "Author", es: "Autor", ar: "المؤلف" },
      tableSlug: { fr: "Slug", en: "Slug", es: "Slug", ar: "Slug" },
      tableEmail: { fr: "Email", en: "Email", es: "Email", ar: "البريد الإلكتروني" },
      tableArticles: { fr: "Articles", en: "Articles", es: "Artículos", ar: "المقالات" },
      tableVisibility: { fr: "Visibilité", en: "Visibility", es: "Visibilidad", ar: "الرؤية" },
      tableCreated: { fr: "Créé le", en: "Created on", es: "Creado el", ar: "أنشئ في" },
      tableActions: { fr: "Actions", en: "Actions", es: "Acciones", ar: "الإجراءات" },
      deleteConfirm: { fr: "Supprimer cet auteur ? Cette action est irréversible.", en: "Delete this author? This action is irreversible.", es: "¿Eliminar este autor? Irreversible.", ar: "حذف هذا المؤلف؟ لا رجعة فيه." },
    },
    categories: {
      tableName: { fr: "Catégorie", en: "Category", es: "Categoría", ar: "الفئة" },
      tableArticles: { fr: "Articles", en: "Articles", es: "Artículos", ar: "المقالات" },
      tableVisibility: { fr: "Visibilité", en: "Visibility", es: "Visibilidad", ar: "الرؤية" },
      tableParent: { fr: "Parent", en: "Parent", es: "Padre", ar: "الأب" },
      tableImage: { fr: "Image", en: "Image", es: "Imagen", ar: "الصورة" },
      tableDate: { fr: "Date", en: "Date", es: "Fecha", ar: "التاريخ" },
      tableActions: { fr: "Actions", en: "Actions", es: "Acciones", ar: "الإجراءات" },
      empty: { fr: "Aucune catégorie trouvée.", en: "No categories found.", es: "No se encontraron categorías.", ar: "لم يتم العثور على فئات." },
      createCta: { fr: "Créer une catégorie", en: "Create a category", es: "Crear una categoría", ar: "إنشاء فئة" },
      deleteConfirm: { fr: "Supprimer cette catégorie ? Irréversible.", en: "Delete this category? Irreversible.", es: "¿Eliminar esta categoría? Irreversible.", ar: "حذف هذه الفئة؟ لا رجعة فيه." },
      modifiedOn: { fr: "Modifié le", en: "Modified on", es: "Modificado el", ar: "عُدّل في" },
    },
    comments: {
      tableAuthor: { fr: "Auteur", en: "Author", es: "Autor", ar: "المؤلف" },
      tableContent: { fr: "Contenu", en: "Content", es: "Contenido", ar: "المحتوى" },
      tableArticle: { fr: "Article", en: "Article", es: "Artículo", ar: "مقال" },
      tableType: { fr: "Type", en: "Type", es: "Tipo", ar: "النوع" },
      tableStatus: { fr: "Statut", en: "Status", es: "Estado", ar: "الحالة" },
      tableRating: { fr: "Note", en: "Rating", es: "Nota", ar: "التقييم" },
      tableLang: { fr: "Langue", en: "Language", es: "Idioma", ar: "اللغة" },
      tableDate: { fr: "Date", en: "Date", es: "Fecha", ar: "التاريخ" },
      tableActions: { fr: "Actions", en: "Actions", es: "Acciones", ar: "الإجراءات" },
    },
    media: {
      fileName: { fr: "Nom du fichier", en: "Filename", es: "Nombre del archivo", ar: "اسم الملف" },
      uploadNoMeta: { fr: "Uploader sans métadonnées", en: "Upload without metadata", es: "Subir sin metadatos", ar: "رفع بدون بيانات وصفية" },
    },
    form: {
      featured: { fr: "En vedette", en: "Featured", es: "Destacado", ar: "مميز" },
      displayHomepage: { fr: "Afficher en accueil", en: "Display on homepage", es: "Mostrar en inicio", ar: "عرض في الصفحة الرئيسية" },
      displayBlog: { fr: "Afficher dans le blog", en: "Display on blog", es: "Mostrar en el blog", ar: "عرض في المدونة" },
      displayMenu: { fr: "Afficher dans le menu", en: "Display in menu", es: "Mostrar en el menú", ar: "عرض في القائمة" },
      allowComments: { fr: "Autoriser les commentaires", en: "Allow comments", es: "Permitir comentarios", ar: "السماح بالتعليقات" },
      readingTime: { fr: "Temps de lecture", en: "Reading time", es: "Tiempo de lectura", ar: "وقت القراءة" },
      license: { fr: "Licence", en: "License", es: "Licencia", ar: "الترخيص" },
      metadata: { fr: "Métadonnées", en: "Metadata", es: "Metadatos", ar: "البيانات الوصفية" },
      canonicalUrl: { fr: "URL canonique", en: "Canonical URL", es: "URL canónica", ar: "الرابط الأساسي" },
      saveDraft: { fr: "Enregistrer brouillon", en: "Save draft", es: "Guardar borrador", ar: "حفظ المسودة" },
      publish: { fr: "Publier", en: "Publish", es: "Publicar", ar: "نشر" },
      createAuthor: { fr: "Créer l'auteur", en: "Create author", es: "Crear autor", ar: "إنشاء المؤلف" },
      createCategory: { fr: "Créer la catégorie", en: "Create category", es: "Crear categoría", ar: "إنشاء الفئة" },
      noCategoryAvailable: { fr: "Aucune catégorie disponible.", en: "No category available.", es: "Sin categorías disponibles.", ar: "لا توجد فئات متاحة." },
      noAuthorAvailable: { fr: "Aucun auteur disponible.", en: "No author available.", es: "Sin autores disponibles.", ar: "لا يوجد مؤلفون متاحون." },
    },
    common: {
      dangerZone: { fr: "Zone de danger", en: "Danger zone", es: "Zona de peligro", ar: "منطقة الخطر" },
      deleteIrreversible: { fr: "La suppression est irréversible. Toutes les données seront perdues.", en: "Deletion is irreversible. All data will be lost.", es: "La eliminación es irreversible.", ar: "الحذف لا رجعة فيه." },
      backToList: { fr: "Retour à la liste", en: "Back to list", es: "Volver a la lista", ar: "العودة للقائمة" },
      visible: { fr: "Visible", en: "Visible", es: "Visible", ar: "مرئي" },
      hidden: { fr: "Masqué", en: "Hidden", es: "Oculto", ar: "مخفي" },
      saved: { fr: "Enregistré", en: "Saved", es: "Guardado", ar: "تم الحفظ" },
    },
    config: {
      securityAuth: { fr: "Authentification better-auth activée", en: "better-auth authentication enabled", es: "Autenticación better-auth habilitada", ar: "مصادقة better-auth مفعّلة" },
      securityAdmin: { fr: "Plugin admin actif", en: "Admin plugin active", es: "Plugin admin activo", ar: "إضافة المشرف نشطة" },
      securityMiddleware: { fr: "Protection middleware sur /admin", en: "Middleware protection on /admin", es: "Protección middleware en /admin", ar: "حماية middleware على /admin" },
      securityAudit: { fr: "Journal d'audit activé", en: "Audit log enabled", es: "Registro de auditoría habilitado", ar: "سجل التدقيق مفعّل" },
      securityEmail: { fr: "Vérification email requise", en: "Email verification required", es: "Verificación de email requerida", ar: "التحقق من البريد الإلكتروني مطلوب" },
      roleDescAdmin: { fr: "Accès complet à l'administration", en: "Full access to administration", es: "Acceso completo a la administración", ar: "وصول كامل للإدارة" },
      roleDescMod: { fr: "Modération du contenu et commentaires", en: "Content and comments moderation", es: "Moderación de contenido y comentarios", ar: "إدارة المحتوى والتعليقات" },
      roleDescEditor: { fr: "Création et édition de contenu", en: "Content creation and editing", es: "Creación y edición de contenido", ar: "إنشاء وتحرير المحتوى" },
      roleDescUser: { fr: "Utilisateur standard", en: "Standard user", es: "Usuario estándar", ar: "مستخدم عادي" },
    },
    users: {
      tableRole: { fr: "Rôle", en: "Role", es: "Rol", ar: "الدور" },
      ban: { fr: "Bannir", en: "Ban", es: "Prohibir", ar: "حظر" },
      unban: { fr: "Débannir", en: "Unban", es: "Desbloquear", ar: "إلغاء الحظر" },
    },
  },
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      // Check if it's a locale value object { fr, en, es, ar }
      if ("fr" in source[key] && "en" in source[key]) {
        // This is a leaf value — don't recurse
        if (!(key in target)) {
          target[key] = null; // placeholder, will be set by caller
        }
      } else {
        if (!(key in target)) target[key] = {};
        deepMerge(target[key], source[key]);
      }
    }
  }
  return target;
}

function extractLocaleValues(obj, locale) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("fr" in value && "en" in value) {
        result[key] = value[locale] ?? value.fr;
      } else {
        result[key] = extractLocaleValues(value, locale);
      }
    }
  }
  return result;
}

function deepMergeValues(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (!(key in target)) target[key] = {};
      if (typeof target[key] === "object") {
        deepMergeValues(target[key], value);
      }
    } else {
      if (!(key in target)) {
        target[key] = value;
      }
    }
  }
  return target;
}

function countKeys(obj) {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      count += countKeys(value);
    } else {
      count++;
    }
  }
  return count;
}

for (const locale of locales) {
  const filePath = resolve(i18nDir, `${locale}.json`);
  const json = JSON.parse(readFileSync(filePath, "utf-8"));
  const localeValues = extractLocaleValues(newKeys, locale);
  deepMergeValues(json, localeValues);
  writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  console.log(`✅ ${locale}.json: ${countKeys(json)} keys`);
}

console.log("\nDone! All missing admin keys added.");
