import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
} as const;

export const ac = createAccessControl(statement);

export const member = ac.newRole({
  organization: [],
  member: [],
  invitation: [],
});

export const admin = ac.newRole({
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
});

export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
});


export const roles = { owner, admin, member };

// ==================== CONCORDIA EXTENDED RBAC/ABAC ====================

export type AppRole =
  | "citizen"
  | "owner"
  | "author"
  | "mediator"
  | "educator"
  | "moderator"
  | "admin";

export type AppPermission =
  // Auth (existing)
  | "create_user"
  | "delete_user"
  | "delete_organization"
  | "impersonate_user"
  | "read_profile"
  | "update_own_profile"
  | "admin_access"
  | "create_organization"
  | "manage_organization"
  | "invite_member"
  | "remove_member"
  | "read_organization"
  | "create_project"
  | "update_resource"
  | "read_resource"
  | "read_project"
  | "change_role"
  // Places
  | "place.create"
  | "place.read"
  | "place.update_own"
  | "place.update_any"
  | "place.delete_own"
  | "place.delete_any"
  | "place.approve"
  | "place.reject"
  // Articles
  | "article.create"
  | "article.read"
  | "article.update_own"
  | "article.update_any"
  | "article.delete_own"
  | "article.delete_any"
  | "article.approve"
  // Reviews
  | "review.create"
  | "review.read"
  | "review.update_own"
  | "review.delete_own"
  | "review.delete_any"
  // Forum
  | "forum.create_thread"
  | "forum.create_post"
  | "forum.update_own_post"
  | "forum.delete_own_post"
  | "forum.delete_any_post"
  | "forum.pin_thread"
  | "forum.lock_thread"
  // Classifieds
  | "classified.create"
  | "classified.update_own"
  | "classified.delete_own"
  | "classified.delete_any"
  | "classified.approve"
  // Events
  | "event.create"
  | "event.update_own"
  | "event.delete_own"
  | "event.delete_any"
  // Messaging
  | "message.send"
  | "message.read_own"
  // Economy
  | "wallet.read_own"
  | "wallet.credit"
  | "wallet.transfer"
  | "wallet.read_any"
  // Bookings
  | "booking.create"
  | "booking.read_own"
  | "booking.cancel_own"
  | "booking.manage_own_service"
  // Mediation
  | "mediation.create_case"
  | "mediation.assign"
  | "mediation.conduct_session"
  | "mediation.sign_agreement"
  // Education
  | "education.create_module"
  | "education.update_own_module"
  | "education.enroll"
  | "education.delete_any_module"
  // Volunteer
  | "volunteer.create_project"
  | "volunteer.join_task"
  | "volunteer.validate_hours"
  // Funding
  | "funding.create_campaign"
  | "funding.donate"
  // Taxonomy
  | "taxonomy.manage"
  // Moderation
  | "moderation.queue"
  | "moderation.action"
  // Transparency
  | "transparency.read"
  | "transparency.publish_report"
  // Comments
  | "comment.create"
  | "comment.update_own"
  | "comment.delete_own"
  | "comment.delete_any"
  // Services
  | "service.create"
  | "service.update_own"
  | "service.delete_own"
  // Groups
  | "group.create"
  | "group.update_own"
  | "group.delete_own"
  | "group.delete_any"
  // Gallery
  | "gallery.create"
  | "gallery.update_own"
  | "gallery.delete_own"
  | "gallery.delete_any"
  // Products
  | "product.create"
  | "product.update_own"
  | "product.delete_own"
  | "product.delete_any"
  // Notifications
  | "notification.read_own"
  // Favorites
  | "favorite.toggle"
  // Admin
  | "admin.users"
  | "admin.audit"
  | "admin.config";

export type ABACContext = Record<string, unknown>;

