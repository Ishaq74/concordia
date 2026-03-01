// 06 - Blog Organizations (Schema.org Organization — complet)
export const blogOrganizationsSeed = [
    {
        id: "org-salut-annecy",
        name: "Salut Annecy",
        slug: "salut-annecy",
        alternateName: ["Salut Annecy - Guide Local", "SA"],
        description: {
            fr: "Votre guide local pour découvrir Annecy : lieux, événements, randonnées et actualités. Depuis 2025, nous partageons le meilleur de la Venise des Alpes avec une rédaction indépendante et passionnée.",
            en: "Your local guide to discover Annecy: places, events, hikes and news. Since 2025, we share the best of the Venice of the Alps with an independent, passionate editorial team.",
            es: "Su guía local para descubrir Annecy: lugares, eventos, excursiones y noticias. Desde 2025, compartimos lo mejor de la Venecia de los Alpes con una redacción independiente y apasionada.",
            ar: "دليلك المحلي لاكتشاف أنسي: الأماكن والأحداث والمشي لمسافات طويلة والأخبار. منذ 2025، نشارك أفضل ما في فينيسيا جبال الألب بفريق تحريري مستقل وشغوف."
        },
        url: "https://salutannecy.com",
        logo: "/images/logo-salut-annecy.svg",
        image: "/images/salut-annecy-og.jpg",
        slogan: {
            fr: "Le meilleur d'Annecy, par ceux qui y vivent",
            en: "The best of Annecy, by those who live there",
            es: "Lo mejor de Annecy, por quienes viven allí",
            ar: "أفضل ما في أنسي، من سكانها"
        },
        email: "contact@salutannecy.com",
        telephone: "+33450000000",
        address: {
            streetAddress: "1 Rue de la République",
            addressLocality: "Annecy",
            addressRegion: "Auvergne-Rhône-Alpes",
            postalCode: "74000",
            addressCountry: "FR"
        },
        contactPoint: [
            {
                contactType: "Rédaction",
                email: "redaction@salutannecy.com",
                hoursAvailable: "Lu-Ve 9h-18h"
            },
            {
                contactType: "Publicité & Partenariats",
                email: "partenariats@salutannecy.com",
                telephone: "+33450000001"
            }
        ],
        legalName: {
            fr: "Salut Annecy SAS",
            en: "Salut Annecy SAS"
        },
        taxID: "FR12345678901",
        vatID: "FR12345678901",
        nonprofitStatus: null,
        founder: ["Marc Durand"],
        foundingDate: new Date("2025-01-01"),
        foundingLocation: "Annecy, France",
        numberOfEmployees: 8,
        employee: ["Camille Dupont", "Lucas Martin", "Sarah Leroy", "Marc Durand"],
        alumni: [],
        parentOrganization: null,
        subOrganization: [],
        department: ["Rédaction", "Technique", "Commercial"],
        owns: [],
        brand: ["Salut Annecy"],
        makesOffer: ["Guides locaux", "Annuaire des services", "Blog communautaire"],
        seeks: ["Partenariats locaux", "Contributeurs bénévoles"],
        hasOfferCatalog: [],
        areaServed: ["Annecy", "Grand Annecy", "Haute-Savoie"],
        serviceArea: ["Annecy", "Grand Annecy"],
        award: [],
        hasCredential: [],
        knowsLanguage: ["fr", "en", "es", "ar"],
        knowsAbout: ["Tourisme", "Gastronomie", "Sports outdoor", "Culture alpine", "Urbanisme"],
        keywords: "annecy, guide local, blog, tourisme, gastronomie, randonnée, lac d'annecy",
        memberOf: [],
        sameAs: [
            "https://facebook.com/salutannecy",
            "https://instagram.com/salutannecy",
            "https://twitter.com/salutannecy",
            "https://linkedin.com/company/salutannecy",
            "https://youtube.com/@salutannecy"
        ],
        publishingPrinciples: "https://salutannecy.com/charte-editoriale",
        ethicsPolicy: "https://salutannecy.com/ethique",
        correctionsPolicy: "https://salutannecy.com/corrections",
        diversityPolicy: "https://salutannecy.com/diversite",
        ownershipFundingInfo: "https://salutannecy.com/financement",
        aggregateRating: {
            ratingValue: 4.7,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 342
        },
        interactionStatistic: [
            { interactionType: "CommentAction", userInteractionCount: 1580 },
            { interactionType: "ShareAction", userInteractionCount: 4200 },
            { interactionType: "LikeAction", userInteractionCount: 8900 }
        ],
        isActive: true,
        isFeatured: true,
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2026-02-15T10:00:00Z"),
    },
    {
        id: "org-annecy-outdoor",
        name: "Annecy Outdoor",
        slug: "annecy-outdoor",
        alternateName: ["Annecy Outdoor Adventures", "AOA"],
        description: {
            fr: "Le collectif des passionnés d'activités outdoor autour du lac d'Annecy. Randonnée, parapente, VTT, escalade — on partage nos spots et nos conseils.",
            en: "The outdoor enthusiasts collective around Lake Annecy. Hiking, paragliding, mountain biking, climbing — we share our spots and tips.",
            es: "El colectivo de entusiastas del aire libre alrededor del lago de Annecy. Senderismo, parapente, ciclismo de montaña, escalada.",
            ar: "مجموعة عشاق الأنشطة الخارجية حول بحيرة أنسي. المشي لمسافات طويلة، الطيران الشراعي، ركوب الدراجات الجبلية، التسلق."
        },
        url: "https://annecy-outdoor.fr",
        logo: "/images/logo-annecy-outdoor.svg",
        image: "/images/annecy-outdoor-og.jpg",
        slogan: {
            fr: "La montagne se vit dehors",
            en: "The mountain is lived outside"
        },
        email: "hello@annecy-outdoor.fr",
        telephone: "+33450100200",
        address: {
            streetAddress: "15 Quai des Clarisses",
            addressLocality: "Annecy",
            addressRegion: "Auvergne-Rhône-Alpes",
            postalCode: "74000",
            addressCountry: "FR"
        },
        contactPoint: [
            {
                contactType: "Information",
                email: "info@annecy-outdoor.fr",
                hoursAvailable: "Lu-Sa 8h-19h"
            }
        ],
        legalName: {
            fr: "Annecy Outdoor Association",
            en: "Annecy Outdoor Association"
        },
        nonprofitStatus: "Association loi 1901",
        founder: ["Lucas Martin", "Julien Perret"],
        foundingDate: new Date("2023-06-15"),
        foundingLocation: "Annecy, France",
        numberOfEmployees: 3,
        employee: ["Lucas Martin", "Julien Perret", "Marie Fontaine"],
        areaServed: ["Annecy", "Massif des Bornes", "Massif des Bauges", "Aravis"],
        knowsLanguage: ["fr", "en"],
        knowsAbout: ["Randonnée", "Parapente", "VTT", "Escalade", "Trail running", "Ski de randonnée"],
        keywords: "outdoor, annecy, randonnée, parapente, vtt, escalade, lac annecy",
        sameAs: [
            "https://instagram.com/annecyoutdoor",
            "https://facebook.com/annecyoutdoor",
            "https://strava.com/clubs/annecyoutdoor"
        ],
        aggregateRating: {
            ratingValue: 4.9,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 127
        },
        isActive: true,
        isFeatured: true,
        createdAt: new Date("2023-06-15T00:00:00Z"),
        updatedAt: new Date("2026-01-20T08:00:00Z"),
    },
    {
        id: "org-saveurs-de-savoie",
        name: "Saveurs de Savoie",
        slug: "saveurs-de-savoie",
        alternateName: ["Saveurs de Savoie — Le goût de l'authentique"],
        description: {
            fr: "Réseau des producteurs locaux et restaurateurs engagés en Haute-Savoie. Nous valorisons les circuits courts, la gastronomie savoyarde et l'artisanat alimentaire du terroir.",
            en: "Network of local producers and committed restaurateurs in Haute-Savoie. We promote short supply chains, Savoyard gastronomy and local food craftsmanship.",
            es: "Red de productores locales y restauradores comprometidos en Alta Saboya.",
            ar: "شبكة المنتجين المحليين والمطاعم الملتزمة في سافوا العليا."
        },
        url: "https://saveursdesavoie.fr",
        logo: "/images/logo-saveurs-savoie.svg",
        slogan: {
            fr: "Le goût de l'authentique",
            en: "The taste of authenticity"
        },
        email: "contact@saveursdesavoie.fr",
        telephone: "+33450300400",
        address: {
            streetAddress: "8 Place Sainte-Claire",
            addressLocality: "Annecy",
            postalCode: "74000",
            addressCountry: "FR"
        },
        legalName: {
            fr: "Saveurs de Savoie SARL",
            en: "Saveurs de Savoie SARL"
        },
        founder: ["Hélène Moreau"],
        foundingDate: new Date("2021-03-01"),
        foundingLocation: "Annecy, France",
        numberOfEmployees: 5,
        areaServed: ["Haute-Savoie", "Savoie", "Annecy"],
        knowsLanguage: ["fr"],
        knowsAbout: ["Gastronomie savoyarde", "Fromages AOP", "Circuits courts", "Vins de Savoie"],
        keywords: "gastronomie, savoie, producteurs locaux, fromage, restaurant, terroir",
        sameAs: [
            "https://instagram.com/saveursdesavoie",
            "https://facebook.com/saveursdesavoie"
        ],
        aggregateRating: {
            ratingValue: 4.5,
            bestRating: 5,
            worstRating: 1,
            ratingCount: 89
        },
        isActive: true,
        isFeatured: false,
        createdAt: new Date("2021-03-01T00:00:00Z"),
        updatedAt: new Date("2026-02-01T12:00:00Z"),
    }
];
