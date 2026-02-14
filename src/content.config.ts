import { defineCollection, z } from "astro:content";
import { placesLoader } from "./database/loaders/places-loader";
import { articlesLoader } from "./database/loaders/articles-loader";
import { eventsLoader } from "./database/loaders/events-loader";
import { categoriesLoader } from "./database/loaders/categories-loader";

// ==================== PLACES ====================

const places = defineCollection({
  loader: placesLoader(),
  schema: z.object({
    slug: z.string(),
    lang: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.string(),
    status: z.string(),
    ownerId: z.string(),
    categoryId: z.string(),
    categoryName: z.string(),
    latitude: z.string().nullable(),
    longitude: z.string().nullable(),
    ratingAvg: z.string().nullable(),
    ratingCount: z.number().nullable(),
    priceRange: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    website: z.string().nullable(),
    address: z
      .object({
        street: z.string().nullable(),
        city: z.string(),
        postcode: z.string().nullable(),
        region: z.string().nullable(),
        country: z.string().nullable(),
      })
      .nullable(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
  }),
});

// ==================== ARTICLES ====================

const articles = defineCollection({
  loader: articlesLoader(),
  schema: z.object({
    slug: z.string(),
    lang: z.string(),
    title: z.string(),
    summary: z.string().nullable(),
    contentJson: z.unknown(),
    authorId: z.string(),
    status: z.string(),
    coverImageUrl: z.string().nullable(),
    publishedAt: z.string().nullable(),
    createdAt: z.string(),
  }),
});

// ==================== EVENTS ====================

const events = defineCollection({
  loader: eventsLoader(),
  schema: z.object({
    slug: z.string(),
    lang: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    type: z.string().nullable(),
    startAt: z.string(),
    endAt: z.string().nullable(),
    maxParticipants: z.number().nullable(),
    isPaid: z.boolean(),
    price: z.string().nullable(),
    createdBy: z.string(),
    categoryId: z.string().nullable(),
    placeId: z.string().nullable(),
    createdAt: z.string(),
  }),
});

// ==================== CATEGORIES ====================

const categories = defineCollection({
  loader: categoriesLoader(),
  schema: z.object({
    slug: z.string(),
    lang: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    type: z.string(),
    parentId: z.string().nullable(),
    icon: z.string().nullable(),
    level: z.number(),
    sortOrder: z.number(),
  }),
});

// ==================== EXPORT ====================

export const collections = {
  places,
  articles,
  events,
  categories,
};
