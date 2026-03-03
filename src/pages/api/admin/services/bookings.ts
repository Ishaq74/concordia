export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import { servicesBookings, servicesListings, servicesTranslations } from "@database/schemas";
import { user } from "@database/schemas/auth-schema";
import { eq, desc, ilike, count, inArray, and, gte, lte } from "drizzle-orm";

/**
 * GET /api/admin/services/bookings
 * List bookings with filters: q, status, serviceId, page, perPage
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "20")));
  const statusFilter = url.searchParams.get("status")?.trim() ?? "";
  const serviceId = url.searchParams.get("serviceId")?.trim() ?? "";
  const search = url.searchParams.get("q")?.trim() ?? "";
  const dateFrom = url.searchParams.get("from")?.trim() ?? "";
  const dateTo = url.searchParams.get("to")?.trim() ?? "";

  // Build conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (statusFilter) conditions.push(eq(servicesBookings.status, statusFilter));
  if (serviceId) conditions.push(eq(servicesBookings.serviceId, serviceId));
  if (search) conditions.push(ilike(servicesBookings.customerMessage, `%${search}%`));
  if (dateFrom) conditions.push(gte(servicesBookings.bookingDate, dateFrom));
  if (dateTo) conditions.push(lte(servicesBookings.bookingDate, dateTo));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = whereClause
    ? await db.select({ value: count() }).from(servicesBookings).where(whereClause)
    : await db.select({ value: count() }).from(servicesBookings);
  const total = totalResult.value;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const bookings = whereClause
    ? await db.select().from(servicesBookings).where(whereClause).orderBy(desc(servicesBookings.createdAt)).limit(perPage).offset((page - 1) * perPage)
    : await db.select().from(servicesBookings).orderBy(desc(servicesBookings.createdAt)).limit(perPage).offset((page - 1) * perPage);

  // Enrich with service titles
  const svcIds = [...new Set(bookings.map((b) => b.serviceId))];
  const serviceNameMap = new Map<string, string>();
  if (svcIds.length > 0) {
    const services = await db
      .select({ id: servicesListings.id, slug: servicesListings.slug })
      .from(servicesListings)
      .where(inArray(servicesListings.id, svcIds));
    services.forEach((s) => serviceNameMap.set(s.id, s.slug));
  }

  // Enrich with service translations (titles)
  const serviceTitleMap = new Map<string, string>();
  if (svcIds.length > 0) {
    const translations = await db
      .select({ serviceId: servicesTranslations.serviceId, title: servicesTranslations.title, inLanguage: servicesTranslations.inLanguage })
      .from(servicesTranslations)
      .where(inArray(servicesTranslations.serviceId, svcIds));
    translations.forEach((tr) => {
      // Prefer first translation found; pages will pick locale-specific
      if (!serviceTitleMap.has(tr.serviceId)) {
        const title = typeof tr.title === "string" ? tr.title : (tr.title as Record<string, string>)?.fr || Object.values(tr.title as Record<string, string>)[0] || "";
        serviceTitleMap.set(tr.serviceId, title);
      }
    });
  }

  // Enrich with customer info
  const customerIds = [...new Set(bookings.map((b) => b.customerId))];
  const customerMap = new Map<string, { name: string; email: string; image: string | null }>();
  if (customerIds.length > 0) {
    const users = await db
      .select({ id: user.id, name: user.name, email: user.email, image: user.image })
      .from(user)
      .where(inArray(user.id, customerIds));
    users.forEach((u) => customerMap.set(u.id, { name: u.name, email: u.email, image: u.image }));
  }

  const enriched = bookings.map((b) => ({
    ...b,
    serviceSlug: serviceNameMap.get(b.serviceId) ?? "—",
    serviceTitle: serviceTitleMap.get(b.serviceId) ?? "",
    customerName: customerMap.get(b.customerId)?.name ?? "—",
    customerEmail: customerMap.get(b.customerId)?.email ?? "",
    customerImage: customerMap.get(b.customerId)?.image ?? null,
  }));

  return json(200, { bookings: enriched, total, page, perPage, totalPages });
};

/**
 * PATCH /api/admin/services/bookings
 * Update booking status: confirm, cancel, complete, no_show
 */
export const PATCH: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "invalid_body" });
  }

  const id = String(payload.id ?? "").trim();
  const action = String(payload.action ?? "").trim();
  if (!id || !action) return json(400, { error: "missing_id_or_action" });

  const db = await getDrizzle();

  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    switch (action) {
      case "confirm":
        updates.status = "confirmed";
        break;
      case "cancel":
        updates.status = "cancelled_by_provider";
        updates.cancelledAt = new Date();
        break;
      case "complete":
        updates.status = "completed";
        updates.completedAt = new Date();
        break;
      case "no_show":
        updates.status = "no_show";
        break;
      case "respond":
        // Provider responds with a message but doesn't change status
        const response = String(payload.providerResponse ?? "").trim();
        if (!response) return json(400, { error: "missing_response" });
        updates.providerResponse = response;
        break;
      default:
        return json(400, { error: "unknown_action" });
    }

    await db.update(servicesBookings).set(updates).where(eq(servicesBookings.id, id));

    return json(200, { updated: true, status: updates.status });
  } catch (err: any) {
    console.error("[admin/services/bookings] PATCH error:", err);
    return json(500, { error: "internal_error", message: err.message });
  }
};
