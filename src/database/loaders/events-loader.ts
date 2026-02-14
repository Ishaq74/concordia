import type { Loader, LoaderContext } from "astro/loaders";
import { getDrizzle } from "@database/drizzle";
import { event } from "@database/schemas";

/**
 * Content Layer loader pour les événements.
 * id = `${slug}-${lang}` (les events n'ont pas de traduction séparée pour le moment,
 * donc on utilise une seule langue par défaut).
 */
export function eventsLoader(): Loader {
  return {
    name: "concordia-events-loader",
    load: async ({ store, logger }: LoaderContext) => {
      store.clear();
      logger.info("[events-loader] Fetching published events from database...");

      const db = await getDrizzle();

      const events = await db.select().from(event);

      if (events.length === 0) {
        logger.warn("[events-loader] No published events found.");
        return;
      }

      let count = 0;

      for (const e of events) {
        // Les événements n'ont pas encore de table de traduction,
        // on crée une entrée par langue supportée avec les mêmes données
        const langs = ["fr", "en", "ar", "es"];
        for (const lang of langs) {
          store.set({
            id: `${e.slug}-${lang}`,
            data: {
              slug: e.slug,
              lang,
              title: e.title,
              description: e.description,
              type: e.type,
              startAt: e.startAt.toISOString(),
              endAt: e.endAt?.toISOString() ?? null,
              maxParticipants: e.maxParticipants,
              isPaid: e.isPaid,
              price: e.price,
              createdBy: e.createdBy,
              categoryId: e.categoryId,
              placeId: e.placeId,
              createdAt: e.createdAt.toISOString(),
            },
          });
          count++;
        }
      }

      logger.info(`[events-loader] Loaded ${count} event entries.`);
    },
  };
}
