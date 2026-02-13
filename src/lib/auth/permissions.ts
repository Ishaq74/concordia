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

// RBAC/ABAC checkPermission implementation

// Types for RBAC/ABAC
export type Role = 'admin' | 'user' | 'owner' | 'member';
export type Permission =
  | 'create_user'
  | 'delete_user'
  | 'delete_organization'
  | 'impersonate_user'
  | 'read_profile'
  | 'update_own_profile'
  | 'admin_access'
  | 'create_organization'
  | 'manage_organization'
  | 'invite_member'
  | 'remove_member'
  | 'read_organization'
  | 'create_project'
  | 'update_resource'
  | 'read_resource'
  | 'read_project'
  | 'change_role';
export type ABACContext = Record<string, any>;

const rbacMatrix: Record<string, Record<string, boolean>> = {
  admin: {
    create_user: true,
    delete_user: true,
    delete_organization: true,
    impersonate_user: true,
    admin_access: true,
    create_organization: true,
    manage_organization: true,
    invite_member: true,
    remove_member: true,
    read_profile: true,
    update_own_profile: true,
    read_organization: true,
    create_project: true,
    update_resource: true,
    read_resource: true,
    read_project: true,
    change_role: true,
  },
  user: {
    read_profile: true,
    update_own_profile: true,
    create_organization: true,
    delete_user: false,
    admin_access: false,
    create_user: false,
    delete_organization: false,
    impersonate_user: false,
    manage_organization: false,
    invite_member: false,
    remove_member: false,
    read_organization: false,
    create_project: false,
    update_resource: false,
    read_resource: false,
    read_project: false,
    change_role: false,
  },
  owner: {
    manage_organization: true,
    delete_organization: true,
    invite_member: true,
    remove_member: true,
    admin_access: false,
    update_resource: true,
    read_resource: true,
    read_project: true,
    create_project: true,
    read_organization: true,
    change_role: false,
  },
  member: {
    read_organization: true,
    create_project: true,
    delete_organization: false,
    update_resource: false,
    read_resource: false,
    read_project: false,
    manage_organization: false,
    invite_member: false,
    remove_member: false,
    admin_access: false,
    change_role: false,
  },
};

export async function checkPermission(role: Role, permission: Permission, context?: ABACContext): Promise<boolean> {
  // Deny if role or permission is not defined
  if (!rbacMatrix[role]) throw new Error("Unknown role");
  if (!(permission in rbacMatrix[role])) throw new Error("Unknown permission");

  // ABAC logic for specific permissions
  if (permission === "update_resource") {
    if (!context) throw new Error("context required for ABAC");
    return context.resourceOwnerId && context.userId && context.resourceOwnerId === context.userId;
  }
  if (permission === "read_resource") {
    if (!context) throw new Error("context required for ABAC");
    return true;
  }
  if (permission === "read_project") {
    if (!context) throw new Error("context required for ABAC");
    return context.orgId && context.resourceOrgId && context.orgId === context.resourceOrgId;
  }
  if (permission === "admin_access") {
    if (!context) throw new Error("context required for ABAC");
    if (context.hour !== undefined) return context.hour >= 9 && context.hour < 18;
    if (context.ip !== undefined) return context.ip.startsWith("10.");
    return true;
  }
  if (permission === "change_role") {
    if (!context || context.targetRole === "admin") throw new Error("Privilege escalation denied");
    return false;
  }
  if (permission === "remove_member") {
    if (context && context.targetUserRole === "owner") return false;
  }

  return rbacMatrix[role][permission] ?? false;
}
