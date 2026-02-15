import { auth } from "@lib/auth/auth";
import {
  loadAdminAccessArtifacts,
  getAdminStatements,
  reloadAdminAccessControl,
  type StatementShape,
} from "@lib/auth/admin-access-control";
import {
  listRolePolicies,
  getRolePolicy as getPersistedRolePolicy,
  upsertRolePolicy,
  deleteRolePolicy,
  ADMIN_POLICY_TABLE_ERROR,
  type RolePolicyRecord,
  type RolePolicyStatement,
  type UpsertRolePolicyInput,
} from "@lib/admin/policy-store";
import { defaultStatements, defaultRoles } from "better-auth/plugins/admin/access";

type MaybeRoleCarrier = {
  role?: string | string[] | null;
  roles?: string | string[] | null;
} | null | undefined;

type RoleTone = "neutral" | "info" | "warning" | "danger";

type RoleStatementsMap = Record<string, StatementShape>;

const defaultRoleStatementsMap: RoleStatementsMap = Object.fromEntries(
  Object.entries(defaultRoles).map(([roleKey, role]) => [roleKey, (role.statements ?? {}) as StatementShape]),
);

const ROLE_PRIORITY = ["superadmin", "admin", "user"];
const ROLE_TONE_OVERRIDES: Record<string, RoleTone> = {
  superadmin: "danger",
  admin: "info",
  user: "neutral",
};

const DEFAULT_ROLE_METADATA: Record<
  string,
  {
    description: string;
    highlights: string[];
    tone?: RoleTone;
  }
> = {
  admin: {
    description: "Rôle administrateur natif Better Auth, avec accès complet aux actions listées dans la doc.",
    highlights: [
      "Crée et liste les comptes",
      "Peut bannir/dé-bannir",
      "Peut gérer les sessions et mots de passe",
    ],
    tone: "info",
  },
  user: {
    description: "Rôle par défaut Better Auth sans droits sur les API d'administration.",
    highlights: [
      "Sign-in classique",
      "Pas d'accès aux opérations admin",
      "Peut recevoir des permissions personnalisées via access control",
    ],
    tone: "neutral",
  },
};

const RESOURCE_METADATA: Record<
  string,
  {
    label: string;
    description: string;
    actions: Record<
      string,
      {
        label: string;
        description: string;
      }
    >;
  }
> = {
  user: {
    label: "Utilisateurs",
    description: "Accès administrateur Better Auth : création, mise à jour, bannissement et suppression de comptes.",
    actions: {
      create: {
        label: "Créer",
        description: "Crée un utilisateur (email, mot de passe, rôle).",
      },
      list: {
        label: "Lister",
        description: "Retourne les comptes (avec recherche/tri Better Auth).",
      },
      "set-role": {
        label: "Assigner un rôle",
        description: "Change la valeur du champ `role` ou `roles` via l'API admin.",
      },
      ban: {
        label: "Bannir",
        description: "Bloque les connexions et révoque les sessions actives.",
      },
      impersonate: {
        label: "Impersoner",
        description: "Crée une session temporaire en se faisant passer pour l'utilisateur ciblé.",
      },
      delete: {
        label: "Supprimer",
        description: "Supprime définitivement un compte utilisateur.",
      },
      "set-password": {
        label: "Mot de passe",
        description: "Réinitialise le mot de passe via l'action `setUserPassword`.",
      },
      get: {
        label: "Consulter",
        description: "Récupère un utilisateur précis côté serveur.",
      },
      update: {
        label: "Mettre à jour",
        description: "Applique des mises à jour ciblées via `adminUpdateUser`.",
      },
    },
  },
  session: {
    label: "Sessions",
    description: "Gestion des tokens Better Auth : lecture et révocation ciblée ou globale.",
    actions: {
      list: {
        label: "Lister",
        description: "Liste les sessions d'un utilisateur.",
      },
      revoke: {
        label: "Révoquer",
        description: "Révoque une session précise via son token.",
      },
      delete: {
        label: "Purger",
        description: "Révoque toutes les sessions associées.",
      },
    },
  },
};

function parseRoleInput(value?: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => parseRoleInput(entry));
  }
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function extractRoleListFromCarrier(user: unknown): string[] {
  if (!user || typeof user !== "object") return [];
  const carrier = user as MaybeRoleCarrier;
  const candidate = carrier.role ?? carrier.roles;
  return parseRoleInput(candidate);
}

