/**
 * Add missing i18n keys for components, templates, layouts.
 * Run: node scripts/add-component-i18n-keys.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = resolve(__dirname, "../src/i18n");
const locales = ["fr", "en", "es", "ar"];

const newKeys = {
  // ── Header / ThemeSwitch ──
  header: {
    menu:        { fr: "Menu",              en: "Menu",                es: "Menú",              ar: "القائمة" },
    changeTheme: { fr: "Changer le thème",  en: "Change theme",        es: "Cambiar tema",      ar: "تغيير السمة" },
  },

  // ── Blog templates ──
  blog: {
    authors:         { fr: "Auteurs",          en: "Authors",             es: "Autores",           ar: "المؤلفون" },
    archives:        { fr: "Archives",         en: "Archives",            es: "Archivos",          ar: "الأرشيف" },
    onThisPage:      { fr: "Sur cette page",   en: "On this page",        es: "En esta página",    ar: "في هذه الصفحة" },
    tableOfContents: { fr: "Table des matières", en: "Table of Contents", es: "Tabla de contenido", ar: "جدول المحتويات" },
  },

  // ── Admin layout ──
  adminPanel: {
    navArticles:   { fr: "Articles",       en: "Articles",       es: "Artículos",     ar: "المقالات" },
    navCategories: { fr: "Catégories",     en: "Categories",     es: "Categorías",    ar: "التصنيفات" },
    navAuthors:    { fr: "Auteurs",        en: "Authors",        es: "Autores",       ar: "المؤلفون" },
    navMedia:      { fr: "Médias",         en: "Media",          es: "Medios",        ar: "الوسائط" },
    navComments:   { fr: "Commentaires",   en: "Comments",       es: "Comentarios",   ar: "التعليقات" },
    closeMenu:     { fr: "Fermer le menu", en: "Close menu",     es: "Cerrar menú",   ar: "إغلاق القائمة" },
  },

  // ── Base layout ──
  common: {
    defaultTitle: { fr: "Concordia",       en: "Concordia",       es: "Concordia",     ar: "كونكورديا" },
  },

  // ── Profile components ──
  profile: {
    // ProfileForm
    personalInfo:      { fr: "Informations personnelles",  en: "Personal Information",     es: "Información personal",      ar: "المعلومات الشخصية" },
    personalInfoDesc:  { fr: "Mettez à jour vos informations de profil. Ces informations seront visibles publiquement.", en: "Update your profile information. This information will be publicly visible.", es: "Actualice su información de perfil. Esta información será visible públicamente.", ar: "قم بتحديث معلومات ملفك الشخصي. هذه المعلومات ستكون مرئية للعامة." },
    fullName:          { fr: "Nom complet",                en: "Full name",                es: "Nombre completo",           ar: "الاسم الكامل" },
    fullNamePlaceholder:{ fr: "Votre nom complet",         en: "Your full name",           es: "Su nombre completo",        ar: "اسمك الكامل" },
    emailAddress:      { fr: "Adresse e-mail",             en: "Email address",            es: "Dirección de correo",       ar: "عنوان البريد الإلكتروني" },
    emailReadonly:      { fr: "L'email ne peut pas être modifié ici.", en: "Email cannot be changed here.", es: "El correo no se puede cambiar aquí.", ar: "لا يمكن تغيير البريد الإلكتروني هنا." },
    location:          { fr: "Localisation",               en: "Location",                 es: "Ubicación",                 ar: "الموقع" },
    locationPlaceholder:{ fr: "Ex: Lyon, France",          en: "E.g.: Lyon, France",       es: "Ej: Lyon, Francia",         ar: "مثال: ليون، فرنسا" },
    website:           { fr: "Site web",                   en: "Website",                  es: "Sitio web",                 ar: "الموقع الإلكتروني" },
    biography:         { fr: "Biographie",                 en: "Biography",                es: "Biografía",                 ar: "السيرة الذاتية" },
    bioPlaceholder:    { fr: "Présentez-vous en quelques mots...", en: "Introduce yourself briefly...", es: "Preséntese brevemente...", ar: "قدّم نفسك بإيجاز..." },
    bioHint:           { fr: "Maximum 500 caractères.",    en: "Maximum 500 characters.",  es: "Máximo 500 caracteres.",    ar: "500 حرف كحد أقصى." },
    preferredLanguage: { fr: "Langue préférée",            en: "Preferred language",       es: "Idioma preferido",          ar: "اللغة المفضلة" },
    saveChanges:       { fr: "Enregistrer les modifications", en: "Save changes",          es: "Guardar cambios",           ar: "حفظ التغييرات" },
    profileUpdatedMsg: { fr: "Profil mis à jour avec succès !", en: "Profile updated successfully!", es: "¡Perfil actualizado con éxito!", ar: "تم تحديث الملف الشخصي بنجاح!" },
    profileUpdateError:{ fr: "Erreur lors de la mise à jour.", en: "Error during update.",  es: "Error al actualizar.",      ar: "خطأ أثناء التحديث." },
    serverUnreachable: { fr: "Impossible de contacter le serveur.", en: "Cannot reach the server.", es: "No se puede contactar el servidor.", ar: "تعذر الاتصال بالخادم." },

    // ProfileDetails
    email:             { fr: "Email",                      en: "Email",                    es: "Correo",                    ar: "البريد الإلكتروني" },
    role:              { fr: "Rôle",                       en: "Role",                     es: "Rol",                       ar: "الدور" },
    activeOrg:         { fr: "Organisation active",        en: "Active organization",      es: "Organización activa",       ar: "المنظمة النشطة" },
    lastActivity:      { fr: "Dernière activité",          en: "Last activity",            es: "Última actividad",          ar: "آخر نشاط" },
    invitations:       { fr: "Invitations",                en: "Invitations",              es: "Invitaciones",              ar: "الدعوات" },
    pending:           { fr: "en attente",                 en: "pending",                  es: "pendiente(s)",              ar: "قيد الانتظار" },
    none:              { fr: "Aucune",                     en: "None",                     es: "Ninguna",                   ar: "لا شيء" },

    // ProfileOrganization
    orgManagement:     { fr: "Gestion des organisations",  en: "Organization Management",  es: "Gestión de organizaciones", ar: "إدارة المنظمات" },
    orgManagementDesc: { fr: "Gérez vos organisations, invitez des membres et configurez les paramètres.", en: "Manage your organizations, invite members and configure settings.", es: "Gestione sus organizaciones, invite miembros y configure.", ar: "أدِر منظماتك، ادعُ الأعضاء واضبط الإعدادات." },
    noOrganization:    { fr: "Aucune organisation",        en: "No organization",          es: "Sin organización",          ar: "لا توجد منظمة" },
    noOrgHint:         { fr: "Vous n'êtes membre d'aucune organisation pour le moment. Rejoignez ou créez une organisation pour collaborer avec d'autres citoyens.", en: "You are not a member of any organization yet. Join or create one to collaborate with other citizens.", es: "No es miembro de ninguna organización aún. Únase o cree una para colaborar.", ar: "لست عضواً في أي منظمة حالياً. انضم أو أنشئ واحدة للتعاون." },
    active:            { fr: "Active",                     en: "Active",                   es: "Activa",                    ar: "نشط" },
    membersLabel:      { fr: "Membres",                    en: "Members",                  es: "Miembros",                  ar: "الأعضاء" },
    invite:            { fr: "Inviter",                    en: "Invite",                   es: "Invitar",                   ar: "دعوة" },
    inviteMember:      { fr: "Inviter un membre",          en: "Invite a member",          es: "Invitar un miembro",        ar: "دعوة عضو" },
    roleMember:        { fr: "Membre",                     en: "Member",                   es: "Miembro",                   ar: "عضو" },
    roleAdmin:         { fr: "Admin",                      en: "Admin",                    es: "Admin",                     ar: "مدير" },
    roleOwner:         { fr: "Propriétaire",               en: "Owner",                    es: "Propietario",               ar: "مالك" },
    sendInvitation:    { fr: "Envoyer l'invitation",       en: "Send invitation",          es: "Enviar invitación",         ar: "إرسال الدعوة" },
    noMembers:         { fr: "Aucun membre à afficher.",   en: "No members to display.",   es: "No hay miembros.",          ar: "لا يوجد أعضاء لعرضهم." },
    leaveOrg:          { fr: "Quitter l'organisation",     en: "Leave organization",       es: "Dejar la organización",     ar: "مغادرة المنظمة" },
  },

  // ── VerifyEmail client script ──
  auth: {
    sendingEmail:     { fr: "Envoi en cours...",                            en: "Sending...",                     es: "Enviando...",                ar: "جارٍ الإرسال..." },
    emailNotFound:    { fr: "Email introuvable. Veuillez vous reconnecter.", en: "Email not found. Please sign in again.", es: "Email no encontrado. Inicie sesión de nuevo.", ar: "البريد غير موجود. يرجى إعادة تسجيل الدخول." },
    sendError:        { fr: "Erreur lors de l'envoi.",                      en: "Error while sending.",           es: "Error al enviar.",           ar: "خطأ أثناء الإرسال." },
    emailSentSuccess: { fr: "Email envoyé avec succès !",                   en: "Email sent successfully!",      es: "¡Email enviado con éxito!",  ar: "تم إرسال البريد بنجاح!" },
    unexpectedError:  { fr: "Erreur inattendue.",                           en: "Unexpected error.",              es: "Error inesperado.",          ar: "خطأ غير متوقع." },
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
console.log("\n🎉 Component/template/layout i18n keys added.");
