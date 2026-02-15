// 02 - Blog Organization
export const blogOrganizationsSeed = [
    {
        id: "org-salut-annecy",
        slug: "salut-annecy",
        legalName: {
            fr: "Salut Annecy - Guide Local",
            en: "Salut Annecy - Local Guide",
            de: "Salut Annecy - Lokaler Führer",
            es: "Salut Annecy - Guía Local",
            ar: "سالوت أنسي - دليل محلي",
            zh: "你好安纳西 - 本地指南"
        },
        url: "https://salutannecy.com",
        logo: "/images/logo-salut-annecy.svg",
        description: {
            fr: "Votre guide local pour découvrir Annecy : lieux, événements, randonnées et actualités.",
            en: "Your local guide to discover Annecy: places, events, hikes and news.",
            de: "Ihr lokaler Führer zur Entdeckung von Annecy: Orte, Veranstaltungen, Wanderungen und Nachrichten.",
            es: "Su guía local para descubrir Annecy: lugares, eventos, excursiones y noticias.",
            ar: "دليلك المحلي لاكتشاف أنسي: الأماكن والأحداث والمشي لمسافات طويلة والأخبار.",
            zh: "您发现安纳西的本地指南：地点、活动、徒步旅行和新闻。"
        },
        telephone: "+33450000000",
        email: "contact@salutannecy.com",
        address: {
            streetAddress: "1 Rue de la République",
            addressLocality: "Annecy",
            postalCode: "74000",
            addressCountry: "FR"
        },
        sameAs: [
            "https://facebook.com/salutannecy",
            "https://instagram.com/salutannecy",
            "https://twitter.com/salutannecy"
        ],
        foundingDate: new Date("2025-01-01"),
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-01T00:00:00Z"),
    }
];
