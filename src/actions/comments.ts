import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDrizzle } from "@database/drizzle";
import { blogComments } from "@database/schemas/blog_comments.schema";
import { nanoid } from "nanoid";

export const commentActions = {
    createComment: defineAction({
        accept: "form",
        input: z.object({
            entityId: z.string(),
            entityType: z.enum(["blog", "place", "event", "hike", "classified"]),
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

            await db.insert(blogComments).values({
                id: nanoid(),
                entityId: input.entityId,
                entityType: input.entityType,
                parentId: input.parentId || null,
                authorName: user.name || "Anonyme",
                authorEmail: user.email || "",
                content: { [lang]: input.content },
                rating: input.rating || 0,
                status: "approved", // Auto-approve for now as requested by "marchaient parfaitement"
                inLanguage: lang,
            });

            return { success: true };
        },
    }),
};
