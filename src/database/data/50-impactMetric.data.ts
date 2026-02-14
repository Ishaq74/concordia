// Seed: impactMetric — métriques d'impact communautaire
export const impactMetricData = [
  // Q2 2024 metrics
  { id: "im-001", type: "projects_completed", value: "2.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ details: "Fresque murale Vieille Ville + première phase nettoyage berges" }), computedAt: new Date("2024-07-05") },
  { id: "im-002", type: "volunteer_hours", value: "156.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ participants: 28, avg_hours_per_volunteer: 5.6 }), computedAt: new Date("2024-07-05") },
  { id: "im-003", type: "funds_raised", value: "4770.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ campaigns: 4, avg_donation: 65.4, total_donors: 73 }), computedAt: new Date("2024-07-05") },
  { id: "im-004", type: "mediations_resolved", value: "1.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ total_opened: 3, resolved: 1, in_progress: 1, pending: 1 }), computedAt: new Date("2024-07-05") },
  { id: "im-005", type: "lessons_completed", value: "48.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ modules_available: 4, enrollments: 40, completion_rate: 0.35 }), computedAt: new Date("2024-07-05") },
  { id: "im-006", type: "active_citizens", value: "15.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ registered: 15, active_last_30d: 12, new_this_quarter: 8 }), computedAt: new Date("2024-07-05") },
  { id: "im-007", type: "resources_shared", value: "18.00", periodStart: "2024-04-01", periodEnd: "2024-06-30", scope: "global", metadata: JSON.stringify({ classifieds: 8, services: 6, products: 10 }), computedAt: new Date("2024-07-05") },
  // Monthly June
  { id: "im-008", type: "volunteer_hours", value: "84.00", periodStart: "2024-06-01", periodEnd: "2024-06-30", scope: "nettoyage_berges", metadata: JSON.stringify({ event: "Nettoyage berges juin", collected_kg: 180 }), computedAt: new Date("2024-07-02") },
];
