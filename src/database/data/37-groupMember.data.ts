// Seed: groupMember — membres des groupes (composite PK: groupId + userId)
export const groupMemberData = [
  // grp-001: Cyclistes du Lac
  { groupId: "grp-001", userId: "u-citizen-002", role: "admin", joinedAt: new Date("2024-04-01") },
  { groupId: "grp-001", userId: "u-citizen-001", role: "member", joinedAt: new Date("2024-04-05") },
  { groupId: "grp-001", userId: "u-citizen-004", role: "member", joinedAt: new Date("2024-04-10") },
  { groupId: "grp-001", userId: "u-owner-002", role: "member", joinedAt: new Date("2024-04-15") },
  // grp-002: Jardiniers du Pâquier
  { groupId: "grp-002", userId: "u-citizen-002", role: "admin", joinedAt: new Date("2024-04-15") },
  { groupId: "grp-002", userId: "u-citizen-001", role: "member", joinedAt: new Date("2024-04-20") },
  { groupId: "grp-002", userId: "u-citizen-005", role: "member", joinedAt: new Date("2024-05-01") },
  { groupId: "grp-002", userId: "u-citizen-004", role: "member", joinedAt: new Date("2024-05-10") },
  // grp-003: Parents du lac
  { groupId: "grp-003", userId: "u-citizen-005", role: "admin", joinedAt: new Date("2024-05-01") },
  { groupId: "grp-003", userId: "u-citizen-001", role: "member", joinedAt: new Date("2024-05-05") },
  { groupId: "grp-003", userId: "u-citizen-003", role: "member", joinedAt: new Date("2024-05-10") },
  { groupId: "grp-003", userId: "u-citizen-004", role: "member", joinedAt: new Date("2024-05-15") },
  // grp-004: Randonneurs des Aravis
  { groupId: "grp-004", userId: "u-citizen-001", role: "admin", joinedAt: new Date("2024-05-15") },
  { groupId: "grp-004", userId: "u-citizen-002", role: "member", joinedAt: new Date("2024-05-20") },
  { groupId: "grp-004", userId: "u-citizen-005", role: "member", joinedAt: new Date("2024-05-25") },
  { groupId: "grp-004", userId: "u-citizen-003", role: "member", joinedAt: new Date("2024-06-01") },
  { groupId: "grp-004", userId: "u-owner-005", role: "member", joinedAt: new Date("2024-06-10") },
  // grp-005: Commerçants Centre-Ville (privé)
  { groupId: "grp-005", userId: "u-owner-001", role: "admin", joinedAt: new Date("2024-04-01") },
  { groupId: "grp-005", userId: "u-owner-002", role: "member", joinedAt: new Date("2024-04-05") },
  { groupId: "grp-005", userId: "u-owner-003", role: "member", joinedAt: new Date("2024-04-10") },
  { groupId: "grp-005", userId: "u-owner-004", role: "member", joinedAt: new Date("2024-04-15") },
  { groupId: "grp-005", userId: "u-owner-005", role: "member", joinedAt: new Date("2024-04-20") },
];