const appRbacMatrix: Record<AppRole, Set<AppPermission>> = {
  citizen: new Set([
    "read_profile",
    "update_own_profile",
    "create_organization",
    "place.read",
    "article.read",
    "review.create",
    "review.read",
    "review.update_own",
    "review.delete_own",
    "forum.create_thread",
    "forum.create_post",
    "forum.update_own_post",
    "forum.delete_own_post",
    "classified.create",
    "classified.update_own",
    "classified.delete_own",
    "event.create",
    "event.update_own",
    "event.delete_own",
    "message.send",
    "message.read_own",
    "wallet.read_own",
    "wallet.credit",
    "wallet.transfer",
    "booking.create",
    "booking.read_own",
    "booking.cancel_own",
    "comment.create",
    "comment.update_own",
    "comment.delete_own",
    "service.create",
    "service.update_own",
    "service.delete_own",
    "group.create",
    "group.update_own",
    "group.delete_own",
    "gallery.create",
    "gallery.update_own",
    "gallery.delete_own",
    "product.create",
    "product.update_own",
    "product.delete_own",
    "mediation.create_case",
    "mediation.sign_agreement",
    "education.enroll",
    "volunteer.create_project",
    "volunteer.join_task",
    "volunteer.validate_hours",
    "funding.create_campaign",
    "funding.donate",
    "transparency.read",
    "notification.read_own",
    "favorite.toggle",
  ]),
  owner: new Set([
    "place.create",
    "place.read",
    "place.update_own",
    "place.delete_own",
    "booking.manage_own_service",
  ]),
  author: new Set([
    "article.create",
    "article.read",
    "article.update_own",
    "article.delete_own",
  ]),
  mediator: new Set([
    "mediation.conduct_session",
    "mediation.sign_agreement",
  ]),
  educator: new Set([
    "education.create_module",
    "education.update_own_module",
  ]),
  moderator: new Set([
    "moderation.queue",
    "moderation.action",
    "review.delete_any",
    "comment.delete_any",
    "forum.delete_any_post",
    "forum.pin_thread",
    "forum.lock_thread",
    "classified.delete_any",
    "event.delete_any",
    "group.delete_any",
    "gallery.delete_any",
    "product.delete_any",
  ]),
  admin: new Set([
    "create_user",
    "delete_user",
    "delete_organization",
    "impersonate_user",
    "admin_access",
    "manage_organization",
    "invite_member",
    "remove_member",
    "read_organization",
    "read_profile",
    "update_own_profile",
    "change_role",
    "place.create",
    "place.read",
    "place.update_any",
    "place.delete_any",
    "place.approve",
    "place.reject",
    "article.create",
    "article.read",
    "article.update_any",
    "article.delete_any",
    "article.approve",
    "review.read",
    "review.delete_any",
    "forum.delete_any_post",
    "forum.pin_thread",
    "forum.lock_thread",
    "classified.approve",
    "classified.delete_any",
    "event.delete_any",
    "wallet.read_any",
    "mediation.assign",
    "education.delete_any_module",
    "group.delete_any",
    "gallery.delete_any",
    "product.delete_any",
    "taxonomy.manage",
    "moderation.queue",
    "moderation.action",
    "transparency.publish_report",
    "admin.users",
    "admin.audit",
    "admin.config",
  ]),
};

/**
 * Check if a user with the given roles has a specific permission.
 * Supports multi-role: permissions are the **union** of all assigned roles.
 */
export function hasPermission(
  userRoles: AppRole[],
  permission: AppPermission,
): boolean {
  return userRoles.some((role) => appRbacMatrix[role]?.has(permission));
}

/**
 * ABAC-aware permission check.
 * Combines RBAC role check with contextual (attribute-based) rules.
 */
export async function checkPermission(
  roleOrRoles: AppRole | AppRole[],
  permission: AppPermission,
  context?: ABACContext,
): Promise<boolean> {
  const userRoles = Array.isArray(roleOrRoles)
    ? roleOrRoles
    : [roleOrRoles];

  // Step 1: RBAC check
  if (!hasPermission(userRoles, permission)) {
    return false;
  }

  // Step 2: ABAC contextual rules
  if (!context) return true;

  // Ownership checks for _own permissions
  if (permission.endsWith("_own") || permission.includes("_own_")) {
    if (context.resourceOwnerId && context.userId) {
      return context.resourceOwnerId === context.userId;
    }
  }

  // Self-action prevention
  if (permission === "review.create" || permission === "booking.create") {
    if (context.targetOwnerId && context.userId) {
      if (context.targetOwnerId === context.userId) return false;
    }
  }

  // Temporal editing window
  if (
    permission === "review.update_own" ||
    permission === "forum.update_own_post"
  ) {
    if (context.createdAt) {
      const windowMs =
        permission === "review.update_own" ? 15 * 60 * 1000 : 30 * 60 * 1000;
      const created = new Date(context.createdAt as string).getTime();
      if (Date.now() - created > windowMs) return false;
    }
  }

  // Privilege escalation prevention
  if (permission === "change_role") {
    if (context.targetRole === "admin") return false;
  }

  // Remove member: cannot remove owner
  if (permission === "remove_member") {
    if (context.targetUserRole === "owner") return false;
  }

  return true;
}
