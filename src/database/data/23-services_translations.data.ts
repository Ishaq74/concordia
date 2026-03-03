// 23 - Services Translations — FR + EN pour chaque service actif, FR only pour aide ménagère
export const servicesTranslationsSeed = [
  // ═══ 1. Plomberie FR ═══
  {
    id: "svc-trans-plomberie-fr",
    serviceId: "svc-plomberie-marc",
    inLanguage: "fr",
    title: { fr: "Plomberie & Dépannage Urgent à Annecy" },
    description: {
      fr: `Service de plomberie professionnel à Annecy et alentours. Intervention rapide pour tous vos problèmes : fuites, débouchage, installation sanitaire, chauffe-eau.

**Nos prestations :**
- Dépannage urgent 7j/7
- Installation et remplacement de sanitaires
- Débouchage canalisations
- Réparation fuites et robinetterie
- Pose et entretien chauffe-eau

**Zone d'intervention :** Annecy, Cran-Gevrier, Seynod, Meythet, Annecy-le-Vieux.

Devis gratuit et transparent. Artisan certifié RGE.`,
    },
    shortDescription: { fr: "Plombier professionnel à Annecy. Dépannage urgent, installation, débouchage. Devis gratuit." },
    seoTitle: { fr: "Plombier Annecy - Dépannage Urgent | Concordia Services" },
    seoDescription: { fr: "Plombier professionnel à Annecy. Dépannage urgent 7j/7, installation sanitaire, débouchage. Devis gratuit. Artisan certifié." },
    seoKeywords: { fr: ["plombier annecy", "dépannage plomberie", "fuite eau", "débouchage"] },
    canonicalUrl: { fr: "/fr/services/artisanat-depannage/plomberie-depannage-annecy" },
    createdAt: new Date("2026-01-15T10:00:00Z"),
    updatedAt: new Date("2026-01-15T10:00:00Z"),
  },
  // ═══ 1. Plomberie EN ═══
  {
    id: "svc-trans-plomberie-en",
    serviceId: "svc-plomberie-marc",
    inLanguage: "en",
    title: { en: "Plumbing & Emergency Repair in Annecy" },
    description: {
      en: `Professional plumbing service in Annecy and surroundings. Fast response for all your issues: leaks, unclogging, sanitary installation, water heaters.

**Our services:**
- Emergency repair 7 days a week
- Sanitary installation and replacement
- Drain unclogging
- Leak and faucet repair
- Water heater installation and maintenance

**Service area:** Annecy, Cran-Gevrier, Seynod, Meythet, Annecy-le-Vieux.

Free and transparent quote. RGE certified craftsman.`,
    },
    shortDescription: { en: "Professional plumber in Annecy. Emergency repair, installation, unclogging. Free quote." },
    seoTitle: { en: "Plumber Annecy - Emergency Repair | Concordia Services" },
    seoDescription: { en: "Professional plumber in Annecy. 7/7 emergency repair, sanitary installation, unclogging. Free quote." },
    seoKeywords: { en: ["plumber annecy", "emergency plumbing", "water leak", "unclogging"] },
    canonicalUrl: { en: "/en/services/artisanat-depannage/plomberie-depannage-annecy" },
    createdAt: new Date("2026-01-15T10:00:00Z"),
    updatedAt: new Date("2026-01-15T10:00:00Z"),
  },

  // ═══ 2. Électricité FR ═══
  {
    id: "svc-trans-electricite-fr",
    serviceId: "svc-electricite-julie",
    inLanguage: "fr",
    title: { fr: "Électricien à Annecy — Installation & Réparation" },
    description: {
      fr: `Électricien qualifié pour tous vos travaux électriques à Annecy. Mise aux normes, installation, dépannage.

**Prestations :**
- Mise aux normes tableau électrique
- Installation prises et éclairages
- Dépannage pannes électriques
- Pose de VMC
- Certification Consuel

Intervention sous 48h. Devis gratuit.`,
    },
    shortDescription: { fr: "Électricien qualifié à Annecy. Installation, mise aux normes, dépannage. Devis gratuit." },
    seoTitle: { fr: "Électricien Annecy - Installation & Normes | Concordia Services" },
    seoDescription: { fr: "Électricien qualifié à Annecy. Mise aux normes, installation, dépannage électrique. Devis gratuit sous 48h." },
    seoKeywords: { fr: ["électricien annecy", "installation électrique", "mise aux normes", "dépannage"] },
    canonicalUrl: { fr: "/fr/services/artisanat-depannage/electricite-installation-annecy" },
    createdAt: new Date("2026-01-20T10:00:00Z"),
    updatedAt: new Date("2026-01-20T10:00:00Z"),
  },
  // ═══ 2. Électricité EN ═══
  {
    id: "svc-trans-electricite-en",
    serviceId: "svc-electricite-julie",
    inLanguage: "en",
    title: { en: "Electrician in Annecy — Installation & Repair" },
    description: {
      en: `Qualified electrician for all your electrical work in Annecy. Standards compliance, installation, troubleshooting.

**Services:**
- Electrical panel upgrade
- Outlet and lighting installation
- Electrical fault repair
- VMC installation
- Consuel certification

Intervention within 48h. Free quote.`,
    },
    shortDescription: { en: "Qualified electrician in Annecy. Installation, standards compliance, troubleshooting. Free quote." },
    seoTitle: { en: "Electrician Annecy - Installation & Standards | Concordia Services" },
    seoDescription: { en: "Qualified electrician in Annecy. Standards compliance, installation, electrical troubleshooting. Free quote within 48h." },
    seoKeywords: { en: ["electrician annecy", "electrical installation", "standards compliance"] },
    canonicalUrl: { en: "/en/services/artisanat-depannage/electricite-installation-annecy" },
    createdAt: new Date("2026-01-20T10:00:00Z"),
    updatedAt: new Date("2026-01-20T10:00:00Z"),
  },

  // ═══ 3. Guitare FR ═══
  {
    id: "svc-trans-guitare-fr",
    serviceId: "svc-guitare-camille",
    inLanguage: "fr",
    title: { fr: "Cours de Guitare à Annecy — Tous Niveaux" },
    description: {
      fr: `Cours de guitare acoustique et électrique pour débutants et intermédiaires. Méthode personnalisée, ambiance décontractée.

**Ce que je propose :**
- Cours individuel ou petit groupe (max 3)
- Guitare acoustique, classique ou électrique
- Théorie musicale et lecture de tablatures
- Répertoire varié : pop, rock, folk, classique
- Préparation auditions / examens

Studio équipé dans le centre d'Annecy. Possibilité de prêt de guitare.`,
    },
    shortDescription: { fr: "Cours de guitare tous niveaux à Annecy. Acoustique et électrique. Petits groupes ou individuel." },
    seoTitle: { fr: "Cours de Guitare Annecy - Tous Niveaux | Concordia Services" },
    seoDescription: { fr: "Cours de guitare à Annecy : acoustique, électrique, tous niveaux. Cours individuels ou petits groupes. Professeur expérimenté." },
    seoKeywords: { fr: ["cours guitare annecy", "professeur guitare", "apprendre guitare"] },
    canonicalUrl: { fr: "/fr/services/cours-formations/cours-guitare-annecy" },
    createdAt: new Date("2026-01-25T10:00:00Z"),
    updatedAt: new Date("2026-01-25T10:00:00Z"),
  },
  // ═══ 3. Guitare EN ═══
  {
    id: "svc-trans-guitare-en",
    serviceId: "svc-guitare-camille",
    inLanguage: "en",
    title: { en: "Guitar Lessons in Annecy — All Levels" },
    description: {
      en: `Acoustic and electric guitar lessons for beginners and intermediate players. Personalized method, relaxed atmosphere.

**What I offer:**
- Individual or small group lessons (max 3)
- Acoustic, classical or electric guitar
- Music theory and tablature reading
- Varied repertoire: pop, rock, folk, classical
- Audition / exam preparation

Equipped studio in downtown Annecy. Guitar loan available.`,
    },
    shortDescription: { en: "Guitar lessons for all levels in Annecy. Acoustic and electric. Small groups or individual." },
    seoTitle: { en: "Guitar Lessons Annecy - All Levels | Concordia Services" },
    seoDescription: { en: "Guitar lessons in Annecy: acoustic, electric, all levels. Individual or small group lessons. Experienced teacher." },
    seoKeywords: { en: ["guitar lessons annecy", "guitar teacher", "learn guitar"] },
    canonicalUrl: { en: "/en/services/cours-formations/cours-guitare-annecy" },
    createdAt: new Date("2026-01-25T10:00:00Z"),
    updatedAt: new Date("2026-01-25T10:00:00Z"),
  },

  // ═══ 4. Yoga FR ═══
  {
    id: "svc-trans-yoga-fr",
    serviceId: "svc-yoga-lucas",
    inLanguage: "fr",
    title: { fr: "Yoga en Plein Air au Lac d'Annecy" },
    description: {
      fr: `Séances de yoga Vinyasa et Hatha face au lac d'Annecy. Groupe de 20 personnes maximum pour une expérience zen et conviviale.

**Détails :**
- Séance de 1h15 (échauffement + postures + relaxation)
- Tapis fourni ou apportez le vôtre
- Tous niveaux acceptés
- Localisation : Pâquier ou Jardins de l'Europe
- En cas de pluie : salle de repli au centre-ville

Inscrivez-vous et reconnectez-vous avec la nature !`,
    },
    shortDescription: { fr: "Yoga Vinyasa et Hatha face au lac d'Annecy. Groupe de 20 max. Tous niveaux." },
    seoTitle: { fr: "Yoga Plein Air Annecy - Lac | Concordia Services" },
    seoDescription: { fr: "Yoga en plein air face au lac d'Annecy. Vinyasa et Hatha, tous niveaux, groupe de 20 max. Inscrivez-vous !" },
    seoKeywords: { fr: ["yoga annecy", "yoga plein air", "yoga lac", "vinyasa annecy"] },
    canonicalUrl: { fr: "/fr/services/bien-etre-sport/yoga-lac-annecy" },
    createdAt: new Date("2026-02-01T10:00:00Z"),
    updatedAt: new Date("2026-02-01T10:00:00Z"),
  },
  // ═══ 4. Yoga EN ═══
  {
    id: "svc-trans-yoga-en",
    serviceId: "svc-yoga-lucas",
    inLanguage: "en",
    title: { en: "Outdoor Yoga by Lake Annecy" },
    description: {
      en: `Vinyasa and Hatha yoga sessions facing Lake Annecy. Maximum 20 people per group for a zen and friendly experience.

**Details:**
- 1h15 session (warm-up + postures + relaxation)
- Mat provided or bring your own
- All levels welcome
- Location: Pâquier or Jardins de l'Europe
- Rainy backup: downtown studio

Sign up and reconnect with nature!`,
    },
    shortDescription: { en: "Vinyasa and Hatha yoga facing Lake Annecy. Group of 20 max. All levels." },
    seoTitle: { en: "Outdoor Yoga Annecy - Lake | Concordia Services" },
    seoDescription: { en: "Outdoor yoga by Lake Annecy. Vinyasa and Hatha, all levels, group of 20 max. Sign up!" },
    seoKeywords: { en: ["yoga annecy", "outdoor yoga", "lake yoga", "vinyasa annecy"] },
    canonicalUrl: { en: "/en/services/bien-etre-sport/yoga-lac-annecy" },
    createdAt: new Date("2026-02-01T10:00:00Z"),
    updatedAt: new Date("2026-02-01T10:00:00Z"),
  },

  // ═══ 5. Photo FR ═══
  {
    id: "svc-trans-photo-fr",
    serviceId: "svc-photo-camille",
    inLanguage: "fr",
    title: { fr: "Photographe Professionnel à Annecy" },
    description: {
      fr: `Séances photo pour portraits, couples, familles et événements dans les plus beaux décors d'Annecy.

**Formule :**
- Séance de 2h avec repérage en amont
- Minimum 50 photos retouchées livrées sous 7 jours
- Galerie privée en ligne pour le téléchargement
- Se déplace dans tout le bassin annécien

Capturez vos plus beaux souvenirs avec un regard artistique.`,
    },
    shortDescription: { fr: "Photographe pro à Annecy. Portraits, couples, familles et événements. 50+ photos retouchées." },
    seoTitle: { fr: "Photographe Annecy - Portraits & Événements | Concordia Services" },
    seoDescription: { fr: "Photographe professionnel à Annecy. Portraits, couples, familles. Séance de 2h, 50+ photos retouchées livrées sous 7 jours." },
    seoKeywords: { fr: ["photographe annecy", "shooting photo", "portrait annecy", "photographe mariage"] },
    canonicalUrl: { fr: "/fr/services/photo-video/photographe-annecy" },
    createdAt: new Date("2026-02-05T10:00:00Z"),
    updatedAt: new Date("2026-02-05T10:00:00Z"),
  },
  // ═══ 5. Photo EN ═══
  {
    id: "svc-trans-photo-en",
    serviceId: "svc-photo-camille",
    inLanguage: "en",
    title: { en: "Professional Photographer in Annecy" },
    description: {
      en: `Photo sessions for portraits, couples, families and events in the most beautiful settings of Annecy.

**Package:**
- 2-hour session with advance scouting
- Minimum 50 retouched photos delivered within 7 days
- Private online gallery for download
- Travels throughout the Annecy basin

Capture your most beautiful memories with an artistic eye.`,
    },
    shortDescription: { en: "Professional photographer in Annecy. Portraits, couples, families and events. 50+ retouched photos." },
    seoTitle: { en: "Photographer Annecy - Portraits & Events | Concordia Services" },
    seoDescription: { en: "Professional photographer in Annecy. Portraits, couples, families. 2h session, 50+ retouched photos delivered within 7 days." },
    seoKeywords: { en: ["photographer annecy", "photo shoot", "portrait annecy", "wedding photographer"] },
    canonicalUrl: { en: "/en/services/photo-video/photographe-annecy" },
    createdAt: new Date("2026-02-05T10:00:00Z"),
    updatedAt: new Date("2026-02-05T10:00:00Z"),
  },

  // ═══ 6. Coaching FR ═══
  {
    id: "svc-trans-coaching-fr",
    serviceId: "svc-coaching-lucas",
    inLanguage: "fr",
    title: { fr: "Coaching Sportif Personnalisé à Annecy" },
    description: {
      fr: `Coach sportif diplômé pour des séances de remise en forme individuelles en extérieur ou à domicile.

**Programme :**
- Bilan initial et objectifs personnalisés
- Séances de 1h : cardio, renforcement, stretching
- Suivi nutritionnel basique inclus
- Matériel fourni (bandes, tapis, haltères)

Se déplace dans tout Annecy et environs. Première séance d'essai à -50%.`,
    },
    shortDescription: { fr: "Coach sportif diplômé à Annecy. Séances individuelles, remise en forme, se déplace à domicile." },
    seoTitle: { fr: "Coach Sportif Annecy - Personnalisé | Concordia Services" },
    seoDescription: { fr: "Coach sportif diplômé à Annecy. Remise en forme personnalisée, à domicile ou en extérieur. Première séance -50%." },
    seoKeywords: { fr: ["coach sportif annecy", "coaching personnalisé", "remise en forme", "sport domicile"] },
    canonicalUrl: { fr: "/fr/services/bien-etre-sport/coaching-sportif-annecy" },
    createdAt: new Date("2026-02-10T10:00:00Z"),
    updatedAt: new Date("2026-02-10T10:00:00Z"),
  },
  // ═══ 6. Coaching EN ═══
  {
    id: "svc-trans-coaching-en",
    serviceId: "svc-coaching-lucas",
    inLanguage: "en",
    title: { en: "Personalized Sports Coaching in Annecy" },
    description: {
      en: `Certified sports coach for individual fitness sessions outdoors or at your home.

**Program:**
- Initial assessment and personalized goals
- 1h sessions: cardio, strength, stretching
- Basic nutritional guidance included
- Equipment provided (bands, mat, dumbbells)

Travels throughout Annecy and surroundings. First trial session at -50%.`,
    },
    shortDescription: { en: "Certified sports coach in Annecy. Individual sessions, fitness, home service." },
    seoTitle: { en: "Sports Coach Annecy - Personalized | Concordia Services" },
    seoDescription: { en: "Certified sports coach in Annecy. Personalized fitness, at home or outdoors. First session -50%." },
    seoKeywords: { en: ["sports coach annecy", "personal training", "fitness", "home training"] },
    canonicalUrl: { en: "/en/services/bien-etre-sport/coaching-sportif-annecy" },
    createdAt: new Date("2026-02-10T10:00:00Z"),
    updatedAt: new Date("2026-02-10T10:00:00Z"),
  },

  // ═══ 7. Aide ménagère FR ONLY ═══
  {
    id: "svc-trans-menage-fr",
    serviceId: "svc-menage-sarah",
    inLanguage: "fr",
    title: { fr: "Aide Ménagère Bénévole à Annecy" },
    description: {
      fr: `Service gratuit d'aide ménagère pour les personnes âgées ou en difficulté. Initiative solidaire portée par des bénévoles d'Annecy.

**Ce qu'on propose :**
- Nettoyage des pièces principales
- Repassage du linge
- Courses de première nécessité
- Compagnie et écoute

Nous intervenons sur Annecy et première couronne. Contactez-nous pour planifier une visite.`,
    },
    shortDescription: { fr: "Aide ménagère gratuite pour personnes âgées ou en difficulté. Service bénévole à Annecy." },
    seoTitle: { fr: "Aide Ménagère Bénévole Annecy | Concordia Services" },
    seoDescription: { fr: "Service gratuit d'aide ménagère à Annecy pour personnes âgées ou en difficulté. Initiative solidaire bénévole." },
    seoKeywords: { fr: ["aide ménagère annecy", "bénévole", "aide personne âgée", "service gratuit"] },
    canonicalUrl: { fr: "/fr/services/aide-a-domicile/aide-menagere-annecy" },
    createdAt: new Date("2026-02-15T10:00:00Z"),
    updatedAt: new Date("2026-02-15T10:00:00Z"),
  },

  // ═══ 8. Jardinage FR ONLY (pending_review → pas de EN) ═══
  {
    id: "svc-trans-jardinage-fr",
    serviceId: "svc-jardinage-lucas",
    inLanguage: "fr",
    title: { fr: "Jardinage & Entretien Espaces Verts à Annecy" },
    description: {
      fr: `Service de jardinage et entretien d'espaces verts. Tonte, taille de haies, débroussaillage, plantation.

**Prestations :**
- Tonte pelouse
- Taille de haies et arbustes
- Débroussaillage
- Plantation et aménagement
- Évacuation des déchets verts

Prix à négocier selon la surface et les besoins. Devis gratuit sur place.`,
    },
    shortDescription: { fr: "Jardinage et entretien espaces verts à Annecy. Tonte, haies, plantation. Devis gratuit." },
    seoTitle: { fr: "Jardinage Annecy - Entretien Espaces Verts | Concordia Services" },
    seoDescription: { fr: "Jardinier à Annecy : tonte, taille de haies, débroussaillage, plantation. Devis gratuit sur place." },
    seoKeywords: { fr: ["jardinage annecy", "entretien jardin", "tonte pelouse", "espaces verts"] },
    canonicalUrl: { fr: "/fr/services/jardinage-espaces-verts/jardinage-entretien-annecy" },
    createdAt: new Date("2026-02-20T10:00:00Z"),
    updatedAt: new Date("2026-02-20T10:00:00Z"),
  },
];
