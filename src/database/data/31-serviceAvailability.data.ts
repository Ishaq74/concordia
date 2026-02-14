// Seed: serviceAvailability — horaires de disponibilité des services
export const serviceAvailabilityData = [
  // svc-001: Yoga Hatha (lundi, mercredi, samedi matin)
  { id: "avail-001", serviceId: "svc-001", dayOfWeek: 1, startTime: "08:00", endTime: "09:15", isAvailable: true, createdAt: new Date("2024-04-01") },
  { id: "avail-002", serviceId: "svc-001", dayOfWeek: 3, startTime: "08:00", endTime: "09:15", isAvailable: true, createdAt: new Date("2024-04-01") },
  { id: "avail-003", serviceId: "svc-001", dayOfWeek: 6, startTime: "09:00", endTime: "10:15", isAvailable: true, createdAt: new Date("2024-04-01") },
  // svc-002: Massage (mardi au samedi, après-midi)
  { id: "avail-004", serviceId: "svc-002", dayOfWeek: 2, startTime: "14:00", endTime: "19:00", isAvailable: true, createdAt: new Date("2024-04-01") },
  { id: "avail-005", serviceId: "svc-002", dayOfWeek: 3, startTime: "14:00", endTime: "19:00", isAvailable: true, createdAt: new Date("2024-04-01") },
  { id: "avail-006", serviceId: "svc-002", dayOfWeek: 4, startTime: "14:00", endTime: "19:00", isAvailable: true, createdAt: new Date("2024-04-01") },
  { id: "avail-007", serviceId: "svc-002", dayOfWeek: 5, startTime: "14:00", endTime: "19:00", isAvailable: true, createdAt: new Date("2024-04-01") },
  { id: "avail-008", serviceId: "svc-002", dayOfWeek: 6, startTime: "10:00", endTime: "17:00", isAvailable: true, createdAt: new Date("2024-04-01") },
  // svc-003: Cours cuisine (vendredi soir, samedi après-midi)
  { id: "avail-009", serviceId: "svc-003", dayOfWeek: 5, startTime: "18:00", endTime: "21:00", isAvailable: true, createdAt: new Date("2024-05-01") },
  { id: "avail-010", serviceId: "svc-003", dayOfWeek: 6, startTime: "14:00", endTime: "17:00", isAvailable: true, createdAt: new Date("2024-05-01") },
  // svc-004: Aide devoirs (lundi au vendredi, fin de journée)
  { id: "avail-011", serviceId: "svc-004", dayOfWeek: 1, startTime: "16:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2024-05-15") },
  { id: "avail-012", serviceId: "svc-004", dayOfWeek: 2, startTime: "16:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2024-05-15") },
  { id: "avail-013", serviceId: "svc-004", dayOfWeek: 3, startTime: "16:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2024-05-15") },
  { id: "avail-014", serviceId: "svc-004", dayOfWeek: 4, startTime: "16:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2024-05-15") },
  { id: "avail-015", serviceId: "svc-004", dayOfWeek: 5, startTime: "16:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2024-05-15") },
  // svc-005: Réparation vélos (lundi au samedi)
  { id: "avail-016", serviceId: "svc-005", dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2024-06-01") },
  { id: "avail-017", serviceId: "svc-005", dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2024-06-01") },
  { id: "avail-018", serviceId: "svc-005", dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2024-06-01") },
  { id: "avail-019", serviceId: "svc-005", dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2024-06-01") },
  { id: "avail-020", serviceId: "svc-005", dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2024-06-01") },
  { id: "avail-021", serviceId: "svc-005", dayOfWeek: 6, startTime: "09:00", endTime: "13:00", isAvailable: true, createdAt: new Date("2024-06-01") },
  // svc-006: Natation enfants (mercredi et samedi matin, été uniquement)
  { id: "avail-022", serviceId: "svc-006", dayOfWeek: 3, startTime: "10:00", endTime: "12:00", isAvailable: true, createdAt: new Date("2024-06-15") },
  { id: "avail-023", serviceId: "svc-006", dayOfWeek: 6, startTime: "10:00", endTime: "12:00", isAvailable: true, createdAt: new Date("2024-06-15") },
];
