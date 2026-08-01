import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDrizzle } from "@database/drizzle";
import { blogPosts, blogTranslations } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { storeImageUpload } from "@lib/media/upload";

const LANGUAGES = ['fr', 'en', 'es', 'ar'];

export const blogActions = {
  savePost: defineAction({
    accept: "form",
    handler: async (formData, context) => {
      // only admin users may call this action
      const actingUser = context.locals.user;
      if (!actingUser || actingUser.role !== 'admin') throw new Error("Unauthorized");
      const db = await getDrizzle();
      const submittedId = String(formData.get("id") ?? "").trim();
      if (submittedId && !/^[A-Za-z0-9_-]{1,128}$/.test(submittedId)) {
        throw new Error("INVALID_POST_ID");
      }
      const id = submittedId || nanoid();
      const slug = formData.get("slug") as string;
      
      // GESTION IMAGE (Upload local dans public/uploads)
      const imageFile = formData.get("coverImage") as File;
      
      if (imageFile && imageFile.size > 0) {
        await storeImageUpload(imageFile, "blog");
      }

      return await db.transaction(async (tx) => {
        // 1. Racine
        await tx.insert(blogPosts).values({ id, slug, ownerId: actingUser.id, status: "published", inLanguage: "fr" })
          .onConflictDoUpdate({ target: blogPosts.id, set: { slug, updatedAt: new Date() } });

        // 2. Boucle Langues
        for (const l of LANGUAGES) {
          const headline = formData.get(`headline_${l}`);
          if (!headline) continue;
          
          const data: any = {
            headline: { [l]: headline },
            articleBody: { [l]: formData.get(`content_${l}`) },
            excerpt: { [l]: formData.get(`excerpt_${l}`) || "" },
            updatedAt: new Date()
          }; // excerpt is required by schema

          const exist = await tx.query.blogTranslations.findFirst({
            where: and(eq(blogTranslations.postId, id), eq(blogTranslations.inLanguage, l))
          });

          if (exist) await tx.update(blogTranslations).set(data).where(eq(blogTranslations.id, exist.id));
          else await tx.insert(blogTranslations).values({ id: nanoid(), postId: id, inLanguage: l, ...data });
        }
        return { success: true };
      });
    }
  }),

  changeStatus: defineAction({
    accept: "form",
    input: z.object({ id: z.string(), status: z.string() }),
    handler: async ({ id, status }, context) => {
      const db = await getDrizzle();
      const user = context.locals.user;
      if (!user) throw new Error("UNAUTHORIZED");
      // Publishing status remains an administrator moderation action.
      const post = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
      if (!post) throw new Error("POST_NOT_FOUND");
      if (user.role !== 'admin') {
        throw new Error("FORBIDDEN");
      }
      await db.update(blogPosts).set({ status, updatedAt: new Date() }).where(eq(blogPosts.id, id));
      return { success: true };
    }
  }),

  deletePost: defineAction({
    accept: "form",
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const db = await getDrizzle();
      const user = context.locals.user;
      if (!user) throw new Error("UNAUTHORIZED");
      const post = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
      if (!post) throw new Error("POST_NOT_FOUND");
      if (user.role !== 'admin') {
        throw new Error("FORBIDDEN");
      }
      await db.delete(blogPosts).where(eq(blogPosts.id, id));
      return { success: true };
    }
  })
};