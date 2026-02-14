import type { Loader, LoaderContext } from "astro/loaders";
import { getDrizzle } from "@database/drizzle";
import { article, articleContent } from "@database/schemas";
import { eq } from "drizzle-orm";

/**
 * Content Layer loader pour les articles publiés.
 * Génère des entrées id = `${slug}-${lang}` avec titre, résumé, contenu JSON.
 */
export function articlesLoader(): Loader {
  return {
    name: "concordia-articles-loader",
    load: async ({ store, logger }: LoaderContext) => {
      store.clear();
      logger.info("[articles-loader] Fetching published articles from database...");

      const db = await getDrizzle();

      const articles = await db
        .select()
        .from(article)
        .where(eq(article.status, "published"));

      if (articles.length === 0) {
        logger.warn("[articles-loader] No published articles found.");
        return;
      }

      let count = 0;

      for (const a of articles) {
        const contents = await db
          .select()
          .from(articleContent)
          .where(eq(articleContent.articleId, a.id));

        for (const c of contents) {
          store.set({
            id: `${a.slug}-${c.language}`,
            data: {
              slug: a.slug,
              lang: c.language,
              title: c.title,
              summary: c.summary,
              contentJson: c.contentJson,
              authorId: a.authorId,
              status: a.status,
              coverImageUrl: a.coverImageUrl,
              publishedAt: a.publishedAt?.toISOString() ?? null,
              createdAt: a.createdAt.toISOString(),
            },
          });
          count++;
        }
      }

      logger.info(`[articles-loader] Loaded ${count} localized article entries.`);
    },
  };
}
