import { getDrizzle } from "@database/drizzle";
import { createTranslationLoader } from "./factory";

function getLabel(value: any, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const text = value[lang] || value["en"] || Object.values(value)[0];
    if (typeof text === "string") return text;
    return JSON.stringify(text);
  }
  return String(value);
}

export const loadServices = createTranslationLoader({
  fetcher: async () => {
    const db = await getDrizzle();

    return await db.query.servicesListings.findMany({
      where: (listings, { eq }) => eq(listings.status, "active"),
      with: {
        translations: true,
        category: true,
        media: { with: { media: true } },
        reviews: true,
      },
    });
  },

  transformer: (service, translation: any) => {
    const lang = (translation.inLanguage || "fr").toLowerCase();

    // --- CATÉGORIE ---
    const category = service.category
      ? {
          slug: (service.category as any).slug,
          name: getLabel((service.category as any).name, lang),
        }
      : null;

    // --- IMAGE COVER ---
    const coverLink = (service.media as any[])?.find(
      (m: any) => m.type === "cover"
    );
    const cover = coverLink?.media
      ? {
          url: coverLink.media.url,
          alt: getLabel(coverLink.media.alt, lang),
          width: coverLink.media.width,
          height: coverLink.media.height,
        }
      : null;

    // --- GALLERY ---
    const gallery = (service.media as any[])
      ?.filter((m: any) => m.type === "gallery")
      .map((m: any) => ({
        url: m.media.url,
        alt: getLabel(m.media.alt, lang),
        width: m.media.width,
        height: m.media.height,
      })) ?? [];

    // --- REVIEWS STATS ---
    const approvedReviews = (service.reviews as any[])?.filter(
      (r: any) => r.status === "approved" && !r.parentId
    ) ?? [];
    const avgRating =
      approvedReviews.length > 0
        ? Math.round(
            (approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              approvedReviews.length) *
              10
          ) / 10
        : null;

    return {
      id: service.id,
      providerId: service.providerId,
      organizationId: service.organizationId,
      status: service.status,
      basePrice: service.basePrice,
      priceType: service.priceType,
      currency: service.currency,
      durationMinutes: service.durationMinutes,
      isMobile: service.isMobile,
      maxParticipants: service.maxParticipants,
      isFeatured: service.isFeatured,
      displayInHome: service.displayInHome,
      allowReviews: service.allowReviews,

      title: getLabel(translation.title, lang),
      description: getLabel(translation.description, lang),
      shortDescription: getLabel(translation.shortDescription, lang),

      seo: {
        title: getLabel(translation.seoTitle, lang),
        description: getLabel(translation.seoDescription, lang),
        keywords: translation.seoKeywords,
        canonical: getLabel(translation.canonicalUrl, lang),
      },

      category,
      cover,
      gallery,

      reviewCount: approvedReviews.length,
      avgRating,
    };
  },

  langField: "inLanguage",
});
