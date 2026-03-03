// 25 - Services Availability — créneaux hebdomadaires variés
export const servicesAvailabilitySeed = [
  // ═══ Plomberie: Lundi → Vendredi 8h-18h + Samedi 9h-12h + Dimanche OFF ═══
  { id: "avail-plomberie-lun", serviceId: "svc-plomberie-marc", dayOfWeek: 1, startTime: "08:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-01-15T00:00:00Z") },
  { id: "avail-plomberie-mar", serviceId: "svc-plomberie-marc", dayOfWeek: 2, startTime: "08:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-01-15T00:00:00Z") },
  { id: "avail-plomberie-mer", serviceId: "svc-plomberie-marc", dayOfWeek: 3, startTime: "08:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-01-15T00:00:00Z") },
  { id: "avail-plomberie-jeu", serviceId: "svc-plomberie-marc", dayOfWeek: 4, startTime: "08:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-01-15T00:00:00Z") },
  { id: "avail-plomberie-ven", serviceId: "svc-plomberie-marc", dayOfWeek: 5, startTime: "08:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-01-15T00:00:00Z") },
  { id: "avail-plomberie-sam", serviceId: "svc-plomberie-marc", dayOfWeek: 6, startTime: "09:00", endTime: "12:00", isAvailable: true, createdAt: new Date("2026-01-15T00:00:00Z") },
  // Dimanche : créneau marqué indisponible
  { id: "avail-plomberie-dim", serviceId: "svc-plomberie-marc", dayOfWeek: 0, startTime: "00:00", endTime: "23:59", isAvailable: false, createdAt: new Date("2026-01-15T00:00:00Z") },

  // ═══ Guitare: Mar, Jeu, Sam 14h-20h ═══
  { id: "avail-guitare-mar", serviceId: "svc-guitare-camille", dayOfWeek: 2, startTime: "14:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2026-01-25T00:00:00Z") },
  { id: "avail-guitare-jeu", serviceId: "svc-guitare-camille", dayOfWeek: 4, startTime: "14:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2026-01-25T00:00:00Z") },
  { id: "avail-guitare-sam", serviceId: "svc-guitare-camille", dayOfWeek: 6, startTime: "14:00", endTime: "20:00", isAvailable: true, createdAt: new Date("2026-01-25T00:00:00Z") },

  // ═══ Yoga: Lun, Mer, Ven, Sam 7h-9h (matin au lac) ═══
  { id: "avail-yoga-lun", serviceId: "svc-yoga-lucas", dayOfWeek: 1, startTime: "07:00", endTime: "09:00", isAvailable: true, createdAt: new Date("2026-02-01T00:00:00Z") },
  { id: "avail-yoga-mer", serviceId: "svc-yoga-lucas", dayOfWeek: 3, startTime: "07:00", endTime: "09:00", isAvailable: true, createdAt: new Date("2026-02-01T00:00:00Z") },
  { id: "avail-yoga-ven", serviceId: "svc-yoga-lucas", dayOfWeek: 5, startTime: "07:00", endTime: "09:00", isAvailable: true, createdAt: new Date("2026-02-01T00:00:00Z") },
  { id: "avail-yoga-sam", serviceId: "svc-yoga-lucas", dayOfWeek: 6, startTime: "08:00", endTime: "10:00", isAvailable: true, createdAt: new Date("2026-02-01T00:00:00Z") },

  // ═══ Photo: Week-end seulement ═══
  { id: "avail-photo-sam", serviceId: "svc-photo-camille", dayOfWeek: 6, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-02-05T00:00:00Z") },
  { id: "avail-photo-dim", serviceId: "svc-photo-camille", dayOfWeek: 0, startTime: "09:00", endTime: "18:00", isAvailable: true, createdAt: new Date("2026-02-05T00:00:00Z") },

  // ═══ Coaching: Lun-Ven 6h-21h (large plage) ═══
  { id: "avail-coaching-lun", serviceId: "svc-coaching-lucas", dayOfWeek: 1, startTime: "06:00", endTime: "21:00", isAvailable: true, createdAt: new Date("2026-02-10T00:00:00Z") },
  { id: "avail-coaching-mar", serviceId: "svc-coaching-lucas", dayOfWeek: 2, startTime: "06:00", endTime: "21:00", isAvailable: true, createdAt: new Date("2026-02-10T00:00:00Z") },
  { id: "avail-coaching-mer", serviceId: "svc-coaching-lucas", dayOfWeek: 3, startTime: "06:00", endTime: "21:00", isAvailable: true, createdAt: new Date("2026-02-10T00:00:00Z") },
  { id: "avail-coaching-jeu", serviceId: "svc-coaching-lucas", dayOfWeek: 4, startTime: "06:00", endTime: "21:00", isAvailable: true, createdAt: new Date("2026-02-10T00:00:00Z") },
  { id: "avail-coaching-ven", serviceId: "svc-coaching-lucas", dayOfWeek: 5, startTime: "06:00", endTime: "21:00", isAvailable: true, createdAt: new Date("2026-02-10T00:00:00Z") },

  // ═══ Aide ménagère: Lun, Mer, Ven 9h-16h ═══
  { id: "avail-menage-lun", serviceId: "svc-menage-sarah", dayOfWeek: 1, startTime: "09:00", endTime: "16:00", isAvailable: true, createdAt: new Date("2026-02-15T00:00:00Z") },
  { id: "avail-menage-mer", serviceId: "svc-menage-sarah", dayOfWeek: 3, startTime: "09:00", endTime: "16:00", isAvailable: true, createdAt: new Date("2026-02-15T00:00:00Z") },
  { id: "avail-menage-ven", serviceId: "svc-menage-sarah", dayOfWeek: 5, startTime: "09:00", endTime: "16:00", isAvailable: true, createdAt: new Date("2026-02-15T00:00:00Z") },
];
