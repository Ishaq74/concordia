/**
 * Add client-side JS translation keys (confirm, showToast, innerHTML) to all 4 locale JSON files.
 * Run: node scripts/add-client-i18n-keys.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = resolve(__dirname, "../src/i18n");
const locales = ["fr", "en", "es", "ar"];

const newKeys = {
  // Admin panel
  adminPanel: {
    statistics: { fr: "Statistiques", en: "Statistics", es: "Estadísticas", ar: "الإحصائيات" },
  },
  // Client-side JS strings — adminBlog
  adminBlog: {
    js: {
      // Articles
      confirmDelete:     { fr: "Supprimer cet article ? Cette action est irréversible.", en: "Delete this article? This action is irreversible.", es: "¿Eliminar este artículo? Esta acción es irreversible.", ar: "حذف هذا المقال؟ هذا الإجراء لا يمكن التراجع عنه." },
      confirmDuplicate:  { fr: "Dupliquer cet article ?",                 en: "Duplicate this article?",              es: "¿Duplicar este artículo?",                ar: "تكرار هذا المقال؟" },
      actionCompleted:   { fr: "Action effectuée.",                        en: "Action completed.",                     es: "Acción completada.",                       ar: "تم تنفيذ الإجراء." },
      networkError:      { fr: "Erreur réseau.",                           en: "Network error.",                        es: "Error de red.",                            ar: "خطأ في الشبكة." },
      titleRequired:     { fr: "Le titre en français est obligatoire.",    en: "The French title is required.",         es: "El título en francés es obligatorio.",     ar: "العنوان بالفرنسية مطلوب." },
      articleCreated:    { fr: "Article créé avec succès !",               en: "Article created successfully!",         es: "¡Artículo creado con éxito!",              ar: "تم إنشاء المقال بنجاح!" },
      unknownError:      { fr: "Erreur inconnue lors de la création.",     en: "Unknown error during creation.",        es: "Error desconocido al crear.",              ar: "خطأ غير معروف أثناء الإنشاء." },
      articleSaved:      { fr: "Article enregistré avec succès !",         en: "Article saved successfully!",           es: "¡Artículo guardado con éxito!",            ar: "تم حفظ المقال بنجاح!" },
      saveError:         { fr: "Erreur lors de l'enregistrement.",         en: "Error during save.",                    es: "Error al guardar.",                        ar: "خطأ أثناء الحفظ." },
      confirmDeletePerm: { fr: "Supprimer définitivement cet article ? Les données seront perdues.", en: "Permanently delete this article? Data will be lost.", es: "¿Eliminar permanentemente este artículo?", ar: "حذف هذا المقال نهائياً؟ ستُفقد البيانات." },
      articleDeleted:    { fr: "Article supprimé.",                        en: "Article deleted.",                      es: "Artículo eliminado.",                      ar: "تم حذف المقال." },
      deleteError:       { fr: "Erreur lors de la suppression.",           en: "Error during deletion.",                es: "Error al eliminar.",                       ar: "خطأ أثناء الحذف." },
      // Authors
      confirmDeleteAuthor:{ fr: "Supprimer cet auteur ? Cette action est irréversible.", en: "Delete this author? This action is irreversible.", es: "¿Eliminar este autor?", ar: "حذف هذا المؤلف؟" },
      authorCreated:     { fr: "Auteur créé avec succès !",               en: "Author created successfully!",          es: "¡Autor creado con éxito!",                 ar: "تم إنشاء المؤلف بنجاح!" },
      authorSaved:       { fr: "Auteur enregistré avec succès !",         en: "Author saved successfully!",            es: "¡Autor guardado con éxito!",               ar: "تم حفظ المؤلف بنجاح!" },
      authorDeleted:     { fr: "Auteur supprimé.",                        en: "Author deleted.",                       es: "Autor eliminado.",                         ar: "تم حذف المؤلف." },
      nameRequired:      { fr: "Le nom en français est obligatoire.",     en: "The French name is required.",          es: "El nombre en francés es obligatorio.",     ar: "الاسم بالفرنسية مطلوب." },
      // Categories
      catNameRequired:   { fr: "Le nom en français est obligatoire.",     en: "The French name is required.",          es: "El nombre en francés es obligatorio.",     ar: "الاسم بالفرنسية مطلوب." },
      slugRequired:      { fr: "Le slug est obligatoire.",                en: "The slug is required.",                 es: "El slug es obligatorio.",                  ar: "الـ slug مطلوب." },
      catCreated:        { fr: "Catégorie créée avec succès !",           en: "Category created successfully!",        es: "¡Categoría creada con éxito!",             ar: "تم إنشاء التصنيف بنجاح!" },
      catSaved:          { fr: "Catégorie enregistrée avec succès !",     en: "Category saved successfully!",          es: "¡Categoría guardada con éxito!",           ar: "تم حفظ التصنيف بنجاح!" },
      confirmDeleteCat:  { fr: "Supprimer cette catégorie ? Cette action est irréversible.", en: "Delete this category? This action is irreversible.", es: "¿Eliminar esta categoría?", ar: "حذف هذا التصنيف؟" },
      catDeleted:        { fr: "Catégorie supprimée.",                    en: "Category deleted.",                     es: "Categoría eliminada.",                     ar: "تم حذف التصنيف." },
      // Media
      loading:           { fr: "Chargement…",                             en: "Loading…",                              es: "Cargando…",                                ar: "جارٍ التحميل…" },
      noMedia:           { fr: "Aucun média trouvé.",                     en: "No media found.",                       es: "No se encontraron medios.",                ar: "لم يتم العثور على وسائط." },
      loadError:         { fr: "Erreur de chargement.",                   en: "Loading error.",                        es: "Error de carga.",                          ar: "خطأ في التحميل." },
      prevPage:          { fr: "‹ Précédent",                             en: "‹ Previous",                            es: "‹ Anterior",                               ar: "السابق ‹" },
      nextPage:          { fr: "Suivant ›",                               en: "Next ›",                                es: "Siguiente ›",                              ar: "› التالي" },
      mediaCount:        { fr: "média(s)",                                en: "media item(s)",                         es: "medio(s)",                                 ar: "وسائط" },
      filesUploaded:     { fr: "fichier(s) uploadé(s) avec succès.",      en: "file(s) uploaded successfully.",         es: "archivo(s) subido(s) con éxito.",          ar: "ملف(ات) تم رفعها بنجاح." },
      uploadError:       { fr: "Erreur lors de l'upload.",                en: "Error during upload.",                  es: "Error al subir.",                          ar: "خطأ أثناء الرفع." },
      metaSaved:         { fr: "Métadonnées enregistrées.",               en: "Metadata saved.",                       es: "Metadatos guardados.",                     ar: "تم حفظ البيانات الوصفية." },
      metaError:         { fr: "Erreur lors de la sauvegarde.",           en: "Error during save.",                    es: "Error al guardar.",                        ar: "خطأ أثناء الحفظ." },
      confirmDeleteMedia:{ fr: "Supprimer ce fichier ?",                  en: "Delete this file?",                     es: "¿Eliminar este archivo?",                  ar: "حذف هذا الملف؟" },
      mediaDeleted:      { fr: "Fichier supprimé.",                       en: "File deleted.",                         es: "Archivo eliminado.",                       ar: "تم حذف الملف." },
      urlCopied:         { fr: "URL copiée !",                            en: "URL copied!",                           es: "¡URL copiada!",                            ar: "تم نسخ الرابط!" },
    },
  },
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key]) && !("fr" in source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  }
}

function extractLocale(obj, loc) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      if (loc in v) out[k] = v[loc];
      else out[k] = extractLocale(v, loc);
    }
  }
  return out;
}

for (const locale of locales) {
  const filePath = resolve(i18nDir, `${locale}.json`);
  const json = JSON.parse(readFileSync(filePath, "utf-8"));
  deepMerge(json, extractLocale(newKeys, locale));
  writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  const count = JSON.stringify(json).match(/"[^"]+"\s*:/g)?.length || 0;
  console.log(`✅ ${locale}.json — ~${count} keys`);
}
console.log("\n🎉 Client-side JS translation keys added.");
