// Seed: educationProgress — progression par leçon
export const educationProgressData = [
  // enr-001: citizen-001 completed edu-001 (4 lessons, all done)
  { id: "ep-001", enrollmentId: "enr-001", lessonId: "les-001", isCompleted: true, score: null, timeSpentSeconds: 1200, completedAt: new Date("2024-05-10"), startedAt: new Date("2024-05-05") },
  { id: "ep-002", enrollmentId: "enr-001", lessonId: "les-002", isCompleted: true, score: null, timeSpentSeconds: 1500, completedAt: new Date("2024-05-15"), startedAt: new Date("2024-05-12") },
  { id: "ep-003", enrollmentId: "enr-001", lessonId: "les-003", isCompleted: true, score: null, timeSpentSeconds: 1100, completedAt: new Date("2024-05-22"), startedAt: new Date("2024-05-18") },
  { id: "ep-004", enrollmentId: "enr-001", lessonId: "les-004", isCompleted: true, score: "9.0", timeSpentSeconds: 480, completedAt: new Date("2024-06-01"), startedAt: new Date("2024-05-28") },
  // enr-002: citizen-002 completed edu-001
  { id: "ep-005", enrollmentId: "enr-002", lessonId: "les-001", isCompleted: true, score: null, timeSpentSeconds: 1350, completedAt: new Date("2024-05-12"), startedAt: new Date("2024-05-08") },
  { id: "ep-006", enrollmentId: "enr-002", lessonId: "les-002", isCompleted: true, score: null, timeSpentSeconds: 1600, completedAt: new Date("2024-05-20"), startedAt: new Date("2024-05-14") },
  { id: "ep-007", enrollmentId: "enr-002", lessonId: "les-003", isCompleted: true, score: null, timeSpentSeconds: 1200, completedAt: new Date("2024-05-28"), startedAt: new Date("2024-05-22") },
  { id: "ep-008", enrollmentId: "enr-002", lessonId: "les-004", isCompleted: true, score: "8.0", timeSpentSeconds: 600, completedAt: new Date("2024-06-10"), startedAt: new Date("2024-06-05") },
  // enr-003: citizen-003 active edu-001 (3/4 done)
  { id: "ep-009", enrollmentId: "enr-003", lessonId: "les-001", isCompleted: true, score: null, timeSpentSeconds: 1400, completedAt: new Date("2024-05-20"), startedAt: new Date("2024-05-15") },
  { id: "ep-010", enrollmentId: "enr-003", lessonId: "les-002", isCompleted: true, score: null, timeSpentSeconds: 1800, completedAt: new Date("2024-05-30"), startedAt: new Date("2024-05-22") },
  { id: "ep-011", enrollmentId: "enr-003", lessonId: "les-003", isCompleted: true, score: null, timeSpentSeconds: 1100, completedAt: new Date("2024-06-10"), startedAt: new Date("2024-06-05") },
  // enr-005: citizen-002 completed edu-002 (3 lessons)
  { id: "ep-012", enrollmentId: "enr-005", lessonId: "les-005", isCompleted: true, score: null, timeSpentSeconds: 1200, completedAt: new Date("2024-05-28"), startedAt: new Date("2024-05-20") },
  { id: "ep-013", enrollmentId: "enr-005", lessonId: "les-006", isCompleted: true, score: null, timeSpentSeconds: 1800, completedAt: new Date("2024-06-05"), startedAt: new Date("2024-05-30") },
  { id: "ep-014", enrollmentId: "enr-005", lessonId: "les-007", isCompleted: true, score: null, timeSpentSeconds: 1100, completedAt: new Date("2024-06-20"), startedAt: new Date("2024-06-10") },
  // enr-008: citizen-001 active edu-003 (2/5 done)
  { id: "ep-015", enrollmentId: "enr-008", lessonId: "les-008", isCompleted: true, score: null, timeSpentSeconds: 900, completedAt: new Date("2024-06-10"), startedAt: new Date("2024-06-05") },
  { id: "ep-016", enrollmentId: "enr-008", lessonId: "les-009", isCompleted: true, score: null, timeSpentSeconds: 1200, completedAt: new Date("2024-06-18"), startedAt: new Date("2024-06-12") },
  // enr-011: citizen-002 completed edu-004 (4 lessons)
  { id: "ep-017", enrollmentId: "enr-011", lessonId: "les-013", isCompleted: true, score: null, timeSpentSeconds: 900, completedAt: new Date("2024-06-22"), startedAt: new Date("2024-06-18") },
  { id: "ep-018", enrollmentId: "enr-011", lessonId: "les-014", isCompleted: true, score: null, timeSpentSeconds: 1200, completedAt: new Date("2024-06-28"), startedAt: new Date("2024-06-24") },
  { id: "ep-019", enrollmentId: "enr-011", lessonId: "les-015", isCompleted: true, score: null, timeSpentSeconds: 800, completedAt: new Date("2024-07-03"), startedAt: new Date("2024-07-01") },
  { id: "ep-020", enrollmentId: "enr-011", lessonId: "les-016", isCompleted: true, score: null, timeSpentSeconds: 1500, completedAt: new Date("2024-07-10"), startedAt: new Date("2024-07-05") },
];
