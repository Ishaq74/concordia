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

export const loadBlogPosts = createTranslationLoader({
  fetcher: async () => {
    const db = await getDrizzle();

    return await db.query.blogPosts.findMany({
      where: (posts, { eq }) => eq(posts.status, "published"),
      with: {
        translations: true,
        authors: { with: { author: { with: { avatar: true } } } },
        categories: { with: { category: true } },
        media: { with: { media: true } }
      }
    });
  },

  transformer: (post, translation: any) => {
    const lang = (translation.inLanguage || "fr").toLowerCase();

    // --- 1. AUTEURS ---
    const seenAuthors = new Set<string>();
    const cleanAuthors = [];

    if (post.authors && Array.isArray(post.authors)) {
      for (const row of post.authors) {
        const author = row.author;
        if (seenAuthors.has(author.slug)) continue;

        seenAuthors.add(author.slug);

        let finalAvatar = author.avatar?.url;

        if (!finalAvatar && author.avatarUrl) {
          if (author.avatarUrl.startsWith('http') || author.avatarUrl.startsWith('/')) {
            finalAvatar = author.avatarUrl;
          } else {
            finalAvatar = `/images/${author.avatarUrl}`;
          }
        }

        cleanAuthors.push({
          slug: author.slug,
          name: getLabel(author.displayName, lang),
          avatar: finalAvatar ?? null,
          bio: getLabel(author.bio, lang),
        });
      }
    }

    // --- 2. CATÉGORIES ---
    const seenCats = new Set<string>();
    const cleanCategories = [];

    if (post.categories && Array.isArray(post.categories)) {
      for (const row of post.categories) {
        const cat = row.category;
        if (seenCats.has(cat.slug)) continue;

        seenCats.add(cat.slug);
        cleanCategories.push({
          slug: cat.slug,
          name: getLabel(cat.name, lang),
        });
      }
    }

    // --- 3. IMAGE ---
    const coverMedia = post.media.find((m) => m.type === "cover" || m.type === "gallery")?.media;

    // --- 4. RETOUR ---
    return {
      id: post.id,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      isFeatured: post.isFeatured,

      title: getLabel(translation.headline, lang),
      excerpt: getLabel(translation.excerpt, lang),
      content: getLabel(translation.articleBody, lang),

      seo: {
        title: getLabel(translation.seoTitle, lang),
        description: getLabel(translation.seoDescription, lang),
        keywords: translation.seoKeywords,
        canonical: getLabel(translation.canonicalUrl, lang)
      },

      authors: cleanAuthors,
      categories: cleanCategories,

      cover: coverMedia ? {
        url: coverMedia.url,
        alt: getLabel(coverMedia.alt, lang),
        width: coverMedia.width,
        height: coverMedia.height
      } : null,
    };
  },

  langField: "inLanguage",
});