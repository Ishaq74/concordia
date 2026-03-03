import { defineCollection, z } from "astro:content";
import { loadBlogPosts } from "@database/loaders/blog";
import { loadServices } from "@database/loaders/services";

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

const services = defineCollection({
  loader: loadServices,
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    lang: z.string(),
    providerId: z.string(),
    organizationId: z.string().nullable().optional(),
    status: z.string(),
    basePrice: z.string().nullable().optional(),
    priceType: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    durationMinutes: z.number().nullable().optional(),
    isMobile: z.boolean().default(false),
    maxParticipants: z.number().nullable().optional(),
    isFeatured: z.boolean().default(false),
    displayInHome: z.boolean().default(false),
    allowReviews: z.boolean().default(true),
    title: z.any(),
    description: z.any(),
    shortDescription: z.any().optional(),
    seo: z.object({
      title: z.any().optional(),
      description: z.any().optional(),
      keywords: z.any().optional(),
      canonical: z.any().optional(),
    }).optional(),
    category: z.object({
      slug: z.string(),
      name: z.any(),
    }).nullable(),
    cover: z.object({
      url: z.string(),
      alt: z.any().optional(),
      width: z.string().optional().nullable(),
      height: z.string().optional().nullable(),
    }).nullable(),
    gallery: z.array(
      z.object({
        url: z.string(),
        alt: z.any().optional(),
        width: z.string().optional().nullable(),
        height: z.string().optional().nullable(),
      })
    ).optional(),
    reviewCount: z.number().default(0),
    avgRating: z.number().nullable().optional(),
  }),
});

export const collections = { blog, services };