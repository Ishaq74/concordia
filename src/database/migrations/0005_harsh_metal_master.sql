CREATE TABLE "services_media" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"content_url" text,
	"type" text NOT NULL,
	"encoding_format" text,
	"width" text,
	"height" text,
	"duration" text,
	"license" text,
	"copyright_holder" text,
	"caption" jsonb,
	"description" jsonb,
	"alt" jsonb,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"icon" text,
	"featured_image_id" text,
	"parent_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"display_in_home" boolean DEFAULT false NOT NULL,
	"display_in_menu" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"seo_title" jsonb,
	"seo_description" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_id" text,
	"provider_id" text NOT NULL,
	"organization_id" text,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"base_price" text,
	"price_type" text,
	"currency" text DEFAULT 'EUR',
	"duration_minutes" integer,
	"is_mobile" boolean DEFAULT false NOT NULL,
	"max_participants" integer,
	"booking_advance_hours" integer,
	"cancellation_hours" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_in_home" boolean DEFAULT false NOT NULL,
	"allow_reviews" boolean DEFAULT true NOT NULL,
	"in_language" text DEFAULT 'fr' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services_media_links" (
	"service_id" text NOT NULL,
	"media_id" text NOT NULL,
	"type" text NOT NULL,
	"position" text
);
--> statement-breakpoint
CREATE TABLE "services_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"in_language" text NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"short_description" jsonb,
	"seo_title" jsonb,
	"seo_description" jsonb,
	"seo_keywords" jsonb,
	"canonical_url" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"parent_id" text,
	"author_name" text NOT NULL,
	"author_email" text NOT NULL,
	"author_id" text,
	"content" jsonb NOT NULL,
	"rating" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"in_language" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"booking_date" text NOT NULL,
	"booking_time" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"total_price" text,
	"currency" text DEFAULT 'EUR',
	"status" text DEFAULT 'pending' NOT NULL,
	"customer_message" text,
	"provider_response" text,
	"cancelled_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_services_availability_unique" ON "services_availability" USING btree ("service_id","day_of_week","start_time");