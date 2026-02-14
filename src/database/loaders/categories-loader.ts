import type { Loader, LoaderContext } from "astro/loaders";
import { getDrizzle } from "@database/drizzle";
import { category, categoryTranslation } from "@database/schemas";
import { eq } from "drizzle-orm";

/**
 * Content Layer loader pour les catégories actives.
 * id = `${slug}-${lang}` avec nom et description traduits.
 */
export function categoriesLoader(): Loader {
  return {
    name: "concordia-categories-loader",
    load: async ({ store, logger }: LoaderContext) => {
      store.clear();
      logger.info("[categories-loader] Fetching active categories from database...");

      const db = await getDrizzle();

      const categories = await db
        .select()
        .from(category)
        .where(eq(category.isActive, true));

      if (categories.length === 0) {
        logger.warn("[categories-loader] No active categories found.");
        return;
      }

      let count = 0;

      for (const cat of categories) {
        const translations = await db
          .select()
          .from(categoryTranslation)
          .where(eq(categoryTranslation.categoryId, cat.id));

        for (const tr of translations) {
          store.set({
            id: `${cat.slug}-${tr.lang}`,
            data: {
              slug: cat.slug,
              lang: tr.lang,
              name: tr.name,
              description: tr.description,
              type: cat.type,
              parentId: cat.parentId,
              icon: cat.icon,
              level: cat.level,
              sortOrder: cat.sortOrder,
            },
          });
          count++;
        }
      }

      logger.info(`[categories-loader] Loaded ${count} localized category entries.`);
    },
  };
}
