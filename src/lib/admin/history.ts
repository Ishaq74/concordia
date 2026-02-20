import { desc, eq, ilike, inArray, or } from "drizzle-orm";
import { getDrizzle } from "@database/drizzle";
import { session, user } from "@database/schemas/auth-schema";

export type SessionHistoryEntry = {
  sessionId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date | null;
  expiresAt: Date | null;
  impersonatedBy: string | null;
  impersonatorName: string | null;
  impersonatorEmail: string | null;
};

export async function listSessionHistory(params: { limit?: number; search?: string | null } = {}) {
  const { limit = 50, search } = params;
  const db = await getDrizzle();
  const base = db
    .select({
      sessionId: session.id,
      userId: session.userId,
      userName: user.name,
      userEmail: user.email,
      ip: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      impersonatedBy: session.impersonatedBy,
    })
    .from(session)
    .innerJoin(user, eq(user.id, session.userId));

  const searchTerm = search?.trim();
  const query = searchTerm
    ? base.where(
        or(
          ilike(user.name, `%${searchTerm}%`),
          ilike(user.email, `%${searchTerm}%`),
          ilike(session.ipAddress, `%${searchTerm}%`),
          ilike(session.userAgent, `%${searchTerm}%`),
        ),
      )
    : base;

  const rows = await query.orderBy(desc(session.createdAt)).limit(limit);

  const impersonatorIds = Array.from(
    new Set(rows.map((row) => row.impersonatedBy).filter((value): value is string => Boolean(value))),
  );

  let impersonators: Array<{ id: string; name: string | null; email: string }>; // fallback if none
  if (impersonatorIds.length > 0) {
    impersonators = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(inArray(user.id, impersonatorIds));
  } else {
    impersonators = [];
  }

  const impersonatorMap = new Map(impersonators.map((entry) => [entry.id, entry] as const));

  return rows.map<SessionHistoryEntry>((row) => {
    const impersonatorDetails = row.impersonatedBy ? impersonatorMap.get(row.impersonatedBy) : undefined;
    return {
      ...row,
      impersonatorName: impersonatorDetails?.name ?? null,
      impersonatorEmail: impersonatorDetails?.email ?? null,
    };
  });
}
