// src/pages/api/admin/translations.ts — Save translation data for blog/services
import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { blogTranslations, servicesTranslations } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export const POST: APIRoute = async ({ request }) => {
  // Auth check
  let userId: string | null = null;
  try {
    const { getAuth } = await import("@lib/auth/auth");
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    userId = session?.user?.id ?? null;
  } catch { /* */ }
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const body = await request.json();
  const { contentType, contentId, locale, fields } = body as {
    contentType: string;
    contentId: string;
    locale: string;
    fields: Record<string, string>;
  };

  if (!contentType || !contentId || !locale || !fields) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const db = await getDrizzle();

  try {
    if (contentType === "blog") {
      const existing = await db.select({ id: blogTranslations.id })
        .from(blogTranslations)
        .where(and(eq(blogTranslations.postId, contentId), eq(blogTranslations.inLanguage, locale)))
        .limit(1);

      const values: Record<string, unknown> = {
        inLanguage: locale,
        postId: contentId,
        updatedAt: new Date(),
      };
      if (fields.title !== undefined) values.headline = fields.title;
      if (fields.excerpt !== undefined) values.excerpt = fields.excerpt;
      if (fields.content !== undefined) values.articleBody = fields.content;

      if (existing.length > 0) {
        await db.update(blogTranslations).set(values).where(eq(blogTranslations.id, existing[0].id));
      } else {
        await db.insert(blogTranslations).values({
          id: randomUUID(),
          ...values,
          createdAt: new Date(),
        } as typeof blogTranslations.$inferInsert);
      }
    } else if (contentType === "services") {
      const existing = await db.select({ id: servicesTranslations.id })
        .from(servicesTranslations)
        .where(and(eq(servicesTranslations.serviceId, contentId), eq(servicesTranslations.inLanguage, locale)))
        .limit(1);

      const values: Record<string, unknown> = {
        inLanguage: locale,
        serviceId: contentId,
        updatedAt: new Date(),
      };
      if (fields.title !== undefined) values.title = fields.title;
      if (fields.description !== undefined) values.description = fields.description;

      if (existing.length > 0) {
        await db.update(servicesTranslations).set(values).where(eq(servicesTranslations.id, existing[0].id));
      } else {
        await db.insert(servicesTranslations).values({
          id: randomUUID(),
          ...values,
          createdAt: new Date(),
        } as typeof servicesTranslations.$inferInsert);
      }
    } else {
      return new Response(JSON.stringify({ error: "Invalid content type" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[translations] Error:", error);
    return new Response(JSON.stringify({ error: "Save failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