export function isAdminUser(user: unknown) {
  return extractRoleListFromCarrier(user).some((entry) => entry.toLowerCase().includes("admin"));
}

export function isSuperAdminUser(user: unknown) {
  return extractRoleListFromCarrier(user).some((entry) => entry.toLowerCase().includes("super"));
}

export function extractRoleList(value?: string | string[] | null) {
  return parseRoleInput(value);
}

export function resolvePrimaryRole(value?: string | string[] | null, fallback = "user") {
  const [first] = parseRoleInput(value);
  return first ?? fallback;
}

export type BasicAdminRole = "member" | "admin" | "superadmin";

export function normalizeRoleKey(value?: string | string[] | null): BasicAdminRole {
  const [first] = parseRoleInput(value);
  if (!first) return "member";
  const normalized = first.toLowerCase();
  if (normalized.includes("super")) return "superadmin";
  if (normalized.includes("admin")) return "admin";
  return "member";
}

export function sortRoleKeys(input: Iterable<string>) {
  const unique = Array.from(new Set(Array.from(input).map((entry) => entry.trim()).filter(Boolean)));
  return unique.sort((a, b) => {
    const normalizedA = a.toLowerCase();
    const normalizedB = b.toLowerCase();
    const priorityA = ROLE_PRIORITY.indexOf(normalizedA);
    const priorityB = ROLE_PRIORITY.indexOf(normalizedB);
    if (priorityA === -1 && priorityB === -1) {
      return normalizedA.localeCompare(normalizedB);
    }
    if (priorityA === -1) return 1;
    if (priorityB === -1) return -1;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return normalizedA.localeCompare(normalizedB);
  });
}

