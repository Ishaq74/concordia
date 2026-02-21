export const LANGS = ['en', 'fr', 'ar', 'es'] as const;
export type Lang = typeof LANGS[number];

export const i18n = {
  projectName: { 
    en: 'Astro CSS Drizzle Better Auth', 
    fr: 'Astro CSS Drizzle Better Auth', 
    ar: 'Astro CSS Drizzle Better Auth', 
    es: 'Astro CSS Drizzle Better Auth' 
  },
  description: {
    en: 'A modern web application built with Astro, CSS, Drizzle ORM, and Better Auth.',
    fr: 'Une application web moderne construite avec Astro, CSS, Drizzle ORM et Better Auth.',
    ar: 'تطبيق ويب حديث مبني باستخدام Astro و CSS و Drizzle ORM و Better Auth.',
    es: 'Una aplicación web moderna construida con Astro, CSS, Drizzle ORM y Better Auth.',
  },
  subtitle: {
    en: '_This README is auto-generated to provide comprehensive context for AI assistance._',
    fr: "_Ce README est généré automatiquement pour fournir un contexte complet à l'IA._",
    ar: '_يتم إنشاء هذا الملف تلقائيًا لتوفير سياق شامل للمساعدة بالذكاء الاصطناعي._',
    es: '_Este README se genera automáticamente para proporcionar contexto completo a la IA._',
  },
  toc: { 
    en: 'Table of Contents', 
    fr: 'Sommaire', 
    ar: 'جدول المحتويات', 
    es: 'Índice' 
  },
  sections: {
    overview: { en: 'Overview', fr: "Vue d'ensemble", ar: 'نظرة عامة', es: 'Descripción general' },
    features: { en: 'Features', fr: 'Fonctionnalités', ar: 'الميزات', es: 'Características' },
    techStack: { en: 'Tech Stack', fr: 'Stack technique', ar: 'المجموعة التقنية', es: 'Stack tecnológico' },
    installation: { en: 'Installation', fr: 'Installation', ar: 'التثبيت', es: 'Instalación' },
    scripts: { en: 'Available Scripts', fr: 'Scripts disponibles', ar: 'السكريبتات المتاحة', es: 'Scripts disponibles' },
    tests: { en: 'Testing', fr: 'Tests', ar: 'الاختبارات', es: 'Pruebas' },
    structure: { en: 'Project Structure', fr: 'Structure du projet', ar: 'هيكل المشروع', es: 'Estructura del proyecto' },
    auth: { en: 'Authentication', fr: 'Authentification', ar: 'المصادقة', es: 'Autenticación' },
    database: { en: 'Database', fr: 'Base de données', ar: 'قاعدة البيانات', es: 'Base de datos' },
    env: { en: 'Environment Variables', fr: "Variables d'environnement", ar: 'متغيرات البيئة', es: 'Variables de entorno' },
    styles: { en: 'CSS Tokens and Styles', fr: 'Tokens CSS and Styles', ar: 'رموز CSS والأنماط', es: 'Tokens CSS y Estilos' },
  },
  subsections: {
    tokens: { en: 'CSS Tokens', fr: 'Tokens CSS', ar: 'رموز CSS', es: 'Tokens CSS' },
    styleComponents: { en: 'Style Components', fr: 'Composants de style', ar: 'مكونات الأنماط', es: 'Componentes de estilo' },
    baseStyles: { en: 'Base Styles', fr: 'Styles de base', ar: 'الأنماط الأساسية', es: 'Estilos base' },
  },
  overview: {
    en: 'This project demonstrates a full-stack web application using modern technologies.',
    fr: 'Ce projet démontre une application web full-stack utilisant des technologies modernes.',
    ar: 'يوضح هذا المشروع تطبيق ويب متكامل باستخدام التقنيات الحديثة.',
    es: 'Este proyecto demuestra una aplicación web full-stack usando tecnologías modernas.',
  },
  features: {
    en: [
      '⚡ **Astro** - Fast static site generation',
      '🎨 **CSS** - Modern styling',
      '🗄️ **Drizzle ORM** - Type-safe database queries',
      '🔐 **Better Auth** - Advanced authentication',
      '🌍 **i18n** - Multi-language support',
    ],
    fr: [
      '⚡ **Astro** - Génération de sites statiques rapide',
      '🎨 **CSS** - Styling moderne',
      '🗄️ **Drizzle ORM** - Requêtes de base de données type-safe',
      '🔐 **Better Auth** - Authentification avancée',
      '🌍 **i18n** - Support multilingue',
    ],
    ar: [
      '⚡ **Astro** - توليد مواقع ثابتة سريعة',
      '🎨 **CSS** - تصميم حديث',
      '🗄️ **Drizzle ORM** - استعلامات قاعدة بيانات آمنة من حيث النوع',
      '🔐 **Better Auth** - مصادقة متقدمة',
      '🌍 **i18n** - دعم متعدد اللغات',
    ],
    es: [
      '⚡ **Astro** - Generación rápida de sitios estáticos',
      '🎨 **CSS** - Estilo moderno',
      '🗄️ **Drizzle ORM** - Consultas de base de datos type-safe',
      '🔐 **Better Auth** - Autenticación avanzada',
      '🌍 **i18n** - Soporte multiidioma',
    ],
  },
  auth: {
    en: 'Better Auth is configured with plugins for OAuth, session management, and more.',
    fr: 'Better Auth est configuré avec des plugins pour OAuth, gestion de sessions, et plus.',
    ar: 'تم تكوين Better Auth باستخدام المكونات الإضافية لـ OAuth وإدارة الجلسات والمزيد.',
    es: 'Better Auth está configurado con plugins para OAuth, gestión de sesiones y más.',
  },
  testsIntro: {
    en: 'Testing is set up with Vitest (unit/integration) and Playwright (E2E). The repository includes configuration files, helpers, and example test suites for auth, DB, API routes, and UI flows.',
    fr: "Les tests sont configurés avec Vitest (unitaires/intégration) et Playwright (E2E). Le dépôt inclut des fichiers de configuration, des helpers et des suites d'exemple pour l'auth, la base de données, les routes API et les flows UI.",
    ar: 'تم إعداد الاختبارات باستخدام Vitest (وحدات/تكامل) و Playwright (E2E). يحتوي المستودع على ملفات التكوين وأدوات المساعدة وأمثلة على مجموعات الاختبار للمصادقة وقاعدة البيانات ومسارات API وتدفقات واجهة المستخدم.',
    es: 'Las pruebas están configuradas con Vitest (unitarias/integración) y Playwright (E2E). El repositorio incluye archivos de configuración, helpers y suites de ejemplo para auth, DB, rutas API y flujos UI.',
  },
  // Database section subtitles/messages
  databaseExportedTitle: {
    en: 'Exported Tables (Source: barrel file)',
    fr: 'Tables exportées (source : barrel file)',
    ar: 'الجداول المصدرة (من ملف البرميل)',
    es: 'Tablas exportadas (fuente: barrel file)'
  },
  databaseBonusTitle: {
    en: 'Bonus: Schema files not exported',
    fr: 'Bonus : fichiers de schéma non exportés',
    ar: 'مكافأة: ملفات المخطط غير المصدرة',
    es: 'Bonus: archivos de esquema no exportados'
  },
  databaseNoExported: {
    en: '_No exported tables found._',
    fr: '_Aucune table exportée trouvée._',
    ar: '_لم يتم العثور على جداول مصدرة._',
    es: '_No se encontraron tablas exportadas._'
  },
  databaseNoFields: {
    en: '_No fields found._',
    fr: '_Aucun champ trouvé._',
    ar: '_لم يتم العثور على حقول._',
    es: '_No se encontraron campos._'
  },
  databaseNoTables: {
    en: '_No tables found._',
    fr: '_Aucune table trouvée._',
    ar: '_لم يتم العثور على جداول._',
    es: '_No se encontraron tablas._'
  },
  databaseAllExported: {
    en: '_All schema files are exported._',
    fr: '_Tous les fichiers de schéma sont exportés._',
    ar: '_جميع ملفات المخطط تم تصديرها._',
    es: '_Todos los archivos de esquema están exportados._'
  },
} as const;
