import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDrizzle } from "@database/drizzle";
import { blogComments } from "@database/schemas/blog_comments.schema";
import { nanoid } from "nanoid";
import { COMBINED_DANGEROUS } from "@lib/auth/validate-user";

export const commentActions = {
    createComment: defineAction({
        accept: "form",
        input: z.object({
            postId: z.string(),
            postType: z.enum(["blog", "place", "event", "hike", "classified"]),
            parentId: z.string().optional(),
            content: z.string().min(3),
            rating: z.string().optional().transform(v => v ? parseInt(v) : 0),
        }),
        handler: async (input, context) => {
            const user = context.locals.user;
            if (!user) throw new Error("UNAUTHORIZED");

            const db = await getDrizzle();
            const url = context.request.url;
            const localeMatch = url.match(/\/([a-z]{2})\//);
            const lang = localeMatch?.[1] ?? "fr";

            // basic security: reject obviously dangerous content patterns
            if (COMBINED_DANGEROUS.test(input.content)) {
              throw new Error('INVALID_CONTENT');
            }

            await db.insert(blogComments).values({
                id: nanoid(),
                postId: input.postId,
                postType: input.postType,
                parentId: input.parentId || null,
                authorName: user.name || "Anonyme",
                authorEmail: user.email || "",
                content: { [lang]: input.content },
                rating: input.rating || 0,
                status: "pending",
                inLanguage: lang,
            });

            return { success: true };
        },
    }),
};
