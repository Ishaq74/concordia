// src/pages/api/search.ts — Global search API across services, blog, organizations, users
import type { APIRoute } from "astro";
import { getDrizzle } from "@database/drizzle";
import { blogPosts, blogTranslations } from "@database/schemas";
import { servicesListings, servicesTranslations } from "@database/schemas";
import { organization } from "@database/schemas/auth-schema";
import { user as userTable } from "@database/schemas/auth-schema";
import { profile } from "@database/schemas/profile.schema";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get("q") || "").trim();
  const type = url.searchParams.get("type") || "all"; // all, services, blog, organizations, citizens
  const lang = url.searchParams.get("lang") || "fr";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") || "10")));
  const offset = (page - 1) * limit;

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ results: [], total: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const db = await getDrizzle();
  const pattern = `%${q}%`;
  const results: Array<{ type: string; id: string; title: string; description?: string; image?: string; slug?: string; url?: string; meta?: Record<string, unknown> }> = [];

  try {
    // Services search
    if (type === "all" || type === "services") {
      const services = await db
        .select({
          id: servicesListings.id,
          slug: servicesListings.slug,
          price: servicesListings.basePrice,
          currency: servicesListings.currency,
          status: servicesListings.status,
          title: servicesTranslations.title,
          description: servicesTranslations.description,
        })
        .from(servicesListings)
        .leftJoin(servicesTranslations, and(
          eq(servicesTranslations.serviceId, servicesListings.id),
          eq(servicesTranslations.inLanguage, lang),
        ))
        .where(and(
          eq(servicesListings.status, "active"),
          or(
            sql`${servicesTranslations.title}::text ILIKE ${pattern}`,
            sql`${servicesTranslations.description}::text ILIKE ${pattern}`,
            ilike(servicesListings.slug, pattern),
          ),
        ))
        .orderBy(desc(servicesListings.createdAt))
        .limit(type === "all" ? 5 : limit)
        .offset(type === "all" ? 0 : offset);

      for (const s of services) {
        const titleStr = typeof s.title === "string" ? s.title : (s.title as Record<string, string>)?.[lang] ?? "";
        const descStr = typeof s.description === "string" ? s.description : (s.description as Record<string, string>)?.[lang] ?? "";
        results.push({
          type: "service",
          id: s.id,
          title: titleStr || s.slug || "",
          description: descStr.slice(0, 200) || "",
          slug: s.slug || undefined,
          url: `/${lang}/services/${s.slug}`,
          meta: { price: s.price, currency: s.currency },
        });
      }
    }

    // Blog search
    if (type === "all" || type === "blog") {
      const posts = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          status: blogPosts.status,
          publishedAt: blogPosts.publishedAt,
          headline: blogTranslations.headline,
          excerpt: blogTranslations.excerpt,
        })
        .from(blogPosts)
        .leftJoin(blogTranslations, and(
          eq(blogTranslations.postId, blogPosts.id),
          eq(blogTranslations.inLanguage, lang),
        ))
        .where(and(
          eq(blogPosts.status, "published"),
          or(
            sql`${blogTranslations.headline}::text ILIKE ${pattern}`,
            sql`${blogTranslations.excerpt}::text ILIKE ${pattern}`,
            ilike(blogPosts.slug, pattern),
          ),
        ))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(type === "all" ? 5 : limit)
        .offset(type === "all" ? 0 : offset);

      for (const p of posts) {
        const titleStr = typeof p.headline === "string" ? p.headline : (p.headline as Record<string, string>)?.[lang] ?? "";
        const excerptStr = typeof p.excerpt === "string" ? p.excerpt : (p.excerpt as Record<string, string>)?.[lang] ?? "";
        results.push({
          type: "blog",
          id: p.id,
          title: titleStr || p.slug || "",
          description: excerptStr.slice(0, 200) || "",
          slug: p.slug || undefined,
          url: `/${lang}/blog/${p.slug}`,
          meta: { publishedAt: p.publishedAt },
        });
      }
    }

    // Organizations search
    if (type === "all" || type === "organizations") {
      const orgs = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          metadata: organization.metadata,
        })
        .from(organization)
        .where(or(
          ilike(organization.name, pattern),
          ilike(organization.slug, pattern),
        ))
        .orderBy(organization.name)
        .limit(type === "all" ? 5 : limit)
        .offset(type === "all" ? 0 : offset);

      for (const o of orgs) {
        results.push({
          type: "organization",
          id: o.id,
          title: o.name,
          slug: o.slug,
          image: o.logo || undefined,
          url: `/${lang}/organizations/${o.slug}`,
        });
      }
    }

    // Citizens search
    if (type === "all" || type === "citizens") {
      const citizens = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          username: userTable.username,
          image: userTable.image,
          role: userTable.role,
          bio: profile.bio,
          location: profile.location,
        })
        .from(userTable)
        .leftJoin(profile, eq(profile.userId, userTable.id))
        .where(and(
          eq(userTable.banned, false),
          or(
            ilike(userTable.name, pattern),
            ilike(userTable.username, pattern),
            ilike(profile.bio, pattern),
            ilike(profile.location, pattern),
          ),
        ))
        .orderBy(userTable.name)
        .limit(type === "all" ? 5 : limit)
        .offset(type === "all" ? 0 : offset);

      for (const c of citizens) {
        results.push({
          type: "citizen",
          id: c.id,
          title: c.name || c.username || "",
          description: c.bio?.slice(0, 200) || "",
          image: c.image || undefined,
          slug: c.username || undefined,
          url: c.username ? `/${lang}/citizens/${c.username}` : undefined,
          meta: { role: c.role, location: c.location },
        });
      }
    }

    return new Response(JSON.stringify({ results, total: results.length, query: q, type, page }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[search] Error:", error);
    return new Response(JSON.stringify({ error: "Search failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
