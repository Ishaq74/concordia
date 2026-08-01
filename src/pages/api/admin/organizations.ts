export const prerender = false;

import type { APIRoute } from "astro";
import { isAdminUser } from "@lib/admin/permissions";
import {
  listOrganizations,
  createOrganization,
  listOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  setActiveOrganization,
} from "@lib/admin/organizations";

const json = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const guardAdmin = (locals: App.Locals) => {
  if (!isAdminUser(locals.user)) {
    return json(403, { error: "forbidden" });
  }
  return null;
};

const resolveErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error && "status" in error) {
    const status = Number((error as { status?: number }).status);
    if (Number.isInteger(status) && status >= 100 && status <= 599) {
      return status;
    }
  }
  return 500;
};

const resolveErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error) {
    if ("message" in error && typeof (error as { message?: string }).message === "string") {
      return (error as { message?: string }).message ?? "unknown_error";
    }
    if ("body" in error) {
      const body = (error as { body?: { error?: string; message?: string } }).body;
      if (body?.error) return body.error;
      if (body?.message) return body.message;
    }
  }
  return "unknown_error";
};

const cleanQuery = (url: URL, excludedKeys: string[]) => {
  const queryEntries = Array.from(url.searchParams.entries()).filter(([key]) => !excludedKeys.includes(key));
  return Object.fromEntries(queryEntries);
};

export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");
  const includeMembers = url.searchParams.get("includeMembers") === "true";

  try {
    if (organizationId) {
      const [organizations, members] = await Promise.all([
        listOrganizations(request.headers, {}),
        listOrganizationMembers(request.headers, organizationId),
      ]);

      const organization = Array.isArray(organizations)
        ? organizations.find((entry) => entry.id === organizationId)
        : null;

      return json(200, {
        organization: organization ?? null,
        members,
      });
    }

    const query = cleanQuery(url, ["organizationId", "includeMembers"]);
    const organizations = await listOrganizations(request.headers, query);

    if (includeMembers && Array.isArray(organizations)) {
      const enriched = await Promise.all(
        organizations.map(async (organization) => {
          try {
            const members = await listOrganizationMembers(request.headers, organization.id);
            return { ...organization, members: members.members };
          } catch {
            return { ...organization, members: [] };
          }
        }),
      );

      return json(200, { organizations: enriched });
    }

    return json(200, { organizations });
  } catch (error) {
    return json(resolveErrorStatus(error), { error: resolveErrorMessage(error) });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "invalid_body" });
  }

  const action = String(payload.action ?? "").trim();
  if (!action) {
    return json(400, { error: "missing_action" });
  }

  try {
    if (action === "create") {
      const name = String(payload.name ?? "").trim();
      const slug = String(payload.slug ?? "").trim();
      if (!name || !slug) {
        return json(400, { error: "missing_name_or_slug" });
      }
      const created = await createOrganization(request.headers, { name, slug });
      return json(200, { organization: created });
    }

    const organizationId = payload.organizationId ? String(payload.organizationId).trim() : "";
    if (!organizationId) {
      return json(400, { error: "missing_organizationId" });
    }

    if (action === "add-member") {
      const userId = payload.userId ? String(payload.userId).trim() : "";
      const role = String(payload.role ?? "").trim();
      if (!userId || !role) {
        return json(400, { error: "missing_userId_or_role" });
      }
      const member = await addOrganizationMember(request.headers, {
        organizationId,
        userId,
        role,
      });
      return json(200, { member });
    }

    if (action === "update-member") {
      const memberId = payload.memberId ? String(payload.memberId).trim() : "";
      const role = String(payload.role ?? "").trim();
      if (!memberId || !role) {
        return json(400, { error: "missing_memberId_or_role" });
      }
      const member = await updateOrganizationMember(request.headers, {
        organizationId,
        memberId,
        role,
      });
      return json(200, { member });
    }

    if (action === "set-active") {
      await setActiveOrganization(request.headers, organizationId);
      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    return json(resolveErrorStatus(error), { error: resolveErrorMessage(error) });
  }
};
