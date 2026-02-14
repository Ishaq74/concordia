// Seed: trail — hiking/biking trails around Annecy
export const trailData = [
  {
    id: "trail-001", createdBy: "u-citizen-001", name: "Tour du Lac d'Annecy à vélo",
    slug: "tour-lac-annecy-velo", description: "La célèbre piste cyclable qui fait le tour complet du lac d'Annecy. Parcours entièrement sécurisé, accessible aux familles. Paysages magnifiques entre lac et montagnes.",
    difficulty: "easy", distanceKm: "42.00", durationMin: 180, ascentM: 150, descentM: 150,
    loop: true, gpxUrl: null, type: "velo", latitude: "45.8640000", longitude: "6.1680000",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "trail-002", createdBy: "u-citizen-004", name: "Sentier du Roc de Chère",
    slug: "sentier-roc-chere", description: "Réserve naturelle du Roc de Chère entre Talloires et Menthon-Saint-Bernard. Forêt, falaises calcaires et points de vue exceptionnels sur le lac. Faune et flore remarquables.",
    difficulty: "moderate", distanceKm: "4.50", durationMin: 120, ascentM: 200, descentM: 200,
    loop: true, gpxUrl: null, type: "balade", latitude: "45.8550000", longitude: "6.1900000",
    createdAt: new Date("2024-03-05"),
  },
  {
    id: "trail-003", createdBy: "u-citizen-004", name: "La Tournette depuis le Col de l'Aulp",
    slug: "la-tournette-col-aulp", description: "Sommet emblématique du lac d'Annecy culminant à 2351m. Panorama à 360° sur le lac, le Mont Blanc et les Alpes. Passage par le Fauteuil (câbles). Réservée aux randonneurs expérimentés.",
    difficulty: "hard", distanceKm: "12.00", durationMin: 420, ascentM: 1100, descentM: 1100,
    loop: true, gpxUrl: null, type: "randonnee", latitude: "45.8300000", longitude: "6.2800000",
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "trail-004", createdBy: "u-citizen-001", name: "Promenade du Pâquier et des Jardins de l'Europe",
    slug: "promenade-paquier-jardins-europe", description: "Balade familiale emblématique d'Annecy. Du Pâquier aux Jardins de l'Europe, en longeant le lac. Pont des Amours, platanes centenaires et vue sur les montagnes.",
    difficulty: "easy", distanceKm: "2.50", durationMin: 45, ascentM: 10, descentM: 10,
    loop: true, gpxUrl: null, type: "balade", latitude: "45.9000000", longitude: "6.1300000",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "trail-005", createdBy: "u-citizen-004", name: "Le Semnoz — Crêt de Chatillon",
    slug: "semnoz-cret-chatillon", description: "Randonnée sur la montagne d'Annecy. Depuis le sommet du Semnoz, vue sur le lac d'Annecy, le Mont Blanc et le Jura. Idéal en été comme en hiver (raquettes/ski de fond).",
    difficulty: "moderate", distanceKm: "8.00", durationMin: 210, ascentM: 450, descentM: 450,
    loop: true, gpxUrl: null, type: "randonnee", latitude: "45.8270000", longitude: "6.1070000",
    createdAt: new Date("2024-04-01"),
  },
  {
    id: "trail-006", createdBy: "u-citizen-002", name: "Les Gorges du Fier",
    slug: "gorges-du-fier", description: "Site naturel classé à 10 min d'Annecy. Passerelle vertigineuse au-dessus de la rivière encaissée dans des gorges profondes. Marmites de géants et jeux de lumière.",
    difficulty: "easy", distanceKm: "1.00", durationMin: 45, ascentM: 30, descentM: 30,
    loop: false, gpxUrl: null, type: "balade", latitude: "45.9400000", longitude: "6.0560000",
    createdAt: new Date("2024-04-10"),
  },
];
