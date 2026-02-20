import type { Loader } from "astro/loaders";

interface EntityWithTranslations {
  slug: string;
  translations: unknown[];
  [key: string]: unknown;
}

interface LoaderFactoryOptions<TRaw, TTranslation, TOutput> {
  fetcher: () => Promise<TRaw[]>;
  transformer: (entity: Omit<TRaw, "translations">, translation: TTranslation) => TOutput;
  langField?: keyof TTranslation;
}

export function createTranslationLoader<
  TRaw extends EntityWithTranslations,
  TTranslation extends Record<string, unknown>,
  TOutput extends Record<string, unknown>
>(options: LoaderFactoryOptions<TRaw, TTranslation, TOutput>): Loader {
  return {
    name: "drizzle-translation-loader",
    load: async ({ store, logger }) => {
      logger.info("🔍 START: Drizzle Translation Loader");
      
      const rawEntities = await options.fetcher();
      logger.info(`📊 Database returned ${rawEntities.length} parent entities.`);

      if (rawEntities.length === 0) {
        logger.warn("⚠️ AUCUNE DONNÉE RECUE DE LA DB. Vérifie ta table 'blog_posts' et le status='published'.");
        return;
      }

      const langKey = options.langField || "inLanguage";
      let totalEntries = 0;

      for (const entity of rawEntities) {
        const { translations, ...entityData } = entity;

        // DEBUG: Vérifier les relations
        if (!translations || !Array.isArray(translations)) {
          logger.error(`❌ Entity ${entity.slug} has no 'translations' property (or it is not an array). Check your drizzle relations!`);
          console.log("Structure reçue pour", entity.slug, ":", Object.keys(entity));
          continue;
        }

        if (translations.length === 0) {
          logger.warn(`⚠️ Entity ${entity.slug} has an EMPTY translations array. Check 'blog_translations' table (post_id matching?).`);
          continue;
        }

        for (const translation of translations) {
          const lang = translation[langKey] as string;
          
          // DEBUG: Vérifier le champ langue
          if (!lang) {
            logger.error(`❌ Missing language key '${String(langKey)}' in translation object.`);
            console.log("Translation object keys:", Object.keys(translation));
            continue;
          }

          try {
            const transformedData = options.transformer(entityData, translation as TTranslation);
            const id = `${entity.slug}-${lang}`;

            store.set({
              id,
              data: {
                ...transformedData,
                slug: entity.slug,
                lang,
              },
            });
            totalEntries++;
          } catch (error) {
            logger.error(`🔥 Error transforming ${entity.slug} (${lang}): ${(error as Error).message}`);
          }
        }
      }

      logger.info(`✅ FINISHED: Created ${totalEntries} localized entries in Astro Content Layer.`);
    },
  };
}