export function formatRoleLabel(key: string) {
  if (!key) return "—";
  return key
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatResourceLabel(key: string) {
  return formatRoleLabel(key);
}

function formatActionLabel(key: string) {
  return formatRoleLabel(key);
}

function inferToneFromKey(key: string) {
  const normalized = key.toLowerCase();
  if (ROLE_TONE_OVERRIDES[normalized]) {
    return ROLE_TONE_OVERRIDES[normalized];
  }
  if (normalized.includes("super")) return "danger" as const;
  if (normalized.includes("admin")) return "info" as const;
  return "neutral" as const;
}

export type RoleDefinition = {
  key: string;
  label: string;
  description: string;
  highlights: string[];
  tone: RoleTone;
};

function createRoleDefinition(key: string, policy?: RolePolicyRecord | null): RoleDefinition {
  const normalized = key.toLowerCase();
  const meta = DEFAULT_ROLE_METADATA[normalized];
  const fallbackDescription = `Rôle Better Auth (${formatRoleLabel(key)}) détecté depuis les champs \`role\`/\`roles\`.`;
  const fallbackHighlights = [
    "Contrôlé via createAccessControl",
    "Paramétrable côté auth.ts",
  ];
  return {
    key,
    label: policy?.label ?? formatRoleLabel(key),
    description: policy?.description ?? meta?.description ?? fallbackDescription,
    highlights: policy?.highlights?.length ? policy.highlights : meta?.highlights ?? fallbackHighlights,
    tone: policy?.tone ?? meta?.tone ?? inferToneFromKey(key),
  };
}

function buildRoleDefinitionList(additionalKeys: Iterable<string>, policies: Iterable<RolePolicyRecord> = []) {
  const policyMap = new Map<string, RolePolicyRecord>();
  for (const policy of policies) {
    policyMap.set(policy.roleKey, policy);
  }
  const baseKeys = Object.keys(defaultRoles);
  const policyKeys = Array.from(policyMap.keys());
  const allKeys = sortRoleKeys([...baseKeys, ...policyKeys, ...additionalKeys]);
  return allKeys.map((key) => createRoleDefinition(key, policyMap.get(key)));
}

export function getRoleDefinitions(additionalKeys: Iterable<string> = []) {
  return buildRoleDefinitionList(additionalKeys);
}

export async function loadRoleDefinitions(additionalKeys: Iterable<string> = []) {
  const policies = await listRolePolicies();
  return buildRoleDefinitionList(additionalKeys, policies);
}

export type PermissionActionDescriptor = {
  key: string;
  action: string;
  label: string;
  description: string;
  roles: string[];
};

export type PermissionModuleDescriptor = {
  key: string;
  label: string;
  description: string;
  actions: PermissionActionDescriptor[];
};

function roleSupports(
  resourceKey: string,
  action: string,
  roleKey: string,
  roleStatements: RoleStatementsMap = defaultRoleStatementsMap,
) {
  const statements = roleStatements[roleKey];
  if (!statements) return false;
  const actions = statements[resourceKey];
  return Array.isArray(actions) ? actions.includes(action) : false;
}

function buildPermissionModules(
  statementMatrix: StatementShape,
  roleStatements: RoleStatementsMap,
): PermissionModuleDescriptor[] {
  const availableRoles = Object.keys(roleStatements);
  return Object.entries(statementMatrix).map(([resourceKey, actions]) => {
    const meta = RESOURCE_METADATA[resourceKey] ?? {
      label: formatResourceLabel(resourceKey),
      description: "Ressource Better Auth",
      actions: {},
    };
    return {
      key: resourceKey,
      label: meta.label,
      description: meta.description,
      actions: actions.map((action) => {
        const actionMeta = meta.actions[action] ?? {
          label: formatActionLabel(action),
          description: "Action Better Auth",
        };
        const roles = availableRoles.filter((roleKey) =>
          roleSupports(resourceKey, action, roleKey, roleStatements),
        );
        return {
          key: `${resourceKey}:${action}`,
          action,
          label: actionMeta.label,
          description: actionMeta.description,
          roles,
        } satisfies PermissionActionDescriptor;
      }),
    } satisfies PermissionModuleDescriptor;
  });
}

export function getPermissionModules(): PermissionModuleDescriptor[] {
  return buildPermissionModules(defaultStatements as StatementShape, defaultRoleStatementsMap);
}

export async function loadPermissionModules(): Promise<PermissionModuleDescriptor[]> {
  const { statements, roles } = await loadAdminAccessArtifacts();
  const dynamicRoleStatements: RoleStatementsMap = Object.fromEntries(
    Object.entries(roles).map(([roleKey, role]) => [roleKey, (role.statements ?? {}) as StatementShape]),
  );
  return buildPermissionModules(statements, dynamicRoleStatements);
}

export type AccessResourceKey = keyof typeof defaultStatements;
export type DefaultRoleKey = keyof typeof defaultRoles;

export { defaultStatements, defaultRoles };

export type RolePolicy = RolePolicyRecord;
export type RolePolicyInput = UpsertRolePolicyInput;
export type { RolePolicyStatement };
export const POLICY_TABLE_MISSING_ERROR = ADMIN_POLICY_TABLE_ERROR;

export async function listRolePolicyDefinitions() {
  return listRolePolicies();
}

export async function getRolePolicy(roleKey: string) {
  return getPersistedRolePolicy(roleKey);
}

export async function saveRolePolicy(input: UpsertRolePolicyInput) {
  await upsertRolePolicy(input);
  const updated = await getPersistedRolePolicy(input.roleKey);
  await reloadAdminAccessControl();
  return updated;
}

export async function removeRolePolicy(roleKey: string) {
  await deleteRolePolicy(roleKey);
  await reloadAdminAccessControl();
}

export async function getPermissionStatementMatrix() {
  return getAdminStatements();
}

export type PermissionCheckInput = {
  userId?: string;
  role?: string;
  permissions: Record<string, string[]>;
};

export async function checkPermissionAccess(headers: Headers, payload: PermissionCheckInput) {
  const { permissions, userId, role } = payload;
  const permissionsEntries = Object.entries(permissions ?? {}).filter(([, actions]) => actions?.length);
  if (permissionsEntries.length === 0) {
    throw new Error("PERMISSIONS_MISSING");
  }

  const userHasPermissionApi = auth.api as Record<string, unknown>;
  const userHasPermissionFn = userHasPermissionApi?.userHasPermission as
    | ((args: { headers: Headers; body: PermissionCheckInput }) => Promise<unknown>)
    | undefined;

  if (typeof userHasPermissionFn !== "function") {
    throw new Error("USER_HAS_PERMISSION_UNAVAILABLE");
  }

  return userHasPermissionFn({
    headers,
    body: {
      permissions: Object.fromEntries(permissionsEntries),
      ...(userId ? { userId } : {}),
      ...(role ? { role } : {}),
    },
  });
}
