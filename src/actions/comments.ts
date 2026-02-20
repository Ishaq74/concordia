import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDrizzle } from "@database/drizzle";
import { comments } from "@database/schemas/comments.schema";
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
            const lang = context.locals.lang || "fr";

            await db.insert(comments).values({
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
