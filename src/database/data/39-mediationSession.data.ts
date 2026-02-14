// Seed: mediationSession — sessions de médiation
export const mediationSessionData = [
  // med-001: resolved case — 2 sessions
  { id: "ms-001", caseId: "med-001", scheduledAt: new Date("2024-07-13T14:00:00"), durationMinutes: 60, type: "video", notes: "Première session : écoute des deux parties. Le restaurateur présente ses arguments (photos du service, historique des avis). Le client explique son mécontentement (attente longue, plat froid).", outcome: "Les deux parties acceptent de chercher un compromis.", status: "completed", conversationId: "conv-005", createdAt: new Date("2024-07-11") },
  { id: "ms-002", caseId: "med-001", scheduledAt: new Date("2024-07-18T14:00:00"), durationMinutes: 45, type: "video", notes: "Session de résolution : proposition de l'accord. Le restaurateur accepte de répondre publiquement à l'avis. Le client accepte de ne pas modifier sa note mais reconnaît que le service habituel est correct.", outcome: "Accord signé par les deux parties.", status: "completed", conversationId: "conv-005", createdAt: new Date("2024-07-14") },
  // med-002: in_progress case — 1 session scheduled
  { id: "ms-003", caseId: "med-002", scheduledAt: new Date("2024-07-22T10:00:00"), durationMinutes: 60, type: "video", notes: null, outcome: null, status: "scheduled", conversationId: null, createdAt: new Date("2024-07-16") },
];
