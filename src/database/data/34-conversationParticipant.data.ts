// Seed: conversationParticipant — participants aux conversations
export const conversationParticipantData = [
  // conv-001: direct citizen-001 <-> owner-001
  { id: "cp-001", conversationId: "conv-001", userId: "u-citizen-001", role: "participant", joinedAt: new Date("2024-06-10"), lastReadAt: new Date("2024-06-12") },
  { id: "cp-002", conversationId: "conv-001", userId: "u-owner-001", role: "participant", joinedAt: new Date("2024-06-10"), lastReadAt: new Date("2024-06-11") },
  // conv-002: classified_contact citizen-004 -> citizen-002 (about VTT)
  { id: "cp-003", conversationId: "conv-002", userId: "u-citizen-004", role: "participant", joinedAt: new Date("2024-06-08"), lastReadAt: new Date("2024-06-09") },
  { id: "cp-004", conversationId: "conv-002", userId: "u-citizen-002", role: "participant", joinedAt: new Date("2024-06-08"), lastReadAt: new Date("2024-06-09") },
  // conv-003: direct citizen-005 <-> educator-001
  { id: "cp-005", conversationId: "conv-003", userId: "u-citizen-005", role: "participant", joinedAt: new Date("2024-06-15"), lastReadAt: new Date("2024-06-18") },
  { id: "cp-006", conversationId: "conv-003", userId: "u-educator-001", role: "participant", joinedAt: new Date("2024-06-15"), lastReadAt: new Date("2024-06-17") },
  // conv-004: group — organizing cleanup
  { id: "cp-007", conversationId: "conv-004", userId: "u-citizen-002", role: "admin", joinedAt: new Date("2024-06-20"), lastReadAt: new Date("2024-07-01") },
  { id: "cp-008", conversationId: "conv-004", userId: "u-citizen-001", role: "participant", joinedAt: new Date("2024-06-20"), lastReadAt: new Date("2024-06-30") },
  { id: "cp-009", conversationId: "conv-004", userId: "u-citizen-003", role: "participant", joinedAt: new Date("2024-06-21"), lastReadAt: new Date("2024-06-28") },
  { id: "cp-010", conversationId: "conv-004", userId: "u-citizen-005", role: "participant", joinedAt: new Date("2024-06-22"), lastReadAt: new Date("2024-07-01") },
  // conv-005: mediation — mediator + 2 parties
  { id: "cp-011", conversationId: "conv-005", userId: "u-mediator-001", role: "mediator", joinedAt: new Date("2024-07-10"), lastReadAt: new Date("2024-07-15") },
  { id: "cp-012", conversationId: "conv-005", userId: "u-citizen-003", role: "participant", joinedAt: new Date("2024-07-10"), lastReadAt: new Date("2024-07-14") },
  { id: "cp-013", conversationId: "conv-005", userId: "u-owner-001", role: "participant", joinedAt: new Date("2024-07-10"), lastReadAt: new Date("2024-07-13") },
];
