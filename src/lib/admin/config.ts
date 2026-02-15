export const LANGUAGES = ['fr', 'en', 'es', 'de', 'ar', 'zh'] as const;

export const BLOG_RESOURCES = {
  authors: {
    collection: "blogAuthors",
    fields: {
      system: ["slug", "avatarUrl", "email", "website"],
      i18n: ["displayName", "bio", "jobTitle"] // Champs JSONB
    }
  },
  categories: {
    collection: "blogCategories",
    fields: {
      system: ["slug", "parentId", "displayInHome", "displayInMenu", "isFeatured"],
      i18n: ["name", "description", "seoTitle", "seoDescription"] // Champs JSONB
    }
  },
  posts: {
    collection: "blogPosts",
    fields: {
      system: ["slug", "status", "publishedAt", "readingTime", "isFeatured"],
      i18nTable: true // Spécifie qu'on utilise blog_translations
    }
  }
};