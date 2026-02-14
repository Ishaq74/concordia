import type { Loader, LoaderContext } from "astro/loaders";
import { getDrizzle } from "@database/drizzle";
import {
  place,
  placeTranslation,
  categoryTranslation,
  address,
} from "@database/schemas";
import { eq } from "drizzle-orm";

/**
 * Content Layer loader pour les lieux publiés.
 * Génère des entrées id = `${slug}-${lang}` avec nom, description, coordonnées, catégorie.
 */
export function placesLoader(): Loader {
  return {
    name: "concordia-places-loader",
    load: async ({ store, logger }: LoaderContext) => {
      store.clear();
      logger.info("[places-loader] Fetching published places from database...");

      const db = await getDrizzle();

      const places = await db
        .select()
        .from(place)
        .where(eq(place.status, "published"));

      if (places.length === 0) {
        logger.warn("[places-loader] No published places found.");
        return;
      }

      let count = 0;

      for (const p of places) {
        // Fetch translations for this place
        const translations = await db
          .select()
          .from(placeTranslation)
          .where(eq(placeTranslation.placeId, p.id));

        // Fetch address if exists
        let addr = null;
        if (p.addressId) {
          const addrRows = await db
            .select()
            .from(address)
            .where(eq(address.id, p.addressId))
            .limit(1);
          addr = addrRows[0] ?? null;
        }

        // Fetch category translations
        const catTranslations = await db
          .select()
          .from(categoryTranslation)
          .where(eq(categoryTranslation.categoryId, p.categoryId));

        for (const tr of translations) {
          const lang = tr.language;
          const catTr = catTranslations.find((ct) => ct.lang === lang) ?? catTranslations[0];

          store.set({
            id: `${p.slug}-${lang}`,
            data: {
              slug: p.slug,
              lang,
              name: tr.name,
              description: tr.description,
              type: p.type,
              status: p.status,
              ownerId: p.ownerId,
              categoryId: p.categoryId,
              categoryName: catTr?.name ?? "",
              latitude: p.latitude,
              longitude: p.longitude,
              ratingAvg: p.ratingAvg,
              ratingCount: p.ratingCount,
              priceRange: p.priceRange,
              email: p.email,
              phone: p.phone,
              website: p.website,
              address: addr
                ? {
                    street: addr.street,
                    city: addr.city,
                    postcode: addr.postcode,
                    region: addr.region,
                    country: addr.country,
                  }
                : null,
              publishedAt: p.publishedAt?.toISOString() ?? null,
              createdAt: p.createdAt.toISOString(),
            },
          });
          count++;
        }
      }

      logger.info(`[places-loader] Loaded ${count} localized place entries.`);
    },
  };
}
