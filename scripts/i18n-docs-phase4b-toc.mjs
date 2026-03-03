#!/usr/bin/env node
/**
 * scripts/i18n-docs-phase4b-toc.mjs
 * 
 * Phase 4b: Fix remaining unmatched TOC labels + demo menu labels.
 * Adds new keys + maps remaining labels.
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');
const DOCS_BASE = path.join('src', 'pages', '[lang]', 'docs');

// New common keys for demo/nav content + unmapped section labels
const NEW_KEYS = {
  fr: {
    demoHome: "Accueil",
    demoAbout: "À propos",
    demoContact: "Contact",
    demoBlog: "Blog",
    demoProducts: "Produits",
    demoServices: "Services",
    demoDashboard: "Tableau de bord",
    demoSettings: "Paramètres",
    demoProfile: "Profil",
    demoNotifications: "Notifications",
    demoAnalytics: "Analytique",
    demoReports: "Rapports",
    demoTeam: "Équipe",
    demoProjects: "Projets",
    demoMessages: "Messages",
    demoCalendar: "Calendrier",
    demoTasks: "Tâches",
    demoFaq: "FAQ",
    demoHelp: "Aide",
    demoFile: "Fichier",
    demoEdit: "Édition",
    demoNew: "Nouveau",
    demoOpen: "Ouvrir",
    demoSave: "Enregistrer",
    demoCopy: "Copier",
    demoPaste: "Coller",
    demoDelete: "Supprimer",
    demoShare: "Partager",
    demoLogout: "Déconnexion",
    demoPassword: "Mot de passe",
    demo2FA: "2FA",
    demoSecurity: "Sécurité",
    demoConfiguration: "Configuration",
    demoConsulting: "Conseil",
    demoDevelopment: "Développement",
    demoEvents: "Événements",
    demoElectronics: "Électronique",
    demoClothing: "Vêtements",
    demoBooks: "Livres",
    demoCategories: "Catégories",
    demoAddProduct: "Ajouter un produit",
    demoAllProducts: "Tous les produits",
    demoApi: "API",
    demoFiles: "Fichiers",
    demoOne: "Un",
    demoTwo: "Deux",
    demoOption1: "Option 1",
    demoOption2: "Option 2",
    demoOption3: "Option 3",
    demoCategory1: "Catégorie 1",
    demoCategory2: "Catégorie 2",
    demoCategory3: "Catégorie 3",
    demoIntroduction: "Introduction",
    demoExample: "Exemple",
    demoMethods: "Méthodes",
    advancedUsage: "Utilisation avancée",
  },
  en: {
    demoHome: "Home",
    demoAbout: "About",
    demoContact: "Contact",
    demoBlog: "Blog",
    demoProducts: "Products",
    demoServices: "Services",
    demoDashboard: "Dashboard",
    demoSettings: "Settings",
    demoProfile: "Profile",
    demoNotifications: "Notifications",
    demoAnalytics: "Analytics",
    demoReports: "Reports",
    demoTeam: "Team",
    demoProjects: "Projects",
    demoMessages: "Messages",
    demoCalendar: "Calendar",
    demoTasks: "Tasks",
    demoFaq: "FAQ",
    demoHelp: "Help",
    demoFile: "File",
    demoEdit: "Edit",
    demoNew: "New",
    demoOpen: "Open",
    demoSave: "Save",
    demoCopy: "Copy",
    demoPaste: "Paste",
    demoDelete: "Delete",
    demoShare: "Share",
    demoLogout: "Logout",
    demoPassword: "Password",
    demo2FA: "2FA",
    demoSecurity: "Security",
    demoConfiguration: "Configuration",
    demoConsulting: "Consulting",
    demoDevelopment: "Development",
    demoEvents: "Events",
    demoElectronics: "Electronics",
    demoClothing: "Clothing",
    demoBooks: "Books",
    demoCategories: "Categories",
    demoAddProduct: "Add Product",
    demoAllProducts: "All Products",
    demoApi: "API",
    demoFiles: "Files",
    demoOne: "One",
    demoTwo: "Two",
    demoOption1: "Option 1",
    demoOption2: "Option 2",
    demoOption3: "Option 3",
    demoCategory1: "Category 1",
    demoCategory2: "Category 2",
    demoCategory3: "Category 3",
    demoIntroduction: "Introduction",
    demoExample: "Example",
    demoMethods: "Methods",
    advancedUsage: "Advanced Usage",
  },
  es: {
    demoHome: "Inicio",
    demoAbout: "Acerca de",
    demoContact: "Contacto",
    demoBlog: "Blog",
    demoProducts: "Productos",
    demoServices: "Servicios",
    demoDashboard: "Panel",
    demoSettings: "Configuración",
    demoProfile: "Perfil",
    demoNotifications: "Notificaciones",
    demoAnalytics: "Analítica",
    demoReports: "Informes",
    demoTeam: "Equipo",
    demoProjects: "Proyectos",
    demoMessages: "Mensajes",
    demoCalendar: "Calendario",
    demoTasks: "Tareas",
    demoFaq: "FAQ",
    demoHelp: "Ayuda",
    demoFile: "Archivo",
    demoEdit: "Edición",
    demoNew: "Nuevo",
    demoOpen: "Abrir",
    demoSave: "Guardar",
    demoCopy: "Copiar",
    demoPaste: "Pegar",
    demoDelete: "Eliminar",
    demoShare: "Compartir",
    demoLogout: "Cerrar sesión",
    demoPassword: "Contraseña",
    demo2FA: "2FA",
    demoSecurity: "Seguridad",
    demoConfiguration: "Configuración",
    demoConsulting: "Consultoría",
    demoDevelopment: "Desarrollo",
    demoEvents: "Eventos",
    demoElectronics: "Electrónica",
    demoClothing: "Ropa",
    demoBooks: "Libros",
    demoCategories: "Categorías",
    demoAddProduct: "Agregar producto",
    demoAllProducts: "Todos los productos",
    demoApi: "API",
    demoFiles: "Archivos",
    demoOne: "Uno",
    demoTwo: "Dos",
    demoOption1: "Opción 1",
    demoOption2: "Opción 2",
    demoOption3: "Opción 3",
    demoCategory1: "Categoría 1",
    demoCategory2: "Categoría 2",
    demoCategory3: "Categoría 3",
    demoIntroduction: "Introducción",
    demoExample: "Ejemplo",
    demoMethods: "Métodos",
    advancedUsage: "Uso avanzado",
  },
  ar: {
    demoHome: "الرئيسية",
    demoAbout: "حول",
    demoContact: "اتصل بنا",
    demoBlog: "المدونة",
    demoProducts: "المنتجات",
    demoServices: "الخدمات",
    demoDashboard: "لوحة القيادة",
    demoSettings: "الإعدادات",
    demoProfile: "الملف الشخصي",
    demoNotifications: "الإشعارات",
    demoAnalytics: "التحليلات",
    demoReports: "التقارير",
    demoTeam: "الفريق",
    demoProjects: "المشاريع",
    demoMessages: "الرسائل",
    demoCalendar: "التقويم",
    demoTasks: "المهام",
    demoFaq: "الأسئلة الشائعة",
    demoHelp: "المساعدة",
    demoFile: "ملف",
    demoEdit: "تعديل",
    demoNew: "جديد",
    demoOpen: "فتح",
    demoSave: "حفظ",
    demoCopy: "نسخ",
    demoPaste: "لصق",
    demoDelete: "حذف",
    demoShare: "مشاركة",
    demoLogout: "تسجيل خروج",
    demoPassword: "كلمة المرور",
    demo2FA: "المصادقة الثنائية",
    demoSecurity: "الأمان",
    demoConfiguration: "التكوين",
    demoConsulting: "الاستشارات",
    demoDevelopment: "التطوير",
    demoEvents: "الأحداث",
    demoElectronics: "الإلكترونيات",
    demoClothing: "الملابس",
    demoBooks: "الكتب",
    demoCategories: "الفئات",
    demoAddProduct: "إضافة منتج",
    demoAllProducts: "جميع المنتجات",
    demoApi: "واجهة برمجية",
    demoFiles: "ملفات",
    demoOne: "واحد",
    demoTwo: "اثنان",
    demoOption1: "خيار 1",
    demoOption2: "خيار 2",
    demoOption3: "خيار 3",
    demoCategory1: "فئة 1",
    demoCategory2: "فئة 2",
    demoCategory3: "فئة 3",
    demoIntroduction: "مقدمة",
    demoExample: "مثال",
    demoMethods: "طرق",
    advancedUsage: "استخدام متقدم",
  },
};

// Full label map including previously matched + new
const LABEL_MAP = {
  // Section names that map to existing common keys  
  'formcard': 'd.formCard',
  'input': 'd.input',
  'passwordinput': 'd.passwordInput',
  'textarea': 'd.textarea',
  'select': 'd.select',
  'checkbox': 'd.checkbox',
  'radio': 'd.radio',
  'switch': 'd.switchComponent',
  'datepicker': 'd.datePicker',
  'alert (validation messages)': 'd.alertValidation',
  'theme management': 'd.themeManagement',
  'seo and metadata': 'd.seoMetadata',
  'navigation sidebar': 'd.navSidebar',
  'automatic table of contents': 'd.automaticToc',
  'included components': 'd.includedComponents',
  'single mode (only one open)': 'd.singleMode',
  'stripes and animations': 'd.stripesAndAnimations',
  'performance': 'd.performance',
  'advanced usage': 'd.advancedUsage',
  'states': 'd.states',
  'product mode (checkbox hack)': 'd.productMode',

  // Demo/nav labels
  'home': 'd.demoHome',
  'about': 'd.demoAbout',
  'contact': 'd.demoContact',
  'blog': 'd.demoBlog',
  'products': 'd.demoProducts',
  'services': 'd.demoServices',
  'dashboard': 'd.demoDashboard',
  'settings': 'd.demoSettings',
  'profile': 'd.demoProfile',
  'notifications': 'd.demoNotifications',
  'analytics': 'd.demoAnalytics',
  'reports': 'd.demoReports',
  'team': 'd.demoTeam',
  'projects': 'd.demoProjects',
  'messages': 'd.demoMessages',
  'calendar': 'd.demoCalendar',
  'tasks': 'd.demoTasks',
  'faq': 'd.demoFaq',
  'help': 'd.demoHelp',
  'file': 'd.demoFile',
  'edit': 'd.demoEdit',
  'new': 'd.demoNew',
  'open': 'd.demoOpen',
  'save': 'd.demoSave',
  'copy': 'd.demoCopy',
  'paste': 'd.demoPaste',
  'delete': 'd.demoDelete',
  'share': 'd.demoShare',
  'logout': 'd.demoLogout',
  'password': 'd.demoPassword',
  '2fa': 'd.demo2FA',
  'security': 'd.demoSecurity',
  'configuration': 'd.demoConfiguration',
  'consulting': 'd.demoConsulting',
  'development': 'd.demoDevelopment',
  'events': 'd.demoEvents',
  'electronics': 'd.demoElectronics',
  'clothing': 'd.demoClothing',
  'books': 'd.demoBooks',
  'categories': 'd.demoCategories',
  'add product': 'd.demoAddProduct',
  'all products': 'd.demoAllProducts',
  'api': 'd.demoApi',
  'files': 'd.demoFiles',
  'one': 'd.demoOne',
  'two': 'd.demoTwo',
  'option 1': 'd.demoOption1',
  'option 2': 'd.demoOption2',
  'option 3': 'd.demoOption3',
  'category 1': 'd.demoCategory1',
  'category 2': 'd.demoCategory2',
  'category 3': 'd.demoCategory3',
  'introduction': 'd.demoIntroduction',
  'example': 'd.demoExample',
  'methods': 'd.demoMethods',
};

function addKeys() {
  for (const locale of ['fr', 'en', 'es', 'ar']) {
    const filePath = path.join(I18N_DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let added = 0;
    for (const [key, value] of Object.entries(NEW_KEYS[locale])) {
      if (!data.docs.common[key]) {
        data.docs.common[key] = value;
        added++;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  ${locale}.json: +${added} keys`);
  }
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Only replace labels that are NOT already expressions (don't have ??)
  content = content.replace(/label:\s*"([^"]+)"/g, (match, labelText) => {
    const key = LABEL_MAP[labelText.toLowerCase()];
    if (key) {
      return `label: ${key} ?? "${labelText}"`;
    }
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

console.log('🔄 Phase 4b: Fix remaining TOC labels\n');

console.log('📦 Adding demo/nav keys...');
addKeys();

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

console.log('\n📝 Replacing remaining labels...');
let changed = 0;
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (processFile(fp)) {
    console.log(`  ✅ ${rel}`);
    changed++;
  }
}
console.log(`\n📊 Files changed: ${changed}`);

// Final count
let remaining = 0;
let unmatchedLabels = new Set();
for (const rel of allFiles) {
  const fp = path.join(DOCS_BASE, rel + '.astro');
  if (!fs.existsSync(fp)) continue;
  const c = fs.readFileSync(fp, 'utf8');
  // Match label: "..." that do NOT have ?? (meaning not yet translated)
  const matches = c.match(/label:\s*"[^"]+"/g) || [];
  for (const m of matches) {
    // Check if the line also contains ??
    if (!m.includes('??')) {
      remaining++;
      const text = m.match(/"([^"]+)"/)[1];
      unmatchedLabels.add(text);
    }
  }
}
console.log(`\nRemaining unmatched: ${remaining}`);
if (unmatchedLabels.size > 0) {
  for (const l of [...unmatchedLabels].sort()) console.log(`  → "${l}"`);
}
