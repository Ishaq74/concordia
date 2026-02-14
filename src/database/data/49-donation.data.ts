// Seed: donation — dons aux campagnes de financement
export const donationData = [
  // fund-001: Matériel nettoyage (320€ raised, 15 donors — showing key ones)
  { id: "don-001", campaignId: "fund-001", donorId: "u-citizen-001", amount: "50.00", isAnonymous: false, message: "Bravo pour cette initiative ! Le lac mérite qu'on en prenne soin.", transactionId: null, createdAt: new Date("2024-06-05") },
  { id: "don-002", campaignId: "fund-001", donorId: "u-citizen-003", amount: "30.00", isAnonymous: false, message: null, transactionId: null, createdAt: new Date("2024-06-10") },
  { id: "don-003", campaignId: "fund-001", donorId: "u-owner-001", amount: "100.00", isAnonymous: false, message: "En tant que commerçant de la vieille ville, je soutiens la propreté du lac qui est notre atout principal.", transactionId: null, createdAt: new Date("2024-06-15") },
  { id: "don-004", campaignId: "fund-001", donorId: "u-citizen-005", amount: "20.00", isAnonymous: true, message: null, transactionId: null, createdAt: new Date("2024-06-20") },
  { id: "don-005", campaignId: "fund-001", donorId: "u-citizen-004", amount: "25.00", isAnonymous: false, message: "Merci pour votre engagement !", transactionId: null, createdAt: new Date("2024-06-25") },
  // fund-002: Café solidaire (450€ raised)
  { id: "don-006", campaignId: "fund-002", donorId: "u-citizen-002", amount: "75.00", isAnonymous: false, message: "Le quartier a besoin de ce lieu de rencontre. Hâte que ça ouvre !", transactionId: null, createdAt: new Date("2024-06-22") },
  { id: "don-007", campaignId: "fund-002", donorId: "u-owner-003", amount: "150.00", isAnonymous: false, message: "Je fournirai aussi des tables et chaises de mon ancien local.", transactionId: null, createdAt: new Date("2024-06-28") },
  { id: "don-008", campaignId: "fund-002", donorId: "u-citizen-005", amount: "40.00", isAnonymous: false, message: null, transactionId: null, createdAt: new Date("2024-07-02") },
  // fund-003: Fresque murale (3500€ funded — showing key donors)
  { id: "don-009", campaignId: "fund-003", donorId: "u-owner-001", amount: "500.00", isAnonymous: false, message: "Les commerçants de la vieille ville soutiennent ce projet qui embellira notre rue.", transactionId: null, createdAt: new Date("2024-05-05") },
  { id: "don-010", campaignId: "fund-003", donorId: "u-owner-002", amount: "200.00", isAnonymous: false, message: null, transactionId: null, createdAt: new Date("2024-05-10") },
  { id: "don-011", campaignId: "fund-003", donorId: "u-citizen-001", amount: "50.00", isAnonymous: false, message: "J'adore l'idée ! Marc Leroy fait un travail magnifique.", transactionId: null, createdAt: new Date("2024-05-15") },
  { id: "don-012", campaignId: "fund-003", donorId: "u-citizen-002", amount: "100.00", isAnonymous: true, message: null, transactionId: null, createdAt: new Date("2024-05-20") },
  // fund-004: Tablettes seniors (180€ raised)
  { id: "don-013", campaignId: "fund-004", donorId: "u-citizen-001", amount: "50.00", isAnonymous: false, message: "Mes parents auraient adoré cette initiative. Je soutiens !", transactionId: null, createdAt: new Date("2024-07-08") },
  { id: "don-014", campaignId: "fund-004", donorId: "u-owner-004", amount: "80.00", isAnonymous: false, message: "L'inclusion numérique est essentielle pour nos aînés.", transactionId: null, createdAt: new Date("2024-07-12") },
  { id: "don-015", campaignId: "fund-004", donorId: "u-citizen-003", amount: "50.00", isAnonymous: false, message: null, transactionId: null, createdAt: new Date("2024-07-18") },
];
