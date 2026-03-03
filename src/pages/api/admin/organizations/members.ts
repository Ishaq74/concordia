// src/pages/api/admin/organizations/members.ts — Member & invitation management
export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminUser } from "@lib/admin/permissions";
import { getDrizzle } from "@database/drizzle";
import { member, invitation, user as userTable } from "@database/schemas/auth-schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@lib/auth/auth";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });

const guardAdmin = (locals: App.Locals) => {
  if (!isAdminUser(locals.user)) return json(403, { error: "forbidden" });
  return null;
};

/* ------- GET — list members + invitations for an org ------- */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const url = new URL(request.url);
  const orgId = url.searchParams.get("organizationId");
  if (!orgId) return json(400, { error: "missing_organizationId" });

  const db = await getDrizzle();

  const [members, invitations] = await Promise.all([
    db.select({
      id: member.id,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
    }).from(member)
      .innerJoin(userTable, eq(member.userId, userTable.id))
      .where(eq(member.organizationId, orgId)),
    db.select().from(invitation).where(eq(invitation.organizationId, orgId)),
  ]);

  return json(200, { members, invitations });
};

/* ------- POST — invite / update role / remove member / cancel invitation ------- */
export const POST: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return json(400, { error: "invalid_body" }); }

  const action = String(payload.action ?? "").trim();
  const orgId = String(payload.organizationId ?? "").trim();
  if (!action) return json(400, { error: "missing_action" });
  if (!orgId) return json(400, { error: "missing_organizationId" });

  const db = await getDrizzle();

  try {
    /* ---------- invite ---------- */
    if (action === "invite") {
      const email = String(payload.email ?? "").trim();
      const role = String(payload.role ?? "member").trim();
      if (!email) return json(400, { error: "missing_email" });

      const result = await (auth!.api as any).createInvitation({
        headers: request.headers,
        body: { organizationId: orgId, email, role },
      });
      return json(200, { invitation: result });
    }

    /* ---------- update role ---------- */
    if (action === "update-role") {
      const memberId = String(payload.memberId ?? "").trim();
      const role = String(payload.role ?? "").trim();
      if (!memberId || !role) return json(400, { error: "missing_memberId_or_role" });

      const result = await (auth!.api as any).updateMemberRole({
        headers: request.headers,
        body: { organizationId: orgId, memberId, role },
      });
      return json(200, { member: result });
    }

    /* ---------- remove member ---------- */
    if (action === "remove-member") {
      const memberId = String(payload.memberId ?? "").trim();
      if (!memberId) return json(400, { error: "missing_memberId" });

      const result = await (auth!.api as any).removeMember({
        headers: request.headers,
        body: { organizationId: orgId, memberIdOrEmail: memberId },
      });
      return json(200, { removed: true, result });
    }

    /* ---------- cancel invitation ---------- */
    if (action === "cancel-invitation") {
      const invitationId = String(payload.invitationId ?? "").trim();
      if (!invitationId) return json(400, { error: "missing_invitationId" });

      await db.delete(invitation).where(and(eq(invitation.id, invitationId), eq(invitation.organizationId, orgId)));
      return json(200, { cancelled: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error: any) {
    const msg = error?.body?.message ?? error?.message ?? "unknown_error";
    const status = typeof error?.status === "number" ? error.status : 500;
    return json(status, { error: msg });
  }
};
