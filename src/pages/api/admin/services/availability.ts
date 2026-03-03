export const prerender = false;

import type { APIRoute } from "astro";
import { json, guardAdmin, generateId } from "@lib/admin/api-helpers";
import { getDrizzle } from "@database/drizzle";
import { servicesAvailability } from "@database/schemas";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/admin/services/availability?serviceId=xxx
 * List availability slots for a service
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const guard = guardAdmin(locals);
  if (guard) return guard;

  const db = await getDrizzle();
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId")?.trim() ?? "";

  if (!serviceId) return json(400, { error: "missing_serviceId" });

  const slots = await db
    .select()
    .from(servicesAvailability)
    .where(eq(servicesAvailability.serviceId, serviceId))
    .orderBy(servicesAvailability.dayOfWeek, servicesAvailability.startTime);

  return json(200, { slots });
};

/**
 * POST /api/admin/services/availability
 * Actions: create, update, delete
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

  try {
    // ── CREATE ──
    if (action === "create") {
      const serviceId = String(payload.serviceId ?? "");
      if (!serviceId) return json(400, { error: "missing_serviceId" });

      const id = generateId();
      await db.insert(servicesAvailability).values({
        id,
        serviceId,
        dayOfWeek: Number(payload.dayOfWeek ?? 0),
        startTime: String(payload.startTime ?? "09:00"),
        endTime: String(payload.endTime ?? "17:00"),
        isAvailable: payload.isAvailable !== false,
      });

      return json(201, { id });
    }

    // ── UPDATE ──
    if (action === "update") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      const updates: Record<string, unknown> = {};
      if (payload.dayOfWeek !== undefined) updates.dayOfWeek = Number(payload.dayOfWeek);
      if (payload.startTime !== undefined) updates.startTime = String(payload.startTime);
      if (payload.endTime !== undefined) updates.endTime = String(payload.endTime);
      if (payload.isAvailable !== undefined) updates.isAvailable = Boolean(payload.isAvailable);

      await db.update(servicesAvailability).set(updates).where(eq(servicesAvailability.id, id));

      return json(200, { updated: true });
    }

    // ── DELETE ──
    if (action === "delete") {
      const id = String(payload.id ?? "");
      if (!id) return json(400, { error: "missing_id" });

      await db.delete(servicesAvailability).where(eq(servicesAvailability.id, id));
      return json(200, { deleted: true });
    }

    // ── BULK SET ── (replace all slots for a service)
    if (action === "bulkSet") {
      const serviceId = String(payload.serviceId ?? "");
      if (!serviceId) return json(400, { error: "missing_serviceId" });

      const slots = payload.slots as any[] | undefined;
      if (!slots || !Array.isArray(slots)) return json(400, { error: "missing_slots" });

      // Remove all existing
      await db.delete(servicesAvailability).where(eq(servicesAvailability.serviceId, serviceId));

      // Insert new slots
      for (const slot of slots) {
        await db.insert(servicesAvailability).values({
          id: generateId(),
          serviceId,
          dayOfWeek: Number(slot.dayOfWeek ?? 0),
          startTime: String(slot.startTime ?? "09:00"),
          endTime: String(slot.endTime ?? "17:00"),
          isAvailable: slot.isAvailable !== false,
        });
      }

      return json(200, { set: slots.length });
    }

    return json(400, { error: "unknown_action" });
  } catch (err: any) {
    console.error("[admin/services/availability] POST error:", err);
    return json(500, { error: "internal_error", message: err.message });
  }
};
