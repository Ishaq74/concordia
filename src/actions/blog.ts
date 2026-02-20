import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDrizzle } from "@database/drizzle";
import { blogPosts, blogTranslations, blogPostCategories, blogComments } from "@database/schemas";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";

const LANGUAGES = ['fr', 'en', 'es', 'de'];

export const blogActions = {
  savePost: defineAction({
    accept: "form",
    handler: async (formData, context) => {
      if (!context.locals.isAdmin) throw new Error("Unauthorized");
      const db = await getDrizzle();
      const id = (formData.get("id") as string) || nanoid();
      const slug = formData.get("slug") as string;
      
      // GESTION IMAGE (Upload local dans public/uploads)
      const imageFile = formData.get("coverImage") as File;
      let imagePath = formData.get("existingCover") as string;
      
      if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const fileName = `${id}-${imageFile.name}`;
        await fs.writeFile(path.join(process.cwd(), "public/uploads", fileName), buffer);
        imagePath = `/uploads/${fileName}`;
      }

      return await db.transaction(async (tx) => {
        // 1. Racine
        await tx.insert(blogPosts).values({ id, slug, status: "published", inLanguage: "fr" })
          .onConflictDoUpdate({ target: blogPosts.id, set: { slug, updatedAt: new Date() } });

        // 2. Boucle Langues
        for (const l of LANGUAGES) {
          const headline = formData.get(`headline_${l}`);
          if (!headline) continue;
          
          const data = {
            headline: { [l]: headline },
            articleBody: { [l]: formData.get(`content_${l}`) },
            updatedAt: new Date()
          };

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
      // Vérifie admin ou owner
      const post = await db.query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
      if (!post) throw new Error("POST_NOT_FOUND");
      if (!(user.role === 'admin' || user.id === post.ownerId)) {
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
      if (!(user.role === 'admin' || user.id === post.ownerId)) {
        throw new Error("FORBIDDEN");
      }
      await db.delete(blogPosts).where(eq(blogPosts.id, id));
      return { success: true };
    }
  })
};