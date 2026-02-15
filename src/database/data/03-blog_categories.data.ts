// 05 - Blog Categories (9 catégories réalistes pour Annecy)
export const blogCategoriesSeed = [
    {
        id: "cat-interviews",
        slug: "interviews",
        name: {
            fr: "Interviews",
            en: "Interviews",
            de: "Interviews",
            es: "Entrevistas",
            ar: "مقابلات",
            zh: "访谈"
        },
        description: {
            fr: "Rencontres avec les acteurs qui font vivre Annecy : commerçants, artistes, sportifs, associations...",
            en: "Meet the people who make Annecy come alive: shopkeepers, artists, athletes, associations...",
            de: "Treffen Sie die Menschen, die Annecy lebendig machen: Händler, Künstler, Sportler, Vereine...",
            es: "Conoce a las personas que hacen vivir Annecy: comerciantes, artistas, deportistas, asociaciones...",
            ar: "تعرف على الأشخاص الذين يجعلون أنسي حية: التجار والفنانين والرياضيين والجمعيات...",
            zh: "认识让安纳西充满活力的人们：商家、艺术家、运动员、协会..."
        },
        featuredImageId: "media-cover-interview-chef",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Interviews - Portraits d'Annecy | Salut Annecy",
            en: "Interviews - Annecy Portraits | Salut Annecy"
        },
        seoDescription: {
            fr: "Découvrez les visages derrière Annecy à travers nos interviews exclusives de commerçants, artistes et acteurs locaux."
        },
        seoKeywords: { fr: ["annecy", "interviews", "portraits", "rencontres", "acteurs locaux"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/interviews" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-experiences",
        slug: "experiences",
        name: {
            fr: "Expériences",
            en: "Experiences",
            de: "Erlebnisse",
            es: "Experiencias",
            ar: "تجارب",
            zh: "体验"
        },
        description: {
            fr: "Nos tests et découvertes : restaurants, activités, lieux insolites, balades... Tout ce qu'on a testé pour vous !",
            en: "Our tests and discoveries: restaurants, activities, unusual places, walks... Everything we tested for you!",
            de: "Unsere Tests und Entdeckungen: Restaurants, Aktivitäten, ungewöhnliche Orte, Spaziergänge... Alles, was wir für Sie getestet haben!",
            es: "Nuestras pruebas y descubrimientos: restaurantes, actividades, lugares insólitos, paseos... ¡Todo lo que probamos para ti!",
            ar: "اختباراتنا واكتشافاتنا: المطاعم والأنشطة والأماكن غير العادية والنزهات... كل ما اختبرناه لك!",
            zh: "我们的测试和发现：餐厅、活动、不寻常的地方、散步...我们为您测试的一切！"
        },
        featuredImageId: "media-cover-plage",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Expériences - Que faire à Annecy ? Nos tests | Salut Annecy",
            en: "Experiences - What to do in Annecy? Our tests | Salut Annecy"
        },
        seoDescription: {
            fr: "Nos meilleures expériences et bons plans testés pour vous : restaurants, activités, lieux insolites à Annecy."
        },
        seoKeywords: { fr: ["annecy", "expériences", "activités", "tests", "que faire"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/experiences" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-enquetes",
        slug: "enquetes",
        name: {
            fr: "Enquêtes",
            en: "Investigations",
            de: "Ermittlungen",
            es: "Investigaciones",
            ar: "تحقيقات",
            zh: "调查"
        },
        description: {
            fr: "Analyses approfondies sur les sujets qui impactent Annecy : urbanisme, environnement, société, économie...",
            en: "In-depth analyses on topics impacting Annecy: urbanism, environment, society, economy...",
            de: "Tiefgehende Analysen zu Themen, die Annecy betreffen: Städtebau, Umwelt, Gesellschaft, Wirtschaft...",
            es: "Análisis en profundidad sobre temas que impactan Annecy: urbanismo, medio ambiente, sociedad, economía...",
            ar: "تحليلات متعمقة حول المواضيع التي تؤثر على أنسي: التخطيط الحضري والبيئة والمجتمع والاقتصاد...",
            zh: "深入分析影响安纳西的主题：城市规划、环境、社会、经济..."
        },
        featuredImageId: "media-cover-immobilier",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Enquêtes - L'actualité d'Annecy décryptée | Salut Annecy",
            en: "Investigations - Annecy News Decoded | Salut Annecy"
        },
        seoDescription: {
            fr: "Nos enquêtes pour mieux comprendre Annecy et ses enjeux : logement, urbanisme, environnement, société."
        },
        seoKeywords: { fr: ["annecy", "enquêtes", "analyses", "actualités", "urbanisme"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/enquetes" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-evenements",
        slug: "evenements",
        name: {
            fr: "Événements",
            en: "Events",
            de: "Veranstaltungen",
            es: "Eventos",
            ar: "أحداث",
            zh: "活动"
        },
        description: {
            fr: "Agenda culturel, sportif et festif : ne ratez rien de ce qui se passe à Annecy et ses environs !",
            en: "Cultural, sports and festive agenda: don't miss anything happening in Annecy and surroundings!",
            de: "Kultur-, Sport- und Festkalender: Verpassen Sie nichts, was in Annecy und Umgebung passiert!",
            es: "Agenda cultural, deportiva y festiva: ¡no te pierdas nada de lo que pasa en Annecy y alrededores!",
            ar: "الأجندة الثقافية والرياضية والاحتفالية: لا تفوت أي شيء يحدث في أنسي والمناطق المحيطة!",
            zh: "文化、体育和节日日程：不要错过安纳西及周边发生的任何事情！"
        },
        featuredImageId: "media-cover-fete-lac",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Événements - Agenda Annecy 2026 | Salut Annecy",
            en: "Events - Annecy Agenda 2026 | Salut Annecy"
        },
        seoDescription: {
            fr: "Tous les événements à ne pas manquer à Annecy : festivals, concerts, marchés, événements sportifs et culturels."
        },
        seoKeywords: { fr: ["annecy", "événements", "agenda", "sorties", "festivals"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/evenements" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-guides",
        slug: "guides-pratiques",
        name: {
            fr: "Guides pratiques",
            en: "Practical Guides",
            de: "Praktische Ratgeber",
            es: "Guías prácticas",
            ar: "أدلة عملية",
            zh: "实用指南"
        },
        description: {
            fr: "Conseils et astuces pour profiter au mieux d'Annecy : démarches, bons plans, infos utiles, vivre à Annecy...",
            en: "Tips and tricks to make the most of Annecy: procedures, good deals, useful info, living in Annecy...",
            de: "Tipps und Tricks, um Annecy optimal zu nutzen: Verfahren, gute Angebote, nützliche Infos, Leben in Annecy...",
            es: "Consejos y trucos para aprovechar al máximo Annecy: trámites, buenos planes, información útil, vivir en Annecy...",
            ar: "نصائح وحيل للاستفادة القصوى من أنسي: الإجراءات والصفقات الجيدة والمعلومات المفيدة والعيش في أنسي...",
            zh: "充分利用安纳西的技巧和窍门：程序、优惠、有用信息、在安纳西生活..."
        },
        featuredImageId: "media-cover-transports",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Guides pratiques - Vivre à Annecy | Salut Annecy",
            en: "Practical Guides - Living in Annecy | Salut Annecy"
        },
        seoDescription: {
            fr: "Tous nos guides pour faciliter votre vie à Annecy : transports, logement, démarches administratives, bons plans."
        },
        seoKeywords: { fr: ["annecy", "guides", "pratique", "conseils", "vivre"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/guides-pratiques" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-patrimoine",
        slug: "histoire-patrimoine",
        name: {
            fr: "Histoire & Patrimoine",
            en: "History & Heritage",
            de: "Geschichte & Erbe",
            es: "Historia y Patrimonio",
            ar: "التاريخ والتراث",
            zh: "历史与遗产"
        },
        description: {
            fr: "Plongez dans l'histoire d'Annecy, ses monuments, ses traditions et son patrimoine culturel exceptionnel.",
            en: "Dive into the history of Annecy, its monuments, traditions and exceptional cultural heritage.",
            de: "Tauchen Sie ein in die Geschichte von Annecy, seine Denkmäler, Traditionen und außergewöhnliches kulturelles Erbe.",
            es: "Sumérgete en la historia de Annecy, sus monumentos, tradiciones y patrimonio cultural excepcional.",
            ar: "انغمس في تاريخ أنسي ومعالمها وتقاليدها وتراثها الثقافي الاستثنائي.",
            zh: "深入了解安纳西的历史、古迹、传统和卓越的文化遗产。"
        },
        featuredImageId: "media-cover-palais-isle",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Histoire & Patrimoine - Annecy d'hier à aujourd'hui | Salut Annecy",
            en: "History & Heritage - Annecy Then and Now | Salut Annecy"
        },
        seoDescription: {
            fr: "Découvrez le riche patrimoine historique et culturel d'Annecy : monuments, traditions, personnages qui ont marqué l'histoire."
        },
        seoKeywords: { fr: ["annecy", "histoire", "patrimoine", "culture", "monuments"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/histoire-patrimoine" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-gastronomie",
        slug: "gastronomie",
        name: {
            fr: "Gastronomie",
            en: "Gastronomy",
            de: "Gastronomie",
            es: "Gastronomía",
            ar: "فن الطهي",
            zh: "美食"
        },
        description: {
            fr: "Les meilleures adresses, recettes savoyardes authentiques, portraits de chefs et producteurs locaux.",
            en: "The best addresses, authentic Savoyard recipes, portraits of chefs and local producers.",
            de: "Die besten Adressen, authentische savoyische Rezepte, Porträts von Köchen und lokalen Produzenten.",
            es: "Las mejores direcciones, recetas saboyanas auténticas, retratos de chefs y productores locales.",
            ar: "أفضل العناوين والوصفات السافوية الأصيلة وصور الطهاة والمنتجين المحليين.",
            zh: "最佳地址、正宗萨瓦食谱、厨师和当地生产商的肖像。"
        },
        featuredImageId: "media-cover-tartiflette",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Gastronomie - Saveurs d'Annecy et de Savoie | Salut Annecy",
            en: "Gastronomy - Flavors of Annecy and Savoy | Salut Annecy"
        },
        seoDescription: {
            fr: "Explorez la richesse gastronomique d'Annecy : restaurants, recettes traditionnelles, chefs, producteurs locaux."
        },
        seoKeywords: { fr: ["annecy", "gastronomie", "restaurants", "terroir", "recettes savoyardes"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/gastronomie" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-nature-sports",
        slug: "nature-sports",
        name: {
            fr: "Nature & Sports",
            en: "Nature & Sports",
            de: "Natur & Sport",
            es: "Naturaleza y Deportes",
            ar: "الطبيعة والرياضة",
            zh: "自然与运动"
        },
        description: {
            fr: "Randonnées, sports nautiques, cyclisme, escalade... Annecy terrain de jeu grandeur nature pour tous les sportifs !",
            en: "Hiking, water sports, cycling, climbing... Annecy, a life-size playground for all athletes!",
            de: "Wandern, Wassersport, Radfahren, Klettern... Annecy, ein lebensgroßer Spielplatz für alle Sportler!",
            es: "Senderismo, deportes acuáticos, ciclismo, escalada... ¡Annecy, un campo de juego a tamaño real para todos los deportistas!",
            ar: "المشي لمسافات طويلة والرياضات المائية وركوب الدراجات والتسلق... أنسي، ملعب بحجم طبيعي لجميع الرياضيين!",
            zh: "徒步旅行、水上运动、骑自行车、攀岩...安纳西，为所有运动员提供的真人大小游乐场！"
        },
        featuredImageId: "media-cover-velo",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Nature & Sports - Annecy Outdoor | Salut Annecy",
            en: "Nature & Sports - Annecy Outdoor | Salut Annecy"
        },
        seoDescription: {
            fr: "Toutes les idées pour profiter du cadre exceptionnel d'Annecy : randonnées, vélo, sports nautiques, escalade."
        },
        seoKeywords: { fr: ["annecy", "nature", "sports", "outdoor", "randonnée", "vélo"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/nature-sports" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    },
    {
        id: "cat-vie-pratique",
        slug: "vie-pratique",
        name: {
            fr: "Vie pratique",
            en: "Practical Life",
            de: "Praktisches Leben",
            es: "Vida práctica",
            ar: "الحياة العملية",
            zh: "实用生活"
        },
        description: {
            fr: "Logement, transports, éducation, santé, services... Tout pour faciliter votre quotidien à Annecy.",
            en: "Housing, transport, education, health, services... Everything to make your daily life in Annecy easier.",
            de: "Wohnen, Transport, Bildung, Gesundheit, Dienstleistungen... Alles, um Ihren Alltag in Annecy zu erleichtern.",
            es: "Vivienda, transporte, educación, salud, servicios... Todo para facilitar tu vida diaria en Annecy.",
            ar: "السكن والنقل والتعليم والصحة والخدمات... كل ما يسهل حياتك اليومية في أنسي.",
            zh: "住房、交通、教育、健康、服务...让您在安纳西的日常生活更轻松的一切。"
        },
        featuredImageId: "media-cover-ecole",
        displayInHome: true,
        displayInMenu: true,
        displayInBlog: true,
        isFeatured: true,
        parentId: null,
        seoTitle: {
            fr: "Vie pratique - S'installer et vivre à Annecy | Salut Annecy",
            en: "Practical Life - Settling and Living in Annecy | Salut Annecy"
        },
        seoDescription: {
            fr: "Toutes les infos pratiques pour bien vivre à Annecy : logement, transports, écoles, santé, démarches administratives."
        },
        seoKeywords: { fr: ["annecy", "vie pratique", "logement", "transports", "écoles", "santé"] },
        canonicalUrl: { fr: "https://salutannecy.com/blog/vie-pratique" },
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    }
];
