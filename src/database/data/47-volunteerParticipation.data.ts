// Seed: volunteerParticipation — participations des bénévoles aux tâches
export const volunteerParticipationData = [
  // vt-001: Ramassage Pâquier (completed)
  { id: "vp-001", taskId: "vt-001", userId: "u-citizen-001", status: "completed", hoursLogged: "3.0", feedback: "Super matinée ! On a rempli 8 sacs. Beaucoup de mégots et de bouteilles en plastique.", signedUpAt: new Date("2024-06-20"), completedAt: new Date("2024-07-06") },
  { id: "vp-002", taskId: "vt-001", userId: "u-citizen-002", status: "completed", hoursLogged: "3.0", feedback: "Bien organisé, merci à tous les participants !", signedUpAt: new Date("2024-06-18"), completedAt: new Date("2024-07-06") },
  { id: "vp-003", taskId: "vt-001", userId: "u-citizen-003", status: "completed", hoursLogged: "2.5", feedback: null, signedUpAt: new Date("2024-06-25"), completedAt: new Date("2024-07-06") },
  { id: "vp-004", taskId: "vt-001", userId: "u-citizen-005", status: "completed", hoursLogged: "3.0", feedback: "J'ai amené mes enfants, ils étaient ravis de participer. On reviendra !", signedUpAt: new Date("2024-06-22"), completedAt: new Date("2024-07-06") },
  // vt-002: Ramassage Marquisats (completed)
  { id: "vp-005", taskId: "vt-002", userId: "u-citizen-004", status: "completed", hoursLogged: "3.0", feedback: "Zone très sale après le week-end du 14 juillet. Travail nécessaire et utile.", signedUpAt: new Date("2024-06-20"), completedAt: new Date("2024-07-06") },
  { id: "vp-006", taskId: "vt-002", userId: "u-owner-002", status: "completed", hoursLogged: "2.5", feedback: null, signedUpAt: new Date("2024-06-28"), completedAt: new Date("2024-07-06") },
  // vt-003: Tri et pesée (completed)
  { id: "vp-007", taskId: "vt-003", userId: "u-citizen-002", status: "completed", hoursLogged: "2.0", feedback: "90 kg de tout-venant, 60 kg de recyclable, 30 kg de verre. Bilan encourageant.", signedUpAt: new Date("2024-06-18"), completedAt: new Date("2024-07-06") },
  // vt-004: Ramassage Impérial août (signed_up)
  { id: "vp-008", taskId: "vt-004", userId: "u-citizen-001", status: "signed_up", hoursLogged: null, feedback: null, signedUpAt: new Date("2024-07-15"), completedAt: null },
  { id: "vp-009", taskId: "vt-004", userId: "u-citizen-005", status: "signed_up", hoursLogged: null, feedback: null, signedUpAt: new Date("2024-07-16"), completedAt: null },
  { id: "vp-010", taskId: "vt-004", userId: "u-citizen-003", status: "confirmed", hoursLogged: null, feedback: null, signedUpAt: new Date("2024-07-18"), completedAt: null },
  // vt-005: Animation café (signed_up)
  { id: "vp-011", taskId: "vt-005", userId: "u-citizen-003", status: "signed_up", hoursLogged: null, feedback: null, signedUpAt: new Date("2024-07-10"), completedAt: null },
  { id: "vp-012", taskId: "vt-005", userId: "u-citizen-004", status: "signed_up", hoursLogged: null, feedback: null, signedUpAt: new Date("2024-07-12"), completedAt: null },
  // vt-007: Atelier smartphone
  { id: "vp-013", taskId: "vt-007", userId: "u-citizen-005", status: "signed_up", hoursLogged: null, feedback: null, signedUpAt: new Date("2024-07-15"), completedAt: null },
];
