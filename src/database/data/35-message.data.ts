// Seed: message — messages dans les conversations
export const messageData = [
  // conv-001: citizen-001 <-> owner-001 (fromage question)
  { id: "msg-001", conversationId: "conv-001", senderId: "u-citizen-001", content: "Bonjour ! J'ai vu votre fromagerie sur Concordia. Avez-vous du Reblochon fermier disponible cette semaine pour une tartiflette ce samedi ?", sentAt: new Date("2024-06-10T10:00:00") },
  { id: "msg-002", conversationId: "conv-001", senderId: "u-owner-001", content: "Bonjour ! Oui, j'ai du Reblochon fermier tout frais, affiné 5 semaines. Vous pouvez passer au marché demain mardi ou samedi matin avant 12h.", sentAt: new Date("2024-06-10T14:30:00") },
  { id: "msg-003", conversationId: "conv-001", senderId: "u-citizen-001", content: "Parfait, je passerai samedi matin. Il me faut 2 Reblochons (on sera 8). Vous pouvez me les mettre de côté ?", sentAt: new Date("2024-06-11T08:15:00") },
  { id: "msg-004", conversationId: "conv-001", senderId: "u-owner-001", content: "C'est noté, 2 Reblochons réservés à votre nom ! À samedi.", sentAt: new Date("2024-06-11T09:00:00") },
  { id: "msg-005", conversationId: "conv-001", senderId: "u-citizen-001", content: "La tartiflette était incroyable, merci encore ! Tout le monde a adoré. À très vite au marché.", sentAt: new Date("2024-06-12T20:00:00") },

  // conv-002: classified contact about VTT
  { id: "msg-006", conversationId: "conv-002", senderId: "u-citizen-004", content: "Bonjour, votre VTT Lapierre est encore disponible ? Il correspond exactement à ce que je cherche. Possible de le voir ce week-end ?", sentAt: new Date("2024-06-08T18:00:00") },
  { id: "msg-007", conversationId: "conv-002", senderId: "u-citizen-002", content: "Salut ! Oui, toujours dispo. On peut se retrouver samedi matin au parking du Semnoz si tu veux l'essayer sur un vrai sentier ?", sentAt: new Date("2024-06-08T20:30:00") },
  { id: "msg-008", conversationId: "conv-002", senderId: "u-citizen-004", content: "Bonne idée ! 9h au parking ça te va ? Je viendrai avec le cash au cas où.", sentAt: new Date("2024-06-09T07:00:00") },
  { id: "msg-009", conversationId: "conv-002", senderId: "u-citizen-002", content: "9h c'est parfait. On peut aussi utiliser le paiement Concordia si tu préfères. À samedi !", sentAt: new Date("2024-06-09T08:15:00") },

  // conv-003: citizen-005 <-> educator-001 (cours)
  { id: "msg-010", conversationId: "conv-003", senderId: "u-citizen-005", content: "Bonjour, je suis intéressée par vos cours de soutien scolaire. Ma fille est en 4e et a des difficultés en maths. Avez-vous des disponibilités ?", sentAt: new Date("2024-06-15T11:00:00") },
  { id: "msg-011", conversationId: "conv-003", senderId: "u-educator-001", content: "Bonjour ! Bien sûr, j'ai des créneaux le mardi et jeudi de 17h à 19h. Le premier cours est gratuit pour évaluer le niveau. On commence par quoi ?", sentAt: new Date("2024-06-15T14:00:00") },
  { id: "msg-012", conversationId: "conv-003", senderId: "u-citizen-005", content: "Le mardi serait parfait. On peut commencer la semaine prochaine ? Elle a un contrôle sur les fractions dans 2 semaines.", sentAt: new Date("2024-06-16T09:30:00") },
  { id: "msg-013", conversationId: "conv-003", senderId: "u-educator-001", content: "C'est noté pour mardi prochain 17h. Je prépare des exercices adaptés sur les fractions. Envoyez-moi une photo du dernier contrôle si possible.", sentAt: new Date("2024-06-17T10:00:00") },
  { id: "msg-014", conversationId: "conv-003", senderId: "u-citizen-005", content: "Merci beaucoup ! Je vous envoie ça ce soir. Elle a eu 8/20 au dernier contrôle, il y a du travail...", sentAt: new Date("2024-06-18T18:00:00") },

  // conv-004: group cleanup organization
  { id: "msg-015", conversationId: "conv-004", senderId: "u-citizen-002", content: "Salut tout le monde ! On organise le nettoyage des berges du lac le samedi 6 juillet. RDV 9h au Pâquier. Qui peut venir ?", sentAt: new Date("2024-06-20T09:00:00") },
  { id: "msg-016", conversationId: "conv-004", senderId: "u-citizen-001", content: "Présent ! Je viens avec ma famille. On apporte nos gants ?", sentAt: new Date("2024-06-20T12:00:00") },
  { id: "msg-017", conversationId: "conv-004", senderId: "u-citizen-003", content: "Je serai là aussi ! Bonne idée. Je peux amener des sacs poubelle.", sentAt: new Date("2024-06-21T08:00:00") },
  { id: "msg-018", conversationId: "conv-004", senderId: "u-citizen-002", content: "Top ! Des gants seront fournis par la mairie. On aura aussi des pinces. L'objectif c'est le tronçon Pâquier → Impérial. Après, on fait un pique-nique ensemble.", sentAt: new Date("2024-06-22T10:00:00") },
  { id: "msg-019", conversationId: "conv-004", senderId: "u-citizen-005", content: "Super initiative ! Je viendrai avec des boissons pour tout le monde après l'effort 🍹", sentAt: new Date("2024-06-22T14:00:00") },
  { id: "msg-020", conversationId: "conv-004", senderId: "u-citizen-002", content: "On est 12 inscrits ! J'ai mis à jour l'événement sur Concordia. N'oubliez pas la crème solaire, il fera chaud.", sentAt: new Date("2024-07-01T08:00:00") },
];
