#!/usr/bin/env node
/**
 * Script to add all missing i18n keys to all 4 locale JSON files.
 * Run: node scripts/add-i18n-keys.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = resolve(__dirname, "../src/i18n");

const locales = ["fr", "en", "es", "ar"];

// ========== NEW KEYS TO ADD ==========

const newKeys = {
  // ===== ABOUT PAGE =====
  about: {
    metaTitle: {
      fr: "À propos — Concordia",
      en: "About — Concordia",
      es: "Acerca de — Concordia",
      ar: "حول — كونكورديا",
    },
    heroLabel: {
      fr: "Notre mission",
      en: "Our Mission",
      es: "Nuestra misión",
      ar: "مهمتنا",
    },
    heroTitle: {
      fr: "Renforcer les liens sociaux, localement.",
      en: "Strengthening social bonds, locally.",
      es: "Fortaleciendo los lazos sociales, localmente.",
      ar: "تعزيز الروابط الاجتماعية محليًا.",
    },
    heroSubtitle: {
      fr: "Concordia est une plateforme citoyenne conçue pour rassembler habitants, associations et acteurs locaux au sein d'un même espace de confiance.",
      en: "Concordia is a civic platform, designed to bring together residents, associations and local actors within a single trusted space.",
      es: "Concordia es una plataforma cívica diseñada para reunir a residentes, asociaciones y actores locales en un único espacio de confianza.",
      ar: "كونكورديا هي منصة مدنية مصممة لجمع السكان والجمعيات والفاعلين المحليين ضمن فضاء موثوق واحد.",
    },
    heroCta: {
      fr: "Rejoindre le mouvement",
      en: "Join the movement",
      es: "Únete al movimiento",
      ar: "انضم إلى الحركة",
    },
    whyLabel: {
      fr: "Pourquoi Concordia ?",
      en: "Why Concordia?",
      es: "¿Por qué Concordia?",
      ar: "لماذا كونكورديا؟",
    },
    whyTitle: {
      fr: "La technologie au service du lien humain",
      en: "Technology serving human connection",
      es: "La tecnología al servicio de la conexión humana",
      ar: "التكنولوجيا في خدمة الرابط الإنساني",
    },
    whyBody1: {
      fr: "Dans un monde de plus en plus fragmenté, Concordia crée des espaces numériques qui renforcent la vie de quartier. Notre plateforme connecte les habitants aux initiatives locales, aux services de proximité et aux personnes qui font vivre leur communauté.",
      en: "In an increasingly fragmented world, Concordia creates digital spaces that strengthen neighborhood life. Our platform connects residents to local initiatives, nearby services and the people who bring their community to life.",
      es: "En un mundo cada vez más fragmentado, Concordia crea espacios digitales que fortalecen la vida del barrio. Nuestra plataforma conecta a los residentes con las iniciativas locales, los servicios cercanos y las personas que dan vida a su comunidad.",
      ar: "في عالم متزايد التفكك، تخلق كونكورديا فضاءات رقمية تعزز حياة الحي. منصتنا تربط السكان بالمبادرات المحلية والخدمات القريبة والأشخاص الذين يحيون مجتمعهم.",
    },
    whyBody2: {
      fr: "Nous croyons que la technologie doit être invisible : un outil simple, accessible, qui amplifie les liens plutôt que de les remplacer.",
      en: "We believe technology should be invisible: a simple, accessible tool that amplifies bonds rather than replacing them.",
      es: "Creemos que la tecnología debe ser invisible: una herramienta simple y accesible que amplifica los lazos en lugar de reemplazarlos.",
      ar: "نحن نؤمن بأن التكنولوجيا يجب أن تكون غير مرئية: أداة بسيطة وسهلة تعزز الروابط بدلاً من استبدالها.",
    },
    values: {
      proximity: {
        title: { fr: "Proximité", en: "Proximity", es: "Proximidad", ar: "قرب" },
        desc: {
          fr: "Nous rapprochons les citoyens de leur territoire et de leurs voisins pour créer un tissu social solide.",
          en: "We bring citizens closer to their territory and neighbors to create a strong social fabric.",
          es: "Acercamos a los ciudadanos a su territorio y a sus vecinos para crear un tejido social sólido.",
          ar: "نقرب المواطنين من أراضيهم وجيرانهم لخلق نسيج اجتماعي متين.",
        },
      },
      solidarity: {
        title: { fr: "Solidarité", en: "Solidarity", es: "Solidaridad", ar: "تضامن" },
        desc: {
          fr: "Chaque action sur Concordia renforce l'entraide au sein de la communauté locale.",
          en: "Every action on Concordia strengthens mutual aid within the local community.",
          es: "Cada acción en Concordia fortalece la ayuda mutua dentro de la comunidad local.",
          ar: "كل عمل على كونكورديا يعزز التضامن داخل المجتمع المحلي.",
        },
      },
      commitment: {
        title: { fr: "Engagement", en: "Commitment", es: "Compromiso", ar: "التزام" },
        desc: {
          fr: "Nous offrons des moyens concrets de s'impliquer et de participer à la vie de votre quartier.",
          en: "We offer concrete ways to get involved and participate in your neighborhood life.",
          es: "Ofrecemos formas concretas de involucrarse y participar en la vida de su barrio.",
          ar: "نقدم طرقًا ملموسة للمشاركة والانخراط في حياة حيك.",
        },
      },
      sustainability: {
        title: { fr: "Durabilité", en: "Sustainability", es: "Sostenibilidad", ar: "استدامة" },
        desc: {
          fr: "Notre approche promeut des solutions durables, respectueuses de l'environnement et des personnes.",
          en: "Our approach promotes lasting solutions, respectful of the environment and people.",
          es: "Nuestro enfoque promueve soluciones duraderas, respetuosas con el medio ambiente y las personas.",
          ar: "نهجنا يعزز حلولاً مستدامة تحترم البيئة والأشخاص.",
        },
      },
    },
    pillarsLabel: {
      fr: "Nos 4 piliers",
      en: "Our 4 Pillars",
      es: "Nuestros 4 pilares",
      ar: "أعمدتنا الأربعة",
    },
    pillarsTitle: {
      fr: "Les fondations de Concordia",
      en: "The foundations of Concordia",
      es: "Los cimientos de Concordia",
      ar: "أسس كونكورديا",
    },
    pillars: {
      mapping: {
        title: { fr: "Cartographie locale", en: "Local Mapping", es: "Cartografía local", ar: "خرائط محلية" },
        desc: {
          fr: "Découvrez les acteurs, initiatives et services autour de vous avec une carte vivante.",
          en: "Discover the actors, initiatives and services around you with a living map.",
          es: "Descubre los actores, iniciativas y servicios a tu alrededor con un mapa vivo.",
          ar: "اكتشف الفاعلين والمبادرات والخدمات من حولك بخريطة حية.",
        },
      },
      mediation: {
        title: { fr: "Médiation", en: "Mediation", es: "Mediación", ar: "وساطة" },
        desc: {
          fr: "Des outils pour résoudre les conflits et favoriser le dialogue entre les membres de la communauté.",
          en: "Tools to resolve conflicts and foster dialogue between community members.",
          es: "Herramientas para resolver conflictos y fomentar el diálogo entre miembros de la comunidad.",
          ar: "أدوات لحل النزاعات وتعزيز الحوار بين أعضاء المجتمع.",
        },
      },
      skills: {
        title: { fr: "Compétences", en: "Skills", es: "Competencias", ar: "مهارات" },
        desc: {
          fr: "Partagez et développez vos savoir-faire à travers des ateliers et des échanges collaboratifs.",
          en: "Share and develop your know-how through workshops and collaborative exchanges.",
          es: "Comparte y desarrolla tus saberes a través de talleres e intercambios colaborativos.",
          ar: "شارك وطور معارفك من خلال ورش العمل والتبادلات التعاونية.",
        },
      },
      education: {
        title: { fr: "Éducation & Santé", en: "Education & Health", es: "Educación y salud", ar: "التعليم والصحة" },
        desc: {
          fr: "Accédez à des ressources éducatives et de bien-être pour renforcer la résilience de la communauté.",
          en: "Access educational and wellness resources to strengthen community resilience.",
          es: "Accede a recursos educativos y de bienestar para fortalecer la resiliencia de la comunidad.",
          ar: "احصل على موارد تعليمية وصحية لتعزيز مرونة المجتمع.",
        },
      },
    },
    coreLabel: {
      fr: "Nos valeurs fondamentales",
      en: "Our Core Values",
      es: "Nuestros valores fundamentales",
      ar: "قيمنا الأساسية",
    },
    coreTitle: {
      fr: "Ce en quoi nous croyons",
      en: "What we believe in",
      es: "En lo que creemos",
      ar: "ما نؤمن به",
    },
    core: {
      transparency: {
        title: { fr: "Transparence totale", en: "Total Transparency", es: "Transparencia total", ar: "شفافية تامة" },
        desc: {
          fr: "Toutes les décisions sont documentées et accessibles. Chaque euro est suivi. Chaque vote est public.",
          en: "All decisions are documented and accessible. Every euro is tracked. Every vote is public.",
          es: "Todas las decisiones están documentadas y accesibles. Cada euro es rastreado. Cada voto es público.",
          ar: "جميع القرارات موثقة ومتاحة. كل يورو يُتابع. كل تصويت علني.",
        },
      },
      ecology: {
        title: { fr: "Écologie numérique", en: "Digital Ecology", es: "Ecología digital", ar: "بيئة رقمية" },
        desc: {
          fr: "Infrastructure minimaliste, hébergement vert, sobriété algorithmique. Moins de code, plus de sens.",
          en: "Minimalist infrastructure, green hosting, algorithmic sobriety. Less code, more meaning.",
          es: "Infraestructura minimalista, alojamiento verde, sobriedad algorítmica. Menos código, más significado.",
          ar: "بنية تحتية بسيطة، استضافة خضراء، اعتدال خوارزمي. كود أقل، معنى أكثر.",
        },
      },
      inclusion: {
        title: { fr: "Inclusion pour tous", en: "Inclusion for All", es: "Inclusión para todos", ar: "إدماج للجميع" },
        desc: {
          fr: "Accessibilité WCAG, multilinguisme, design universel. Concordia est conçu pour être utilisé par tous.",
          en: "WCAG accessibility, multilingualism, universal design. Concordia is built to be used by everyone.",
          es: "Accesibilidad WCAG, multilingüismo, diseño universal. Concordia está diseñado para ser usado por todos.",
          ar: "إتاحة WCAG، تعدد اللغات، تصميم شامل. كونكورديا مصممة ليستخدمها الجميع.",
        },
      },
    },
    impactLabel: {
      fr: "Notre impact",
      en: "Our Impact",
      es: "Nuestro impacto",
      ar: "تأثيرنا",
    },
    impactTitle: {
      fr: "Des chiffres qui parlent",
      en: "Numbers that speak",
      es: "Números que hablan",
      ar: "أرقام تتحدث",
    },
    stats: {
      mediations: { fr: "Médiations réalisées", en: "Mediations completed", es: "Mediaciones realizadas", ar: "وساطات منجزة" },
      projects: { fr: "Projets lancés", en: "Projects launched", es: "Proyectos lanzados", ar: "مشاريع أُطلقت" },
      volunteerHours: { fr: "Heures de bénévolat", en: "Volunteer hours", es: "Horas de voluntariado", ar: "ساعات تطوع" },
      trustRate: { fr: "Taux de confiance", en: "Trust rate", es: "Tasa de confianza", ar: "نسبة الثقة" },
    },
    ctaTitle: {
      fr: "Prêt(e) à faire la différence dans votre quartier ?",
      en: "Ready to make a difference in your neighborhood?",
      es: "¿Listo para hacer la diferencia en tu barrio?",
      ar: "هل أنت مستعد لإحداث فرق في حيك؟",
    },
    ctaDesc: {
      fr: "Rejoignez Concordia et participez à une aventure citoyenne qui compte.",
      en: "Join Concordia and take part in a civic adventure that matters.",
      es: "Únete a Concordia y participa en una aventura cívica que importa.",
      ar: "انضم إلى كونكورديا وشارك في مغامرة مدنية ذات معنى.",
    },
    ctaSignUp: {
      fr: "S'inscrire",
      en: "Sign up",
      es: "Registrarse",
      ar: "التسجيل",
    },
    ctaReadBlog: {
      fr: "Lire le blog",
      en: "Read the blog",
      es: "Leer el blog",
      ar: "اقرأ المدونة",
    },
  },

  // ===== CONTACT PAGE (extend existing contactPage) =====
  contactPage: {
    metaTitle: {
      fr: "Contact — Concordia",
      en: "Contact — Concordia",
      es: "Contacto — Concordia",
      ar: "اتصل بنا — كونكورديا",
    },
    title: { fr: "Contact", en: "Contact", es: "Contacto", ar: "اتصل بنا" },
    subtitle: { fr: "Une question, une suggestion, un partenariat ?", en: "A question, a suggestion, a partnership?", es: "¿Una pregunta, una sugerencia, una asociación?", ar: "سؤال أو اقتراح أو شراكة؟" },
    description: {
      fr: "N'hésitez pas à nous écrire. Notre équipe vous répondra dans les meilleurs délais.",
      en: "Feel free to write to us. Our team will get back to you as soon as possible.",
      es: "No dude en escribirnos. Nuestro equipo le responderá lo antes posible.",
      ar: "لا تتردد في الكتابة لنا. سيرد عليك فريقنا في أقرب وقت ممكن.",
    },
    sendMessage: {
      fr: "Envoyez-nous un message",
      en: "Send us a message",
      es: "Envíenos un mensaje",
      ar: "أرسل لنا رسالة",
    },
    fullName: { fr: "Nom complet", en: "Full name", es: "Nombre completo", ar: "الاسم الكامل" },
    namePlaceholder: { fr: "Votre nom", en: "Your name", es: "Su nombre", ar: "اسمك" },
    email: { fr: "Email", en: "Email", es: "Correo electrónico", ar: "البريد الإلكتروني" },
    emailPlaceholder: { fr: "votre@email.com", en: "your@email.com", es: "su@correo.com", ar: "بريدك@الإلكتروني.com" },
    subject: { fr: "Sujet", en: "Subject", es: "Asunto", ar: "الموضوع" },
    subjectPlaceholder: { fr: "Choisissez un sujet", en: "Choose a subject", es: "Elija un asunto", ar: "اختر موضوعًا" },
    subjectQuestion: { fr: "Question générale", en: "General question", es: "Pregunta general", ar: "سؤال عام" },
    subjectBug: { fr: "Signaler un bug", en: "Report a bug", es: "Reportar un error", ar: "الإبلاغ عن خطأ" },
    subjectPartnership: { fr: "Partenariat", en: "Partnership", es: "Asociación", ar: "شراكة" },
    subjectPress: { fr: "Presse", en: "Press", es: "Prensa", ar: "صحافة" },
    subjectOther: { fr: "Autre", en: "Other", es: "Otro", ar: "أخرى" },
    message: { fr: "Message", en: "Message", es: "Mensaje", ar: "الرسالة" },
    messagePlaceholder: { fr: "Décrivez votre demande…", en: "Describe your inquiry…", es: "Describa su consulta…", ar: "صف استفسارك…" },
    send: { fr: "Envoyer le message", en: "Send message", es: "Enviar mensaje", ar: "إرسال الرسالة" },
    methodEmail: { fr: "Email", en: "Email", es: "Correo", ar: "البريد" },
    methodAddress: { fr: "Adresse", en: "Address", es: "Dirección", ar: "العنوان" },
    methodHours: { fr: "Disponibilité", en: "Availability", es: "Disponibilidad", ar: "التوفر" },
    hoursValue: { fr: "Lun–Ven, 9h–18h", en: "Mon–Fri, 9am–6pm", es: "Lun–Vie, 9h–18h", ar: "الإثنين–الجمعة، 9ص–6م" },
    faqTitle: { fr: "FAQ", en: "FAQ", es: "FAQ", ar: "الأسئلة الشائعة" },
    faqDescription: {
      fr: "Consultez notre base de connaissances pour trouver rapidement des réponses à vos questions.",
      en: "Check our knowledge base to quickly find answers to your questions.",
      es: "Consulte nuestra base de conocimiento para encontrar rápidamente respuestas a sus preguntas.",
      ar: "تصفح قاعدة المعرفة لدينا للعثور بسرعة على إجابات لأسئلتك.",
    },
    faqCta: { fr: "Lire le blog", en: "Read the blog", es: "Leer el blog", ar: "اقرأ المدونة" },
  },

  // ===== BLOG ADDITIONS (extend existing blog) =====
  blog: {
    subtitle: {
      fr: "Reportages, portraits et nouvelles de notre communauté",
      en: "Reports, portraits and news from our community",
      es: "Reportajes, retratos y noticias de nuestra comunidad",
      ar: "تقارير وصور وأخبار من مجتمعنا",
    },
    filterByCategory: { fr: "Filtrer par catégorie", en: "Filter by category", es: "Filtrar por categoría", ar: "تصفية حسب الفئة" },
    all: { fr: "Tout", en: "All", es: "Todo", ar: "الكل" },
    featuredArticles: { fr: "Articles mis en avant", en: "Featured articles", es: "Artículos destacados", ar: "مقالات مميزة" },
    spotlight: { fr: "À la une", en: "Spotlight", es: "Destacado", ar: "تحت الضوء" },
    allArticles: { fr: "Tous les articles", en: "All articles", es: "Todos los artículos", ar: "جميع المقالات" },
    newsletterTitle: { fr: "Restez informé", en: "Stay informed", es: "Manténgase informado", ar: "ابق على اطلاع" },
    newsletterEmail: { fr: "Adresse email", en: "Email address", es: "Dirección de correo", ar: "عنوان البريد الإلكتروني" },
    newsletterPlaceholder: { fr: "votre@email.com", en: "your@email.com", es: "su@correo.com", ar: "بريدك@الإلكتروني" },
    newsletterSubscribe: { fr: "S'abonner", en: "Subscribe", es: "Suscribirse", ar: "اشترك" },
    newsletterDescription: {
      fr: "Recevez les derniers articles directement dans votre boîte mail.",
      en: "Get the latest articles delivered to your inbox.",
      es: "Reciba los últimos artículos directamente en su bandeja de entrada.",
      ar: "احصل على أحدث المقالات مباشرة في بريدك.",
    },
    // Category page
    categoryAllArticles: {
      fr: "articles dans cette catégorie",
      en: "articles in this category",
      es: "artículos en esta categoría",
      ar: "مقالات في هذه الفئة",
    },
    categorySubtitle: {
      fr: "Découvrez les projets et idées qui transforment notre communauté.",
      en: "Discover the projects and ideas transforming our community.",
      es: "Descubra los proyectos e ideas que transforman nuestra comunidad.",
      ar: "اكتشف المشاريع والأفكار التي تحول مجتمعنا.",
    },
    categoryFeatured: { fr: "À la une", en: "Featured", es: "Destacado", ar: "مميز" },
    categoryRecent: { fr: "Articles récents", en: "Recent articles", es: "Artículos recientes", ar: "مقالات حديثة" },
    categoryEmpty: {
      fr: "Aucun autre article dans cette catégorie pour le moment.",
      en: "No other articles in this category at the moment.",
      es: "No hay otros artículos en esta categoría por el momento.",
      ar: "لا توجد مقالات أخرى في هذه الفئة حاليًا.",
    },
    categorySidebar: { fr: "Catégories", en: "Categories", es: "Categorías", ar: "الفئات" },
    categoryTags: { fr: "Tags populaires", en: "Popular tags", es: "Etiquetas populares", ar: "وسوم شائعة" },
    // Article detail
    articleAuthor: { fr: "Auteur", en: "Author", es: "Autor", ar: "الكاتب" },
    articleViewProfile: { fr: "Voir le profil", en: "View profile", es: "Ver perfil", ar: "عرض الملف" },
    articleToc: { fr: "Table des matières", en: "Table of Contents", es: "Tabla de contenidos", ar: "جدول المحتويات" },
    articleShare: { fr: "Partager cet article", en: "Share this article", es: "Compartir este artículo", ar: "شارك هذا المقال" },
    articleRelated: { fr: "Articles liés", en: "Related articles", es: "Artículos relacionados", ar: "مقالات ذات صلة" },
    articleDontMiss: {
      fr: "Ne manquez aucun article, abonnez-vous maintenant !",
      en: "Don't miss any article, subscribe now!",
      es: "¡No te pierdas ningún artículo, suscríbete ahora!",
      ar: "لا تفوت أي مقال، اشترك الآن!",
    },
    // Author page
    authorBadge: { fr: "Auteur", en: "Author", es: "Autor", ar: "كاتب" },
    authorMetaTitle: { fr: "— Auteur", en: "— Author", es: "— Autor", ar: "— كاتب" },
    authorArticles: { fr: "Article", en: "Article", es: "Artículo", ar: "مقال" },
    authorArticlesPlural: { fr: "Articles", en: "Articles", es: "Artículos", ar: "مقالات" },
    authorCategory: { fr: "Catégorie", en: "Category", es: "Categoría", ar: "فئة" },
    authorCategoriesPlural: { fr: "Catégories", en: "Categories", es: "Categorías", ar: "فئات" },
    authorLatestArticle: { fr: "Dernier article", en: "Latest article", es: "Último artículo", ar: "آخر مقال" },
    authorPublishedArticles: { fr: "Articles publiés", en: "Published articles", es: "Artículos publicados", ar: "المقالات المنشورة" },
    authorNoArticles: {
      fr: "Cet auteur n'a pas encore publié d'articles.",
      en: "This author has not published any articles yet.",
      es: "Este autor aún no ha publicado artículos.",
      ar: "لم ينشر هذا الكاتب أي مقالات بعد.",
    },
    authorTrustTitle: { fr: "Confiance & Transparence", en: "Trust & Transparency", es: "Confianza y transparencia", ar: "الثقة والشفافية" },
    authorTrustVerified: { fr: "Profil vérifié", en: "Verified profile", es: "Perfil verificado", ar: "ملف موثق" },
    authorTrustReviewed: {
      fr: "Articles revus par l'équipe éditoriale",
      en: "Articles reviewed by the editorial team",
      es: "Artículos revisados por el equipo editorial",
      ar: "مقالات مراجعة من الفريق التحريري",
    },
    authorTrustActive: { fr: "Membre actif de la communauté", en: "Active community member", es: "Miembro activo de la comunidad", ar: "عضو نشط في المجتمع" },
    authorSpecialties: { fr: "Spécialités", en: "Specialties", es: "Especialidades", ar: "التخصصات" },
    authorNoSpecialties: { fr: "Aucune spécialité listée.", en: "No specialties listed.", es: "Sin especialidades listadas.", ar: "لا تخصصات مدرجة." },
  },

  // ===== ORGANIZATIONS =====
  organizations: {
    title: { fr: "Organisations", en: "Organizations", es: "Organizaciones", ar: "المنظمات" },
    subtitle: {
      fr: "Découvrez les organisations qui font vivre Concordia",
      en: "Discover the organizations that bring Concordia to life",
      es: "Descubre las organizaciones que dan vida a Concordia",
      ar: "اكتشف المنظمات التي تحيي كونكورديا",
    },
    empty: {
      fr: "Aucune organisation enregistrée pour le moment.",
      en: "No organizations registered at the moment.",
      es: "No hay organizaciones registradas por el momento.",
      ar: "لا توجد منظمات مسجلة حاليًا.",
    },
    featured: { fr: "En vedette", en: "Featured", es: "Destacada", ar: "مميزة" },
    members: { fr: "membres", en: "members", es: "miembros", ar: "أعضاء" },
    since: { fr: "Depuis", en: "Since", es: "Desde", ar: "منذ" },
    socialLink: { fr: "Lien social", en: "Social link", es: "Enlace social", ar: "رابط اجتماعي" },
    discover: { fr: "Découvrir", en: "Discover", es: "Descubrir", ar: "اكتشف" },
    // Detail page
    badge: { fr: "Organisation", en: "Organization", es: "Organización", ar: "منظمة" },
    foundedIn: { fr: "Fondée en", en: "Founded in", es: "Fundada en", ar: "تأسست في" },
    about: { fr: "À propos", en: "About", es: "Acerca de", ar: "حول" },
    expertise: { fr: "Domaines d'expertise", en: "Areas of expertise", es: "Áreas de experiencia", ar: "مجالات الخبرة" },
    services: { fr: "Services proposés", en: "Services offered", es: "Servicios ofrecidos", ar: "الخدمات المقدمة" },
    team: { fr: "L'équipe", en: "The Team", es: "El equipo", ar: "الفريق" },
    recentArticles: { fr: "Articles récents", en: "Recent articles", es: "Artículos recientes", ar: "مقالات حديثة" },
    viewAllArticles: { fr: "Voir tous les articles", en: "View all articles", es: "Ver todos los artículos", ar: "عرض جميع المقالات" },
    contact: { fr: "Contact", en: "Contact", es: "Contacto", ar: "اتصال" },
    statistics: { fr: "Statistiques", en: "Statistics", es: "Estadísticas", ar: "إحصائيات" },
    reviews: { fr: "Avis", en: "Reviews", es: "Reseñas", ar: "مراجعات" },
    comments: { fr: "Commentaires", en: "Comments", es: "Comentarios", ar: "تعليقات" },
    shares: { fr: "Partages", en: "Shares", es: "Compartidos", ar: "مشاركات" },
    likes: { fr: "J'aime", en: "Likes", es: "Me gusta", ar: "إعجابات" },
    authors: { fr: "Auteurs", en: "Authors", es: "Autores", ar: "كتّاب" },
    areasServed: { fr: "Zones desservies", en: "Areas served", es: "Zonas atendidas", ar: "المناطق المخدومة" },
    languages: { fr: "Langues", en: "Languages", es: "Idiomas", ar: "اللغات" },
    founders: { fr: "Fondateurs", en: "Founders", es: "Fundadores", ar: "المؤسسون" },
    departments: { fr: "Départements", en: "Departments", es: "Departamentos", ar: "الأقسام" },
    transparencyTitle: { fr: "Transparence & Politiques", en: "Transparency & Policies", es: "Transparencia y políticas", ar: "الشفافية والسياسات" },
    transparencyCharter: { fr: "Charte éditoriale", en: "Editorial charter", es: "Carta editorial", ar: "ميثاق تحريري" },
    transparencyEthics: { fr: "Politique d'éthique", en: "Ethics policy", es: "Política de ética", ar: "سياسة الأخلاقيات" },
    transparencyCorrections: { fr: "Politique de corrections", en: "Corrections policy", es: "Política de correcciones", ar: "سياسة التصحيحات" },
    transparencyDiversity: { fr: "Politique de diversité", en: "Diversity policy", es: "Política de diversidad", ar: "سياسة التنوع" },
    transparencyFunding: { fr: "Financement & propriété", en: "Funding & ownership", es: "Financiación y propiedad", ar: "التمويل والملكية" },
  },

  // ===== AUTH ADDITIONS (extend existing auth) =====
  auth: {
    invitationAccepted: { fr: "Invitation acceptée.", en: "Invitation accepted.", es: "Invitación aceptada.", ar: "تم قبول الدعوة." },
    invitationRejected: { fr: "Invitation refusée.", en: "Invitation rejected.", es: "Invitación rechazada.", ar: "تم رفض الدعوة." },
    backToProfile: { fr: "Retour au profil", en: "Back to profile", es: "Volver al perfil", ar: "العودة إلى الملف" },
    invitationsDescription: {
      fr: "Consultez et répondez à vos invitations d'organisation.",
      en: "View and respond to your organization invitations.",
      es: "Consulte y responda a sus invitaciones de organización.",
      ar: "عرض والرد على دعوات منظمتك.",
    },
    noInvitations: { fr: "Aucune invitation en attente.", en: "No pending invitations.", es: "Sin invitaciones pendientes.", ar: "لا توجد دعوات معلقة." },
    invitationRole: { fr: "Rôle", en: "Role", es: "Rol", ar: "الدور" },
    invitationExpires: { fr: "Expire", en: "Expires", es: "Expira", ar: "ينتهي" },
    invitedBy: { fr: "Invité par", en: "Invited by", es: "Invitado por", ar: "دعوة من" },
    acceptInvitation: { fr: "Accepter", en: "Accept", es: "Aceptar", ar: "قبول" },
    rejectInvitation: { fr: "Refuser", en: "Reject", es: "Rechazar", ar: "رفض" },
    legalTitle: { fr: "Mentions légales", en: "Legal notices", es: "Avisos legales", ar: "إشعارات قانونية" },
  },

  // ===== ADMIN (extend existing adminPanel) =====
  adminPanel: {
    welcome: { fr: "Bienvenue,", en: "Welcome,", es: "Bienvenido,", ar: "مرحبًا," },
    roleAdmin: { fr: "Administrateur", en: "Administrator", es: "Administrador", ar: "مدير" },
    statsPublished: { fr: "Articles publiés", en: "Published articles", es: "Artículos publicados", ar: "مقالات منشورة" },
    statsDrafts: { fr: "Brouillons", en: "Drafts", es: "Borradores", ar: "مسودات" },
    statsPendingComments: { fr: "Commentaires en attente", en: "Pending comments", es: "Comentarios pendientes", ar: "تعليقات معلقة" },
    latestArticles: { fr: "Derniers articles", en: "Latest articles", es: "Últimos artículos", ar: "أحدث المقالات" },
    viewAll: { fr: "Voir tout", en: "View all", es: "Ver todo", ar: "عرض الكل" },
    noArticles: { fr: "Aucun article pour le moment.", en: "No articles yet.", es: "Sin artículos por el momento.", ar: "لا توجد مقالات بعد." },
    noActivity: { fr: "Aucune activité récente.", en: "No recent activity.", es: "Sin actividad reciente.", ar: "لا يوجد نشاط حديث." },
    revokeRole: { fr: "Retirer un rôle", en: "Revoke role", es: "Revocar rol", ar: "سحب الدور" },
  },

  // ===== ADMIN BLOG =====
  adminBlog: {
    articles: {
      title: { fr: "Articles", en: "Articles", es: "Artículos", ar: "المقالات" },
      new: { fr: "Nouvel article", en: "New article", es: "Nuevo artículo", ar: "مقال جديد" },
      editTitle: { fr: "Modifier l'article", en: "Edit article", es: "Editar artículo", ar: "تعديل المقال" },
      viewOnSite: { fr: "Voir sur le site", en: "View on site", es: "Ver en el sitio", ar: "عرض على الموقع" },
    },
    authors: {
      title: { fr: "Auteurs", en: "Authors", es: "Autores", ar: "الكتّاب" },
      new: { fr: "Nouvel auteur", en: "New author", es: "Nuevo autor", ar: "كاتب جديد" },
      editTitle: { fr: "Modifier l'auteur", en: "Edit author", es: "Editar autor", ar: "تعديل الكاتب" },
      viewOnSite: { fr: "Voir sur le site", en: "View on site", es: "Ver en el sitio", ar: "عرض على الموقع" },
      createCta: { fr: "Créer un auteur", en: "Create an author", es: "Crear un autor", ar: "إنشاء كاتب" },
      empty: { fr: "Aucun auteur trouvé.", en: "No author found.", es: "No se encontró ningún autor.", ar: "لم يُعثر على أي كاتب." },
      total: { fr: "Total", en: "Total", es: "Total", ar: "المجموع" },
      featured: { fr: "En vedette", en: "Featured", es: "Destacados", ar: "مميزون" },
    },
    categories: {
      title: { fr: "Catégories", en: "Categories", es: "Categorías", ar: "الفئات" },
      new: { fr: "Nouvelle catégorie", en: "New category", es: "Nueva categoría", ar: "فئة جديدة" },
      editTitle: { fr: "Modifier la catégorie", en: "Edit category", es: "Editar categoría", ar: "تعديل الفئة" },
      viewOnSite: { fr: "Voir sur le site", en: "View on site", es: "Ver en el sitio", ar: "عرض على الموقع" },
      subtitle: { fr: "Organisez les articles par catégories thématiques.", en: "Organize articles by thematic categories.", es: "Organice los artículos por categorías temáticas.", ar: "نظم المقالات حسب الفئات الموضوعية." },
      treeHome: { fr: "Accueil", en: "Home", es: "Inicio", ar: "الرئيسية" },
      treeMenu: { fr: "Menu", en: "Menu", es: "Menú", ar: "القائمة" },
      treeRoot: { fr: "Racine", en: "Root", es: "Raíz", ar: "الجذر" },
    },
    comments: {
      title: { fr: "Commentaires", en: "Comments", es: "Comentarios", ar: "التعليقات" },
      subtitle: { fr: "Vue d'ensemble et gestion de tous les commentaires.", en: "Overview and management of all comments.", es: "Visión general y gestión de todos los comentarios.", ar: "نظرة عامة وإدارة جميع التعليقات." },
      pending: { fr: "En attente", en: "Pending", es: "Pendiente", ar: "معلق" },
      approved: { fr: "Approuvés", en: "Approved", es: "Aprobados", ar: "موافق عليه" },
      rejected: { fr: "Rejetés", en: "Rejected", es: "Rechazados", ar: "مرفوض" },
      showAll: { fr: "Tout afficher", en: "Show all", es: "Mostrar todo", ar: "عرض الكل" },
      contentType: { fr: "Type de contenu", en: "Content type", es: "Tipo de contenido", ar: "نوع المحتوى" },
      empty: { fr: "Aucun commentaire trouvé.", en: "No comments found.", es: "No se encontraron comentarios.", ar: "لم يُعثر على أي تعليقات." },
    },
    media: {
      title: { fr: "Bibliothèque de médias", en: "Media library", es: "Biblioteca de medios", ar: "مكتبة الوسائط" },
      upload: { fr: "Uploader", en: "Upload", es: "Subir", ar: "رفع" },
      subtitle: { fr: "Gérez les images et fichiers du blog.", en: "Manage blog images and files.", es: "Gestione las imágenes y archivos del blog.", ar: "إدارة صور وملفات المدونة." },
      searchPlaceholder: { fr: "Rechercher par nom de fichier…", en: "Search by filename…", es: "Buscar por nombre de archivo…", ar: "البحث باسم الملف…" },
      dropzone: { fr: "Glissez vos fichiers ici ou cliquez pour parcourir", en: "Drag your files here or click to browse", es: "Arrastre sus archivos aquí o haga clic para explorar", ar: "اسحب ملفاتك هنا أو انقر للتصفح" },
      formats: { fr: "JPEG, PNG, WebP, AVIF, GIF, SVG — Max 10 Mo par fichier", en: "JPEG, PNG, WebP, AVIF, GIF, SVG — Max 10 MB per file", es: "JPEG, PNG, WebP, AVIF, GIF, SVG — Máx 10 MB por archivo", ar: "JPEG, PNG, WebP, AVIF, GIF, SVG — حد أقصى 10 ميغابايت لكل ملف" },
      details: { fr: "Détails du média", en: "Media details", es: "Detalles del medio", ar: "تفاصيل الوسائط" },
    },
    form: {
      multilingual: { fr: "Contenu multilingue", en: "Multilingual content", es: "Contenido multilingüe", ar: "محتوى متعدد اللغات" },
      titleLabel: { fr: "Titre", en: "Title", es: "Título", ar: "العنوان" },
      subtitle: { fr: "Sous-titre", en: "Subtitle", es: "Subtítulo", ar: "العنوان الفرعي" },
      excerpt: { fr: "Extrait", en: "Excerpt", es: "Extracto", ar: "المقتطف" },
      content: { fr: "Contenu (Markdown)", en: "Content (Markdown)", es: "Contenido (Markdown)", ar: "المحتوى (ماركداون)" },
      seoTitle: { fr: "Titre SEO", en: "SEO Title", es: "Título SEO", ar: "عنوان SEO" },
      seoDescription: { fr: "Description SEO", en: "SEO Description", es: "Descripción SEO", ar: "وصف SEO" },
      seoKeywords: { fr: "Mots-clés SEO", en: "SEO Keywords", es: "Palabras clave SEO", ar: "كلمات مفتاحية SEO" },
      coverImage: { fr: "Image de couverture", en: "Cover image", es: "Imagen de portada", ar: "صورة الغلاف" },
      library: { fr: "Bibliothèque", en: "Library", es: "Biblioteca", ar: "المكتبة" },
      or: { fr: "ou", en: "or", es: "o", ar: "أو" },
      upload: { fr: "Uploader", en: "Upload", es: "Subir", ar: "رفع" },
      publishing: { fr: "Publication", en: "Publishing", es: "Publicación", ar: "النشر" },
      slug: { fr: "Slug", en: "Slug", es: "Slug", ar: "الرابط المختصر" },
      status: { fr: "Statut", en: "Status", es: "Estado", ar: "الحالة" },
      mainLanguage: { fr: "Langue principale", en: "Main language", es: "Idioma principal", ar: "اللغة الرئيسية" },
      displayName: { fr: "Nom affiché", en: "Display name", es: "Nombre mostrado", ar: "الاسم المعروض" },
      firstName: { fr: "Prénom", en: "First name", es: "Nombre", ar: "الاسم الأول" },
      lastName: { fr: "Nom de famille", en: "Last name", es: "Apellido", ar: "اسم العائلة" },
      titleRole: { fr: "Titre / Poste", en: "Title / Role", es: "Título / Cargo", ar: "اللقب / المنصب" },
      biography: { fr: "Biographie", en: "Biography", es: "Biografía", ar: "السيرة الذاتية" },
      contactSocial: { fr: "Contact & réseaux", en: "Contact & social", es: "Contacto y redes", ar: "التواصل والشبكات" },
      email: { fr: "Email", en: "Email", es: "Correo", ar: "البريد" },
      website: { fr: "Site web", en: "Website", es: "Sitio web", ar: "الموقع" },
      socialProfiles: { fr: "Profils sociaux (un par ligne)", en: "Social profiles (one per line)", es: "Perfiles sociales (uno por línea)", ar: "ملفات اجتماعية (واحد لكل سطر)" },
      avatar: { fr: "Photo / Avatar", en: "Photo / Avatar", es: "Foto / Avatar", ar: "صورة / أفاتار" },
      settings: { fr: "Paramètres", en: "Settings", es: "Configuración", ar: "الإعدادات" },
      categoryName: { fr: "Nom de la catégorie", en: "Category name", es: "Nombre de la categoría", ar: "اسم الفئة" },
      description: { fr: "Description", en: "Description", es: "Descripción", ar: "الوصف" },
      preview: { fr: "Aperçu", en: "Preview", es: "Vista previa", ar: "معاينة" },
      removeImage: { fr: "Retirer l'image", en: "Remove image", es: "Eliminar imagen", ar: "إزالة الصورة" },
      generateSlug: { fr: "Générer depuis le nom FR", en: "Generate from FR name", es: "Generar desde el nombre FR", ar: "إنشاء من الاسم FR" },
      parentCategory: { fr: "Catégorie parente", en: "Parent category", es: "Categoría principal", ar: "الفئة الأم" },
      noParent: { fr: "Aucune (racine)", en: "None (root)", es: "Ninguna (raíz)", ar: "لا شيء (جذر)" },
      altText: { fr: "Texte alternatif (alt)", en: "Alt text", es: "Texto alternativo", ar: "النص البديل" },
      caption: { fr: "Légende", en: "Caption", es: "Leyenda", ar: "تعليق" },
    },
    status: {
      published: { fr: "Publié", en: "Published", es: "Publicado", ar: "منشور" },
      draft: { fr: "Brouillon", en: "Draft", es: "Borrador", ar: "مسودة" },
      scheduled: { fr: "Programmé", en: "Scheduled", es: "Programado", ar: "مجدول" },
      archived: { fr: "Archivé", en: "Archived", es: "Archivado", ar: "مؤرشف" },
    },
    common: {
      result: { fr: "résultat", en: "result", es: "resultado", ar: "نتيجة" },
      results: { fr: "résultats", en: "results", es: "resultados", ar: "نتائج" },
      search: { fr: "Rechercher", en: "Search", es: "Buscar", ar: "بحث" },
      searchPlaceholder: { fr: "Slug, nom…", en: "Slug, name…", es: "Slug, nombre…", ar: "رابط، اسم…" },
      filter: { fr: "Filtrer", en: "Filter", es: "Filtrar", ar: "تصفية" },
      reset: { fr: "Réinitialiser", en: "Reset", es: "Reiniciar", ar: "إعادة تعيين" },
      all: { fr: "Tous", en: "All", es: "Todos", ar: "الكل" },
      yes: { fr: "Oui", en: "Yes", es: "Sí", ar: "نعم" },
      no: { fr: "Non", en: "No", es: "No", ar: "لا" },
      loading: { fr: "Chargement…", en: "Loading…", es: "Cargando…", ar: "جارٍ التحميل…" },
      save: { fr: "Enregistrer", en: "Save", es: "Guardar", ar: "حفظ" },
      delete: { fr: "Supprimer", en: "Delete", es: "Eliminar", ar: "حذف" },
      cancel: { fr: "Annuler", en: "Cancel", es: "Cancelar", ar: "إلغاء" },
    },
    // Admin audit
    audit: {
      entries: { fr: "entrées", en: "entries", es: "entradas", ar: "مدخلات" },
      subtitle: { fr: "Historique complet des actions administratives.", en: "Full history of administrative actions.", es: "Historial completo de acciones administrativas.", ar: "السجل الكامل للإجراءات الإدارية." },
      filterByAction: { fr: "Filtrer par action", en: "Filter by action", es: "Filtrar por acción", ar: "تصفية حسب الإجراء" },
      allActions: { fr: "Toutes les actions", en: "All actions", es: "Todas las acciones", ar: "جميع الإجراءات" },
      empty: { fr: "Aucune entrée dans le journal.", en: "No entries in the log.", es: "Sin entradas en el registro.", ar: "لا توجد مدخلات في السجل." },
      tableDate: { fr: "Date", en: "Date", es: "Fecha", ar: "التاريخ" },
      tableAction: { fr: "Action", en: "Action", es: "Acción", ar: "الإجراء" },
      tableUser: { fr: "Utilisateur", en: "User", es: "Usuario", ar: "المستخدم" },
      tableTarget: { fr: "Cible", en: "Target", es: "Objetivo", ar: "الهدف" },
      tableIp: { fr: "IP", en: "IP", es: "IP", ar: "IP" },
      tableDetails: { fr: "Détails", en: "Details", es: "Detalles", ar: "التفاصيل" },
      tableView: { fr: "Voir", en: "View", es: "Ver", ar: "عرض" },
    },
    // Admin config
    config: {
      subtitle: { fr: "Paramètres d'administration générale et gestion des rôles.", en: "General administration settings and role management.", es: "Configuración de administración general y gestión de roles.", ar: "إعدادات الإدارة العامة وإدارة الأدوار." },
      overview: { fr: "Vue d'ensemble", en: "Overview", es: "Vista general", ar: "نظرة عامة" },
      totalUsers: { fr: "Utilisateurs totaux", en: "Total users", es: "Usuarios totales", ar: "إجمالي المستخدمين" },
      administrators: { fr: "Administrateurs", en: "Administrators", es: "Administradores", ar: "مديرون" },
      bannedUsers: { fr: "Utilisateurs bannis", en: "Banned users", es: "Usuarios baneados", ar: "مستخدمون محظورون" },
      rolesTitle: { fr: "Rôles et permissions", en: "Roles and permissions", es: "Roles y permisos", ar: "الأدوار والصلاحيات" },
      securityTitle: { fr: "Sécurité", en: "Security", es: "Seguridad", ar: "الأمان" },
      quickActionsTitle: { fr: "Actions rapides", en: "Quick actions", es: "Acciones rápidas", ar: "إجراءات سريعة" },
      manageUsers: { fr: "Gérer les utilisateurs", en: "Manage users", es: "Gestionar usuarios", ar: "إدارة المستخدمين" },
      moderateContent: { fr: "Modérer le contenu", en: "Moderate content", es: "Moderar contenido", ar: "إدارة المحتوى" },
      viewLogs: { fr: "Voir les logs", en: "View logs", es: "Ver registros", ar: "عرض السجلات" },
      manageArticles: { fr: "Gérer les articles", en: "Manage articles", es: "Gestionar artículos", ar: "إدارة المقالات" },
    },
    // Admin moderation
    moderation: {
      subtitle: { fr: "Modérez les commentaires des visiteurs.", en: "Moderate visitor comments.", es: "Modere los comentarios de los visitantes.", ar: "إدارة تعليقات الزوار." },
      pending: { fr: "En attente", en: "Pending", es: "Pendiente", ar: "معلق" },
      approved: { fr: "Approuvés", en: "Approved", es: "Aprobados", ar: "موافق عليه" },
      rejected: { fr: "Rejetés", en: "Rejected", es: "Rechazados", ar: "مرفوض" },
      showAll: { fr: "Tout afficher", en: "Show all", es: "Mostrar todo", ar: "عرض الكل" },
      empty: { fr: "Aucun commentaire à modérer.", en: "No comments to moderate.", es: "Sin comentarios para moderar.", ar: "لا توجد تعليقات للإدارة." },
      approve: { fr: "Approuver", en: "Approve", es: "Aprobar", ar: "موافقة" },
      reject: { fr: "Rejeter", en: "Reject", es: "Rechazar", ar: "رفض" },
      tableAuthor: { fr: "Auteur", en: "Author", es: "Autor", ar: "الكاتب" },
      tableComment: { fr: "Commentaire", en: "Comment", es: "Comentario", ar: "التعليق" },
      tableArticle: { fr: "Article", en: "Article", es: "Artículo", ar: "المقال" },
      tableStatus: { fr: "Statut", en: "Status", es: "Estado", ar: "الحالة" },
      tableDate: { fr: "Date", en: "Date", es: "Fecha", ar: "التاريخ" },
      tableActions: { fr: "Actions", en: "Actions", es: "Acciones", ar: "إجراءات" },
    },
    // Admin users
    users: {
      subtitle: { fr: "Gérez les comptes, rôles et accès des utilisateurs.", en: "Manage user accounts, roles and access.", es: "Gestione las cuentas, roles y accesos de los usuarios.", ar: "إدارة حسابات المستخدمين والأدوار والوصول." },
      total: { fr: "total", en: "total", es: "total", ar: "المجموع" },
      searchPlaceholder: { fr: "Nom, email ou pseudo…", en: "Name, email or username…", es: "Nombre, email o usuario…", ar: "الاسم، البريد أو اسم المستخدم…" },
      roleFilter: { fr: "Rôle", en: "Role", es: "Rol", ar: "الدور" },
      allRoles: { fr: "Tous les rôles", en: "All roles", es: "Todos los roles", ar: "جميع الأدوار" },
      empty: { fr: "Aucun utilisateur trouvé.", en: "No user found.", es: "No se encontró ningún usuario.", ar: "لم يُعثر على أي مستخدم." },
      tableUser: { fr: "Utilisateur", en: "User", es: "Usuario", ar: "المستخدم" },
      tableEmail: { fr: "Email", en: "Email", es: "Correo", ar: "البريد" },
      tableStatus: { fr: "Statut", en: "Status", es: "Estado", ar: "الحالة" },
      tableRegistration: { fr: "Inscription", en: "Registration", es: "Registro", ar: "التسجيل" },
      tableActions: { fr: "Actions", en: "Actions", es: "Acciones", ar: "إجراءات" },
      statusActive: { fr: "Actif", en: "Active", es: "Activo", ar: "نشط" },
      statusUnverified: { fr: "Non vérifié", en: "Unverified", es: "No verificado", ar: "غير مُحقق" },
      statusBanned: { fr: "Banni", en: "Banned", es: "Baneado", ar: "محظور" },
    },
    allTypes: { fr: "Tous les types", en: "All types", es: "Todos los tipos", ar: "جميع الأنواع" },
    images: { fr: "Images", en: "Images", es: "Imágenes", ar: "صور" },
    videos: { fr: "Vidéos", en: "Videos", es: "Vídeos", ar: "فيديوهات" },
    audio: { fr: "Audio", en: "Audio", es: "Audio", ar: "صوت" },
  },

  // ===== COMMON ADDITIONS =====
  common: {
    home: { fr: "Accueil", en: "Home", es: "Inicio", ar: "الرئيسية" },
    readMore: { fr: "Lire la suite", en: "Read more", es: "Leer más", ar: "اقرأ المزيد" },
    typeAll: { fr: "Tous les types", en: "All types", es: "Todos los tipos", ar: "جميع الأنواع" },
  },
};

// ========== HELPER: deep merge ==========
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object"
    ) {
      deepMerge(target[key], source[key]);
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  }
  return target;
}

// ========== HELPER: extract locale from multilingual structure ==========
function extractLocale(obj, locale) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Check if it's a locale map (has fr/en/es/ar keys)
      if ("fr" in value && "en" in value) {
        result[key] = value[locale];
      } else {
        result[key] = extractLocale(value, locale);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ========== MAIN ==========
for (const locale of locales) {
  const filePath = resolve(i18nDir, `${locale}.json`);
  const existing = JSON.parse(readFileSync(filePath, "utf-8"));
  const newLocaleKeys = extractLocale(newKeys, locale);
  deepMerge(existing, newLocaleKeys);
  writeFileSync(filePath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
  
  // Count keys
  const countKeys = (obj) => {
    let count = 0;
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object" && !Array.isArray(v)) count += countKeys(v);
      else count++;
    }
    return count;
  };
  console.log(`✅ ${locale}.json: ${countKeys(existing)} keys`);
}

console.log("\n🎉 All locale files updated successfully!");
