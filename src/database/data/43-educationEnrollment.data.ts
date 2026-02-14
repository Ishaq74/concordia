// Seed: educationEnrollment — inscriptions aux modules éducatifs
export const educationEnrollmentData = [
  // edu-001: Écosystème du lac (12 inscrits, some completed)
  { id: "enr-001", moduleId: "edu-001", userId: "u-citizen-001", status: "completed", progressPercent: "100.00", completedAt: new Date("2024-06-01"), paymentTransactionId: null, enrolledAt: new Date("2024-05-05") },
  { id: "enr-002", moduleId: "edu-001", userId: "u-citizen-002", status: "completed", progressPercent: "100.00", completedAt: new Date("2024-06-10"), paymentTransactionId: null, enrolledAt: new Date("2024-05-08") },
  { id: "enr-003", moduleId: "edu-001", userId: "u-citizen-003", status: "active", progressPercent: "75.00", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-05-15") },
  { id: "enr-004", moduleId: "edu-001", userId: "u-citizen-005", status: "active", progressPercent: "50.00", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-06-01") },
  // edu-002: Citoyenneté (8 inscrits)
  { id: "enr-005", moduleId: "edu-002", userId: "u-citizen-002", status: "completed", progressPercent: "100.00", completedAt: new Date("2024-06-20"), paymentTransactionId: null, enrolledAt: new Date("2024-05-20") },
  { id: "enr-006", moduleId: "edu-002", userId: "u-citizen-004", status: "active", progressPercent: "33.33", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-06-01") },
  { id: "enr-007", moduleId: "edu-002", userId: "u-citizen-001", status: "active", progressPercent: "66.67", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-05-25") },
  // edu-003: Fromagerie (5 inscrits, paid)
  { id: "enr-008", moduleId: "edu-003", userId: "u-citizen-001", status: "active", progressPercent: "40.00", completedAt: null, paymentTransactionId: "tx-edu-001", enrolledAt: new Date("2024-06-05") },
  { id: "enr-009", moduleId: "edu-003", userId: "u-citizen-005", status: "active", progressPercent: "20.00", completedAt: null, paymentTransactionId: "tx-edu-002", enrolledAt: new Date("2024-06-10") },
  { id: "enr-010", moduleId: "edu-003", userId: "u-citizen-003", status: "active", progressPercent: "60.00", completedAt: null, paymentTransactionId: "tx-edu-003", enrolledAt: new Date("2024-06-08") },
  // edu-004: Zéro déchet (15 inscrits, showing a few)
  { id: "enr-011", moduleId: "edu-004", userId: "u-citizen-002", status: "completed", progressPercent: "100.00", completedAt: new Date("2024-07-10"), paymentTransactionId: null, enrolledAt: new Date("2024-06-18") },
  { id: "enr-012", moduleId: "edu-004", userId: "u-citizen-005", status: "active", progressPercent: "50.00", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-06-20") },
  { id: "enr-013", moduleId: "edu-004", userId: "u-citizen-004", status: "active", progressPercent: "25.00", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-07-01") },
  { id: "enr-014", moduleId: "edu-004", userId: "u-citizen-001", status: "active", progressPercent: "75.00", completedAt: null, paymentTransactionId: null, enrolledAt: new Date("2024-06-22") },
];
