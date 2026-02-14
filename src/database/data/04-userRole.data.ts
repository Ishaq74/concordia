// Seed: userRole (app roles)
export const userRoleData = [
  { id: "ur-001", userId: "u-admin-001", role: "admin", grantedBy: null, grantedAt: new Date("2024-01-01T08:00:00Z") },
  { id: "ur-002", userId: "u-mod-001", role: "moderator", grantedBy: "u-admin-001", grantedAt: new Date("2024-01-15T09:00:00Z") },
  { id: "ur-003", userId: "u-owner-001", role: "owner", grantedBy: "u-admin-001", grantedAt: new Date("2024-02-01T10:00:00Z") },
  { id: "ur-004", userId: "u-owner-002", role: "owner", grantedBy: "u-admin-001", grantedAt: new Date("2024-02-10T11:00:00Z") },
  { id: "ur-005", userId: "u-owner-003", role: "owner", grantedBy: "u-admin-001", grantedAt: new Date("2024-02-15T09:30:00Z") },
  { id: "ur-006", userId: "u-citizen-001", role: "citizen", grantedBy: null, grantedAt: new Date("2024-03-01T14:00:00Z") },
  { id: "ur-007", userId: "u-citizen-002", role: "citizen", grantedBy: null, grantedAt: new Date("2024-03-05T15:00:00Z") },
  { id: "ur-008", userId: "u-citizen-003", role: "citizen", grantedBy: null, grantedAt: new Date("2024-03-10T09:00:00Z") },
  { id: "ur-009", userId: "u-citizen-004", role: "citizen", grantedBy: null, grantedAt: new Date("2024-03-12T08:00:00Z") },
  { id: "ur-010", userId: "u-citizen-005", role: "citizen", grantedBy: null, grantedAt: new Date("2024-03-15T10:00:00Z") },
  { id: "ur-011", userId: "u-educator-001", role: "educator", grantedBy: "u-admin-001", grantedAt: new Date("2024-02-20T08:00:00Z") },
  { id: "ur-012", userId: "u-mediator-001", role: "mediator", grantedBy: "u-admin-001", grantedAt: new Date("2024-02-25T08:00:00Z") },
  { id: "ur-013", userId: "u-owner-004", role: "owner", grantedBy: "u-admin-001", grantedAt: new Date("2024-03-20T07:00:00Z") },
  { id: "ur-014", userId: "u-owner-005", role: "owner", grantedBy: "u-admin-001", grantedAt: new Date("2024-04-01T08:00:00Z") },
  { id: "ur-015", userId: "u-author-001", role: "author", grantedBy: "u-admin-001", grantedAt: new Date("2024-02-05T08:00:00Z") },
];
