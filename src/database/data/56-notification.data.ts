// Seed: notification — notifications utilisateurs
export const notificationData = [
  // Reviews notification
  { id: "notif-001", userId: "u-owner-001", type: "review", title: "Nouvel avis sur votre établissement", body: "Un client a laissé un avis 5/5 sur Le Refuge Savoyard.", targetType: "review", targetId: "rev-001", data: null, isRead: true, readAt: new Date("2024-04-10T12:00:00"), createdAt: new Date("2024-04-10T10:30:00") },
  { id: "notif-002", userId: "u-owner-001", type: "review", title: "Nouvel avis sur votre établissement", body: "Un client a laissé un avis 3.5/5 sur Le Refuge Savoyard.", targetType: "review", targetId: "rev-002", data: null, isRead: true, readAt: new Date("2024-05-15T18:00:00"), createdAt: new Date("2024-05-15T14:00:00") },
  // Booking notifications
  { id: "notif-003", userId: "u-owner-004", type: "booking", title: "Nouvelle réservation", body: "Une réservation a été effectuée pour le cours de yoga Hatha du 8 juillet.", targetType: "booking", targetId: "bk-001", data: null, isRead: true, readAt: new Date("2024-07-05T15:00:00"), createdAt: new Date("2024-07-05T10:00:00") },
  { id: "notif-004", userId: "u-owner-004", type: "booking", title: "Réservation annulée", body: "Une réservation pour le cours de yoga du 22 juillet a été annulée par le client.", targetType: "booking", targetId: "bk-008", data: null, isRead: true, readAt: new Date("2024-07-20T14:00:00"), createdAt: new Date("2024-07-20T10:00:00") },
  // Message notifications
  { id: "notif-005", userId: "u-owner-001", type: "message", title: "Nouveau message", body: "Vous avez reçu un message à propos du Reblochon fermier.", targetType: "conversation", targetId: "conv-001", data: null, isRead: true, readAt: new Date("2024-06-10T15:00:00"), createdAt: new Date("2024-06-10T10:00:00") },
  { id: "notif-006", userId: "u-citizen-002", type: "message", title: "Nouveau message", body: "Quelqu'un est intéressé par votre VTT Lapierre.", targetType: "conversation", targetId: "conv-002", data: null, isRead: true, readAt: new Date("2024-06-08T20:00:00"), createdAt: new Date("2024-06-08T18:00:00") },
  // Mediation notifications
  { id: "notif-007", userId: "u-mediator-001", type: "mediation", title: "Nouveau cas de médiation", body: "Un cas de médiation vous a été assigné : 'Contestation d'un avis jugé injuste'.", targetType: "mediationCase", targetId: "med-001", data: null, isRead: true, readAt: new Date("2024-07-11T10:00:00"), createdAt: new Date("2024-07-11T08:00:00") },
  { id: "notif-008", userId: "u-mediator-001", type: "mediation", title: "Nouveau cas de médiation", body: "Un cas de médiation vous a été assigné : 'Litige achat VTT'.", targetType: "mediationCase", targetId: "med-002", data: null, isRead: false, readAt: null, createdAt: new Date("2024-07-16T08:00:00") },
  // Donation notifications
  { id: "notif-009", userId: "u-citizen-002", type: "donation", title: "Nouveau don reçu", body: "Votre campagne 'Matériel nettoyage berges' a reçu un don de 50 €.", targetType: "fundingCampaign", targetId: "fund-001", data: null, isRead: true, readAt: new Date("2024-06-05T16:00:00"), createdAt: new Date("2024-06-05T14:00:00") },
  { id: "notif-010", userId: "u-owner-001", type: "donation", title: "Objectif atteint !", body: "La campagne 'Fresque murale Vieille Ville' a atteint son objectif de 3 500 € !", targetType: "fundingCampaign", targetId: "fund-003", data: null, isRead: true, readAt: new Date("2024-07-12T14:00:00"), createdAt: new Date("2024-07-12T10:00:00") },
  // Volunteer notifications
  { id: "notif-011", userId: "u-citizen-002", type: "volunteer", title: "Nouveau bénévole inscrit", body: "Un nouveau bénévole s'est inscrit pour le ramassage du secteur Impérial en août.", targetType: "volunteerTask", targetId: "vt-004", data: null, isRead: false, readAt: null, createdAt: new Date("2024-07-15T12:00:00") },
  // Education notifications
  { id: "notif-012", userId: "u-educator-001", type: "education", title: "Nouvel inscrit à votre module", body: "Un apprenant s'est inscrit au module 'Comprendre l'écosystème du lac d'Annecy'.", targetType: "educationModule", targetId: "edu-001", data: null, isRead: true, readAt: new Date("2024-06-01T12:00:00"), createdAt: new Date("2024-06-01T10:00:00") },
  // System notifications
  { id: "notif-013", userId: "u-admin-001", type: "system", title: "Rapport de transparence publié", body: "Le rapport de transparence T2 2024 a été publié avec succès.", targetType: "transparencyReport", targetId: "tr-001", data: null, isRead: true, readAt: new Date("2024-07-10T12:00:00"), createdAt: new Date("2024-07-10T10:00:00") },
  { id: "notif-014", userId: "u-mod-001", type: "moderation", title: "Nouveau signalement à traiter", body: "Un contenu du forum a été signalé comme inapproprié. Veuillez vérifier.", targetType: "mediationCase", targetId: "med-003", data: null, isRead: false, readAt: null, createdAt: new Date("2024-07-18T09:00:00") },
];
