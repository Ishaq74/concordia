import { defineCollection, z } from "astro:content";
import { loadBlogPosts } from "@database/loaders/blog";

const blog = defineCollection({
  loader: loadBlogPosts,
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    lang: z.string(),
    publishedAt: z.date().nullable(),
    readingTime: z.string().nullable(),
    isFeatured: z.boolean().default(false),
    title: z.any(),
    excerpt: z.any(),
    content: z.any(),
    seo: z.object({
      title: z.any().optional(),
      description: z.any().optional(),
      keywords: z.any().optional(),
      canonical: z.any().optional(),
    }).optional(),
    authors: z.array(
      z.object({
        name: z.any(),
        slug: z.string(),
        avatar: z.string().nullable(),
        bio: z.any().optional(),
      })
    ),
    categories: z.array(
      z.object({
        name: z.any(),
        slug: z.string(),
      })
    ),
    cover: z.object({
      url: z.string(),
      alt: z.any().optional(),
      width: z.string().optional().nullable(),
      height: z.string().optional().nullable(),
    }).nullable(),
  }),
});

export const collections = { blog };