// src/pages/api/admin/organizations/profile.ts — CRUD for blogOrganizations (rich org profile)
export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import { blogOrganizations } from "@database/schemas";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const url = new URL(request.url);
  const orgId = url.searchParams.get("id");

  const db = await getDrizzle();

  if (orgId) {
    const [org] = await db.select().from(blogOrganizations).where(eq(blogOrganizations.id, orgId)).limit(1);
    if (!org) return json(404, { error: "not_found" });
    return json(200, { organization: org });
  }

  const orgs = await db.select().from(blogOrganizations);
  return json(200, { organizations: orgs });
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
  if (!action) return json(400, { error: "missing_action" });

  const db = await getDrizzle();

  try {
    if (action === "create") {
      const name = String(payload.name ?? "").trim();
      const slug = String(payload.slug ?? "").trim();
      if (!name || !slug) return json(400, { error: "missing_name_or_slug" });

      const id = crypto.randomUUID();
      await db.insert(blogOrganizations).values({
        id,
        name,
        slug,
        description: payload.description ?? null,
        url: payload.url ? String(payload.url) : null,
        logo: payload.logo ? String(payload.logo) : null,
        image: payload.image ? String(payload.image) : null,
        slogan: payload.slogan ?? null,
        email: payload.email ? String(payload.email) : null,
        telephone: payload.telephone ? String(payload.telephone) : null,
        address: payload.address ?? null,
        legalName: payload.legalName ?? null,
        taxID: payload.taxID ? String(payload.taxID) : null,
        founder: payload.founder ?? null,
        foundingDate: payload.foundingDate ? new Date(String(payload.foundingDate)) : null,
        numberOfEmployees: payload.numberOfEmployees ? Number(payload.numberOfEmployees) : null,
        knowsLanguage: payload.knowsLanguage ?? null,
        knowsAbout: payload.knowsAbout ?? null,
        sameAs: payload.sameAs ?? null,
        areaServed: payload.areaServed ?? null,
        isActive: payload.isActive !== false,
        isFeatured: payload.isFeatured === true,
      });

      return json(201, { organization: { id, name, slug } });
    }

    if (action === "update") {
      const orgId = String(payload.organizationId ?? "").trim();
      if (!orgId) return json(400, { error: "missing_organizationId" });

      const [existing] = await db.select().from(blogOrganizations).where(eq(blogOrganizations.id, orgId)).limit(1);
      if (!existing) return json(404, { error: "not_found" });

      const updates: Record<string, any> = {};
      const textFields = ["name", "slug", "url", "logo", "image", "email", "telephone", "taxID", "vatID",
        "foundingLocation", "nonprofitStatus", "keywords", "parentOrganization",
        "publishingPrinciples", "ethicsPolicy", "correctionsPolicy", "diversityPolicy"];
      const jsonFields = ["description", "slogan", "legalName", "alternateName", "address", "contactPoint",
        "founder", "employee", "alumni", "subOrganization", "department",
        "owns", "brand", "makesOffer", "seeks", "hasOfferCatalog", "areaServed", "serviceArea",
        "award", "hasCredential", "knowsLanguage", "knowsAbout", "memberOf", "sameAs",
        "aggregateRating", "interactionStatistic", "review", "event"];
      const booleanFields = ["isActive", "isFeatured"];
      const intFields = ["numberOfEmployees"];

      for (const f of textFields) {
        if (f in payload) updates[f] = payload[f] ? String(payload[f]) : null;
      }
      for (const f of jsonFields) {
        if (f in payload) updates[f] = payload[f];
      }
      for (const f of booleanFields) {
        if (f in payload) updates[f] = Boolean(payload[f]);
      }
      for (const f of intFields) {
        if (f in payload) updates[f] = payload[f] ? Number(payload[f]) : null;
      }
      if ("foundingDate" in payload) {
        updates.foundingDate = payload.foundingDate ? new Date(String(payload.foundingDate)) : null;
      }

      if (Object.keys(updates).length === 0) return json(400, { error: "no_fields_to_update" });

      await db.update(blogOrganizations).set(updates).where(eq(blogOrganizations.id, orgId));
      return json(200, { ok: true });
    }

    if (action === "toggle-active") {
      const orgId = String(payload.organizationId ?? "").trim();
      if (!orgId) return json(400, { error: "missing_organizationId" });
      const isActive = Boolean(payload.isActive);
      await db.update(blogOrganizations).set({ isActive }).where(eq(blogOrganizations.id, orgId));
      return json(200, { ok: true });
    }

    if (action === "toggle-featured") {
      const orgId = String(payload.organizationId ?? "").trim();
      if (!orgId) return json(400, { error: "missing_organizationId" });
      const isFeatured = Boolean(payload.isFeatured);
      await db.update(blogOrganizations).set({ isFeatured }).where(eq(blogOrganizations.id, orgId));
      return json(200, { ok: true });
    }

    if (action === "delete") {
      const orgId = String(payload.organizationId ?? "").trim();
      if (!orgId) return json(400, { error: "missing_organizationId" });
      await db.delete(blogOrganizations).where(eq(blogOrganizations.id, orgId));
      return json(200, { ok: true });
    }

    return json(400, { error: "unknown_action" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown_error";
    return json(500, { error: msg });
  }
};
