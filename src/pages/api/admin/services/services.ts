export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, generateId, slugify } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import {
  servicesListings,
  servicesTranslations,
  servicesMediaLinks,
  servicesCategories,
  auditLog,
} from "@database/schemas";
import { eq, desc, ilike, count, inArray, and } from "drizzle-orm";

/**
 * GET /api/admin/services/services
 * List services with filters: q, status, featured, home, category, page, perPage
 * Or fetch single: ?id=xxx
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const orgId = locals.organizationId ?? url.searchParams.get("orgId")?.trim() ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "20")));
  const search = url.searchParams.get("q")?.trim() ?? "";
  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const featured = url.searchParams.get("featured");
  const home = url.searchParams.get("home");
  const categoryId = url.searchParams.get("category")?.trim() ?? "";
  const serviceId = url.searchParams.get("id")?.trim() ?? "";

  // Single service fetch
  if (serviceId) {
    const [service] = await db.select().from(servicesListings).where(eq(servicesListings.id, serviceId));
    if (!service) return json(404, { error: "not_found" });

    const translations = await db
      .select()
      .from(servicesTranslations)
      .where(eq(servicesTranslations.serviceId, serviceId));

    const media = await db
      .select()
      .from(servicesMediaLinks)
      .where(eq(servicesMediaLinks.serviceId, serviceId));

    return json(200, { service, translations, media });
  }

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (orgId) conditions.push(eq(servicesListings.organizationId, orgId));
  if (search) conditions.push(ilike(servicesListings.slug, `%${search}%`));
  if (statusFilter) conditions.push(eq(servicesListings.status, statusFilter));
  if (featured === "true") conditions.push(eq(servicesListings.isFeatured, true));
  if (featured === "false") conditions.push(eq(servicesListings.isFeatured, false));
  if (home === "true") conditions.push(eq(servicesListings.displayInHome, true));
  if (home === "false") conditions.push(eq(servicesListings.displayInHome, false));
  if (categoryId) conditions.push(eq(servicesListings.categoryId, categoryId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(servicesListings).where(whereClause)
    : await db.select({ value: count() }).from(servicesListings);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const services = whereClause
    ? await db.select().from(servicesListings).where(whereClause).orderBy(desc(servicesListings.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(servicesListings).orderBy(desc(servicesListings.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Enrich with translations & category names
  const serviceIds = services.map((s) => s.id);
  const translationsMap = new Map<string, any[]>();

  if (serviceIds.length > 0) {
    const translations = await db
      .select({ serviceId: servicesTranslations.serviceId, title: servicesTranslations.title, inLanguage: servicesTranslations.inLanguage })
      .from(servicesTranslations)
      .where(inArray(servicesTranslations.serviceId, serviceIds));

    translations.forEach((tr) => {
      const list = translationsMap.get(tr.serviceId) ?? [];
      list.push(tr);
      translationsMap.set(tr.serviceId, list);
    });
  }

  // Category names
  const catIds = [...new Set(services.map((s) => s.categoryId).filter(Boolean))] as string[];
  const categoryNameMap = new Map<string, any>();
  if (catIds.length > 0) {
    const cats = await db
      .select({ id: servicesCategories.id, name: servicesCategories.name, slug: servicesCategories.slug })
      .from(servicesCategories)
      .where(inArray(servicesCategories.id, catIds));
    cats.forEach((c) => categoryNameMap.set(c.id, c));
  }

  const enriched = services.map((s) => ({
    ...s,
    translations: translationsMap.get(s.id) ?? [],
    category: s.categoryId ? categoryNameMap.get(s.categoryId) : null,
  }));

  return json(200, { services: enriched, total, page, perPage, totalPages });
};

/**
 * POST /api/admin/services/services
 * Actions: create, update, delete, activate, deactivate
 */
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
  const userId = locals.user?.id ?? "system";

  try {
    // ── CREATE ──
    if (action === "create") {
      const id = generateId();
      const slug = slugify(String(payload.slug || payload.title || id));
      const status = String(payload.status || "draft");
      const inLanguage = String(payload.inLanguage || "fr");

      await db.insert(servicesListings).values({
        id,
        slug,
        categoryId: (payload.categoryId as string) || null,
        providerId: String(payload.providerId || userId),
        organizationId: (payload.organizationId as string) || null,
        status,
        basePrice: (payload.basePrice as string) || null,
        priceType: (payload.priceType as string) || null,
        currency: (payload.currency as string) || "EUR",
        durationMinutes: payload.durationMinutes ? Number(payload.durationMinutes) : null,
        isMobile: Boolean(payload.isMobile),
        maxParticipants: payload.maxParticipants ? Number(payload.maxParticipants) : null,
        bookingAdvanceHours: payload.bookingAdvanceHours ? Number(payload.bookingAdvanceHours) : null,
        cancellationHours: payload.cancellationHours ? Number(payload.cancellationHours) : null,
        isFeatured: Boolean(payload.isFeatured),
        displayInHome: Boolean(payload.displayInHome),
        allowReviews: payload.allowReviews !== false,
        inLanguage,
      });

      // Insert translations
      const translations = payload.translations as any[] | undefined;
      if (translations && Array.isArray(translations)) {
        for (const tr of translations) {
          await db.insert(servicesTranslations).values({
            id: generateId(),
            serviceId: id,
            inLanguage: tr.inLanguage || inLanguage,
            title: tr.title,
            description: tr.description,
            shortDescription: tr.shortDescription || null,
            seoTitle: tr.seoTitle || null,
            seoDescription: tr.seoDescription || null,
          });
        }
      }

      // Insert media links (cover + gallery)
      const media = payload.media as any[] | undefined;
      if (media && Array.isArray(media)) {
        for (const m of media) {
          if (m.mediaId) {
            await db.insert(servicesMediaLinks).values({
              serviceId: id,
              mediaId: m.mediaId,
              type: m.type || "cover",
              position: m.position ?? null,
            });
          }
        }
      }

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service.create",
        targetId: id,
        data: { slug },
        createdAt: new Date(),
      });

      return json(201, { id, slug });
    }

    // ── UPDATE ──
    if (action === "update") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      const updates: Record<string, unknown> = {};
      if (payload.slug !== undefined) updates.slug = slugify(String(payload.slug));
      if (payload.categoryId !== undefined) updates.categoryId = payload.categoryId || null;
      if (payload.status !== undefined) updates.status = String(payload.status);
      if (payload.basePrice !== undefined) updates.basePrice = payload.basePrice;
      if (payload.priceType !== undefined) updates.priceType = payload.priceType;
      if (payload.currency !== undefined) updates.currency = payload.currency;
      if (payload.durationMinutes !== undefined) updates.durationMinutes = Number(payload.durationMinutes);
      if (payload.isMobile !== undefined) updates.isMobile = Boolean(payload.isMobile);
      if (payload.maxParticipants !== undefined) updates.maxParticipants = Number(payload.maxParticipants);
      if (payload.isFeatured !== undefined) updates.isFeatured = Boolean(payload.isFeatured);
      if (payload.displayInHome !== undefined) updates.displayInHome = Boolean(payload.displayInHome);
      if (payload.allowReviews !== undefined) updates.allowReviews = Boolean(payload.allowReviews);
      updates.updatedAt = new Date();

      await db.update(servicesListings).set(updates).where(eq(servicesListings.id, id));

      // Update translations if provided
      const translations = payload.translations as any[] | undefined;
      if (translations && Array.isArray(translations)) {
        for (const tr of translations) {
          if (tr.id) {
            await db.update(servicesTranslations).set({
              title: tr.title,
              description: tr.description,
              shortDescription: tr.shortDescription,
              seoTitle: tr.seoTitle,
              seoDescription: tr.seoDescription,
              updatedAt: new Date(),
            }).where(eq(servicesTranslations.id, tr.id));
          } else {
            await db.insert(servicesTranslations).values({
              id: generateId(),
              serviceId: id,
              inLanguage: tr.inLanguage || "fr",
              title: tr.title,
              description: tr.description,
              shortDescription: tr.shortDescription || null,
              seoTitle: tr.seoTitle || null,
              seoDescription: tr.seoDescription || null,
            });
          }
        }
      }

      // Update media links if provided (replace all)
      const media = payload.media as any[] | undefined;
      if (media && Array.isArray(media)) {
        // Delete existing links
        await db.delete(servicesMediaLinks).where(eq(servicesMediaLinks.serviceId, id));
        // Insert new links
        for (const m of media) {
          if (m.mediaId) {
            await db.insert(servicesMediaLinks).values({
              serviceId: id,
              mediaId: m.mediaId,
              type: m.type || "cover",
              position: m.position ?? null,
            });
          }
        }
      }

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service.update",
        targetId: id,
        data: { fields: Object.keys(updates) },
        createdAt: new Date(),
      });

      return json(200, { updated: true });
    }

    // ── DELETE ──
    if (action === "delete") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      await db.delete(servicesMediaLinks).where(eq(servicesMediaLinks.serviceId, id));
      await db.delete(servicesTranslations).where(eq(servicesTranslations.serviceId, id));
      await db.delete(servicesListings).where(eq(servicesListings.id, id));

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service.delete",
        targetId: id,
        createdAt: new Date(),
      });

      return json(200, { deleted: true });
    }

    // ── ACTIVATE ──
    if (action === "activate") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });
      await db.update(servicesListings).set({ isActive: true, status: "active", updatedAt: new Date() }).where(eq(servicesListings.id, id));
      return json(200, { activated: true });
    }

    // ── DEACTIVATE ──
    if (action === "deactivate") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });
      await db.update(servicesListings).set({ isActive: false, status: "suspended", updatedAt: new Date() }).where(eq(servicesListings.id, id));
      return json(200, { deactivated: true });
    }

    // ── DUPLICATE ──
    if (action === "duplicate") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      const [original] = await db.select().from(servicesListings).where(eq(servicesListings.id, id));
      if (!original) return json(404, { error: "not_found" });

      const newId = generateId();
      const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;

      await db.insert(servicesListings).values({
        ...original,
        id: newId,
        slug: newSlug,
        status: "draft",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Copy translations
      const translations = await db.select().from(servicesTranslations).where(eq(servicesTranslations.serviceId, id));
      if (translations.length > 0) {
        await db.insert(servicesTranslations).values(
          translations.map((tr) => ({ ...tr, id: generateId(), serviceId: newId }))
        );
      }

      // Copy media links
      const mediaLinks = await db.select().from(servicesMediaLinks).where(eq(servicesMediaLinks.serviceId, id));
      if (mediaLinks.length > 0) {
        await db.insert(servicesMediaLinks).values(
          mediaLinks.map((ml) => ({ ...ml, serviceId: newId }))
        );
      }

      await db.insert(auditLog).values({
        id: generateId(),
        userId,
        action: "service.duplicate",
        targetId: newId,
        data: { originalId: id },
        createdAt: new Date(),
      });

      return json(200, { ok: true, id: newId, slug: newSlug });
    }

    return json(400, { error: "unknown_action" });
  } catch (err: any) {
    console.error("[admin/services/services] POST error:", err);
    return json(500, { error: "internal_error", message: err.message });
  }
};
