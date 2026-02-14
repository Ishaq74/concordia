import type { APIRoute } from "astro";
import { getAuth } from "@lib/auth/auth";
import { getDrizzle } from "@database/drizzle";
import { article, articleContent, articleCategoryLink } from "@database/schemas";
import { eq } from "drizzle-orm";
import { getUserRoles } from "@lib/auth/roles";
import { hasPermission } from "@lib/auth/permissions";
import { createNotification } from "@lib/notifications/notifications";

export const prerender = false;

/** Submit article for review or moderate it. */
export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "AUTH_UNAUTHORIZED" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: "VAL_REQUIRED_FIELD" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { action, reason } = body;

  if (!action || !["submit", "approve", "reject"].includes(action)) {
    return new Response(
      JSON.stringify({ error: "VAL_INVALID_ENUM", field: "action" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const db = await getDrizzle();
  const rows = await db
    .select()
    .from(article)
    .where(eq(article.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "BIZ_NOT_FOUND" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const a = rows[0];
  const roles = await getUserRoles(session.user.id);

  // Submit: author can submit their own draft
  if (action === "submit") {
    if (a.authorId !== session.user.id) {
      return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (a.status !== "draft") {
      return new Response(
        JSON.stringify({ error: "BIZ_INVALID_STATE", message: `Cannot submit from status "${a.status}"` }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validate content exists
    const content = await db
      .select({ id: articleContent.id })
      .from(articleContent)
      .where(eq(articleContent.articleId, a.id))
      .limit(1);

    if (content.length === 0) {
      return new Response(
        JSON.stringify({ error: "BIZ_MISSING_CONTENT", message: "Article must have content before submission" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validate at least 1 category link
    const links = await db
      .select({ articleId: articleCategoryLink.articleId })
      .from(articleCategoryLink)
      .where(eq(articleCategoryLink.articleId, a.id))
      .limit(1);

    if (links.length === 0) {
      return new Response(
        JSON.stringify({ error: "BIZ_MISSING_CATEGORY", message: "Article must have at least one category" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await db.update(article).set({ status: "pending_review" }).where(eq(article.id, a.id));

    return new Response(
      JSON.stringify({ success: true, status: "pending_review" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Approve / Reject: admin only
  if (!hasPermission(roles, "article.approve")) {
    return new Response(JSON.stringify({ error: "AUTH_FORBIDDEN" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (a.status !== "pending_review") {
    return new Response(
      JSON.stringify({ error: "BIZ_INVALID_STATE", message: `Cannot ${action} from status "${a.status}"` }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }

  if (action === "approve") {
    await db
      .update(article)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(article.id, a.id));

    await createNotification({
      userId: a.authorId,
      type: "moderation",
      title: "Article approuvé",
      body: `Votre article "${a.slug}" a été publié.`,
      targetType: "article",
      targetId: a.id,
    });

    return new Response(
      JSON.stringify({ success: true, status: "published" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  // Reject
  if (!reason || reason.trim().length < 5) {
    return new Response(
      JSON.stringify({ error: "VAL_REQUIRED_FIELD", message: "Rejection requires a reason (min 5 chars)" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  await db.update(article).set({ status: "rejected" }).where(eq(article.id, a.id));

  await createNotification({
    userId: a.authorId,
    type: "moderation",
    title: "Article rejeté",
    body: `Votre article "${a.slug}" a été rejeté. Raison : ${reason}`,
    targetType: "article",
    targetId: a.id,
  });

  return new Response(
    JSON.stringify({ success: true, status: "rejected" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
