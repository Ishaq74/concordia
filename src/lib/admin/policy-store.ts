import { eq } from "drizzle-orm";
import { getDrizzle } from "@database/drizzle";
import { adminRoleDefinition } from "@database/schemas";

export type RolePolicyStatement = Record<string, string[]>;
export type RolePolicyRecord = typeof adminRoleDefinition.$inferSelect;

export type UpsertRolePolicyInput = {
  roleKey: string;
  label?: string | null;
  description?: string | null;
  tone?: "neutral" | "info" | "warning" | "danger" | null;
  highlights?: string[] | null;
  statement: RolePolicyStatement;
  updatedBy?: string | null;
};

const emptyStatement: RolePolicyStatement = {};
const PG_UNDEFINED_TABLE = "42P01";

const POLICY_TABLE_ERROR = "ADMIN_POLICY_TABLE_MISSING";

const isPolicyTableMissing = (error: unknown) => {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string | number }).code?.toString() === PG_UNDEFINED_TABLE,
  );
};

export const ADMIN_POLICY_TABLE_ERROR = POLICY_TABLE_ERROR;

function normalizeStatement(statement: RolePolicyStatement | null | undefined): RolePolicyStatement {
  if (!statement) return emptyStatement;
  const normalized: RolePolicyStatement = {};
  for (const [resource, actions] of Object.entries(statement)) {
    if (!Array.isArray(actions)) continue;
    const safeActions = Array.from(new Set(actions.map((action) => action.trim()).filter(Boolean)));
    if (safeActions.length === 0) continue;
    normalized[resource] = safeActions;
  }
  return normalized;
}

export async function listRolePolicies() {
  const db = await getDrizzle();
  try {
    return await db.select().from(adminRoleDefinition).orderBy(adminRoleDefinition.roleKey);
  } catch (error) {
    if (isPolicyTableMissing(error)) {
      return [];
    }
    throw error;
  }
}

export async function getRolePolicy(roleKey: string) {
  const db = await getDrizzle();
  try {
    const [record] = await db
      .select()
      .from(adminRoleDefinition)
      .where(eq(adminRoleDefinition.roleKey, roleKey));
    return record ?? null;
  } catch (error) {
    if (isPolicyTableMissing(error)) {
      return null;
    }
    throw error;
  }
}

export async function upsertRolePolicy(input: UpsertRolePolicyInput) {
  const statement = normalizeStatement(input.statement);
  const db = await getDrizzle();
  try {
    await db
      .insert(adminRoleDefinition)
      .values({
        roleKey: input.roleKey,
        label: input.label,
        description: input.description,
        tone: input.tone,
        highlights: input.highlights ?? null,
        statement,
        updatedBy: input.updatedBy ?? null,
      })
      .onConflictDoUpdate({
        target: adminRoleDefinition.roleKey,
        set: {
          label: input.label,
          description: input.description,
          tone: input.tone,
          highlights: input.highlights ?? null,
          statement,
          updatedBy: input.updatedBy ?? null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    if (isPolicyTableMissing(error)) {
      throw new Error(POLICY_TABLE_ERROR);
    }
    throw error;
  }
}

export async function deleteRolePolicy(roleKey: string) {
  const db = await getDrizzle();
  try {
    await db.delete(adminRoleDefinition).where(eq(adminRoleDefinition.roleKey, roleKey));
  } catch (error) {
    if (isPolicyTableMissing(error)) {
      throw new Error(POLICY_TABLE_ERROR);
    }
    throw error;
  }
}
