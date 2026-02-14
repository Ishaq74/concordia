  // === Project (volunteer) categories ===
  { id: "cat-proj-environnement", parentId: null, slug: "environnement", type: "project", icon: "mdi:leaf", level: 1, sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-social", parentId: null, slug: "social", type: "project", icon: "mdi:account-group", level: 1, sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-education", parentId: null, slug: "education", type: "project", icon: "mdi:school", level: 1, sortOrder: 6, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-ecologie", parentId: null, slug: "ecologie", type: "project", icon: "mdi:recycle", level: 1, sortOrder: 7, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-solidarite", parentId: null, slug: "solidarite", type: "project", icon: "mdi:heart", level: 1, sortOrder: 8, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-culture", parentId: null, slug: "culture-patrimoine", type: "project", icon: "mdi:museum", level: 1, sortOrder: 9, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
// Seed: category — all category types for Annecy platform
export const categoryData = [
  // === Place categories ===
  { id: "cat-place-resto", parentId: null, slug: "restaurants", type: "place", icon: "mdi:silverware-fork-knife", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-hotel", parentId: null, slug: "hotels", type: "place", icon: "mdi:bed", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-camping", parentId: null, slug: "campings", type: "place", icon: "mdi:tent", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-commerce", parentId: null, slug: "commerces", type: "place", icon: "mdi:store", level: 1, sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-activity", parentId: null, slug: "activites", type: "place", icon: "mdi:kayaking", level: 1, sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-poi", parentId: null, slug: "points-interet", type: "place", icon: "mdi:map-marker-star", level: 1, sortOrder: 6, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-admin", parentId: null, slug: "services-publics", type: "place", icon: "mdi:office-building", level: 1, sortOrder: 7, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  // Sub-categories for restaurants
  { id: "cat-place-resto-trad", parentId: "cat-place-resto", slug: "cuisine-traditionnelle", type: "place", icon: "mdi:food-variant", level: 2, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-resto-gastro", parentId: "cat-place-resto", slug: "gastronomique", type: "place", icon: "mdi:star-circle", level: 2, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-place-resto-cafe", parentId: "cat-place-resto", slug: "cafes-salons-the", type: "place", icon: "mdi:coffee", level: 2, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },

  // === Magazine / Article categories ===
  { id: "cat-mag-culture", parentId: null, slug: "culture", type: "magazine", icon: "mdi:palette", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-mag-nature", parentId: null, slug: "nature-environnement", type: "magazine", icon: "mdi:leaf", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-mag-gastro", parentId: null, slug: "gastronomie", type: "magazine", icon: "mdi:chef-hat", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-mag-sport", parentId: null, slug: "sport-plein-air", type: "magazine", icon: "mdi:run", level: 1, sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-mag-patrimoine", parentId: null, slug: "patrimoine-histoire", type: "magazine", icon: "mdi:castle", level: 1, sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-mag-vie-locale", parentId: null, slug: "vie-locale", type: "magazine", icon: "mdi:account-group", level: 1, sortOrder: 6, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },

  // === Forum categories ===
  { id: "cat-forum-general", parentId: null, slug: "discussions-generales", type: "forum", icon: "mdi:forum", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-forum-bonnes-adresses", parentId: null, slug: "bonnes-adresses", type: "forum", icon: "mdi:thumb-up", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-forum-entraide", parentId: null, slug: "entraide", type: "forum", icon: "mdi:handshake", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-forum-sport", parentId: null, slug: "sport-montagne", type: "forum", icon: "mdi:ski", level: 1, sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-forum-parents", parentId: null, slug: "parents-famille", type: "forum", icon: "mdi:human-male-female-child", level: 1, sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },

  // === Classified categories ===
  { id: "cat-class-immo", parentId: null, slug: "immobilier", type: "classified", icon: "mdi:home", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-class-vehicules", parentId: null, slug: "vehicules", type: "classified", icon: "mdi:car", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-class-meubles", parentId: null, slug: "meubles-deco", type: "classified", icon: "mdi:sofa", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-class-sport", parentId: null, slug: "sport-loisirs", type: "classified", icon: "mdi:basketball", level: 1, sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-class-emploi", parentId: null, slug: "emploi", type: "classified", icon: "mdi:briefcase", level: 1, sortOrder: 5, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },

  // === Service categories ===
  { id: "cat-svc-coaching", parentId: null, slug: "coaching-bien-etre", type: "service", icon: "mdi:meditation", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-svc-sport", parentId: null, slug: "sports-activites", type: "service", icon: "mdi:bike", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-svc-artisan", parentId: null, slug: "artisanat", type: "service", icon: "mdi:hammer-wrench", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-svc-cours", parentId: null, slug: "cours-formations", type: "service", icon: "mdi:school", level: 1, sortOrder: 4, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },

  // === Education categories ===
  { id: "cat-edu-environnement", parentId: null, slug: "education-environnement", type: "education", icon: "mdi:nature", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-edu-histoire", parentId: null, slug: "histoire-locale", type: "education", icon: "mdi:book-open-variant", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-edu-numerique", parentId: null, slug: "numerique-citoyennete", type: "education", icon: "mdi:laptop", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },

  // === Project (volunteer) categories ===
  { id: "cat-proj-ecologie", parentId: null, slug: "ecologie", type: "project", icon: "mdi:recycle", level: 1, sortOrder: 1, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-solidarite", parentId: null, slug: "solidarite", type: "project", icon: "mdi:heart", level: 1, sortOrder: 2, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { id: "cat-proj-culture", parentId: null, slug: "culture-patrimoine", type: "project", icon: "mdi:museum", level: 1, sortOrder: 3, isActive: true, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
];
