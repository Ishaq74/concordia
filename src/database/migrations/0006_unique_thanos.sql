CREATE TYPE "public"."app_role" AS ENUM('citizen', 'owner', 'author', 'mediator', 'educator', 'moderator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit', 'commission', 'refund', 'donation', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('review', 'message', 'booking', 'moderation', 'mediation', 'system', 'donation', 'education', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."image_content_type" AS ENUM('place', 'article', 'profile', 'event', 'trail', 'classified');--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('place', 'magazine', 'forum', 'classified', 'service', 'education', 'project');--> statement-breakpoint
CREATE TYPE "public"."attribute_value_type" AS ENUM('text', 'number', 'boolean', 'select', 'multi_select');--> statement-breakpoint
CREATE TYPE "public"."place_status" AS ENUM('pending_review', 'published', 'archived', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."place_type" AS ENUM('restaurant', 'hotel', 'camping', 'commerce', 'admin', 'activity', 'poi', 'trail', 'balade', 'randonnee', 'velo');--> statement-breakpoint
CREATE TYPE "public"."price_range" AS ENUM('low', 'medium', 'high', 'luxury');--> statement-breakpoint
CREATE TYPE "public"."trail_difficulty" AS ENUM('easy', 'moderate', 'hard');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('published', 'moderated', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'pending_review', 'published', 'archived', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."comment_status" AS ENUM('published', 'moderated', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."comment_target_type" AS ENUM('article', 'place', 'trail', 'event', 'product');--> statement-breakpoint
CREATE TYPE "public"."event_payment_status" AS ENUM('pending', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."event_registration_status" AS ENUM('registered', 'cancelled', 'attended', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('culture', 'sport', 'marche', 'local', 'asso', 'education', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."forum_post_status" AS ENUM('published', 'moderated', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."forum_thread_status" AS ENUM('published', 'closed', 'moderated', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."classified_condition" AS ENUM('new', 'used', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."classified_status" AS ENUM('pending_review', 'active', 'sold', 'expired', 'archived', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled_by_client', 'cancelled_by_provider', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."local_service_status" AS ENUM('active', 'pending_review', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."conversation_type" AS ENUM('direct', 'group', 'classified_contact', 'mediation');--> statement-breakpoint
CREATE TYPE "public"."mediation_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."mediation_session_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."mediation_status" AS ENUM('opened', 'assigned', 'in_progress', 'resolved', 'failed', 'closed');--> statement-breakpoint
CREATE TYPE "public"."education_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."education_enrollment_status" AS ENUM('active', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."education_lesson_type" AS ENUM('text', 'video', 'exercise', 'quiz');--> statement-breakpoint
CREATE TYPE "public"."education_module_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."volunteer_participation_status" AS ENUM('signed_up', 'confirmed', 'completed', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."volunteer_project_status" AS ENUM('draft', 'recruiting', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."volunteer_task_status" AS ENUM('open', 'filled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."funding_campaign_status" AS ENUM('draft', 'active', 'funded', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."impact_metric_type" AS ENUM('projects_completed', 'volunteer_hours', 'funds_raised', 'mediations_resolved', 'lessons_completed', 'active_citizens', 'resources_shared');--> statement-breakpoint
CREATE TYPE "public"."transparency_report_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."gallery_media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"full_name" text,
	"bio" text,
	"avatar_url" text,
	"location" text,
	"website" text,
	"preferred_language" text DEFAULT 'fr' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profile_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" "app_role" NOT NULL,
	"granted_by" text,
	"granted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"reference_type" text,
	"reference_id" text,
	"idempotency_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"target_type" text,
	"target_id" text,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image" (
	"id" text PRIMARY KEY NOT NULL,
	"uploaded_by" text NOT NULL,
	"content_type" "image_content_type" NOT NULL,
	"content_id" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"alt_text" text,
	"width" integer,
	"height" integer,
	"size_bytes" integer,
	"mime_type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"slug" text NOT NULL,
	"type" "category_type" NOT NULL,
	"icon" text,
	"level" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"lang" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tag_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"tag_id" text NOT NULL,
	"lang" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_def_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"attribute_definition_id" text NOT NULL,
	"lang" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "attribute_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"value_type" "attribute_value_type" NOT NULL,
	"possible_values" text[],
	"applicable_category_ids" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attribute_definition_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" text PRIMARY KEY NOT NULL,
	"street" text,
	"city" text NOT NULL,
	"postcode" text,
	"region" text,
	"country" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"category_id" text NOT NULL,
	"slug" text NOT NULL,
	"type" "place_type" NOT NULL,
	"address_id" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"email" text,
	"phone" text,
	"website" text,
	"open_hours" jsonb,
	"accessibility" text[],
	"audience" text[],
	"price_range" "price_range",
	"rating_avg" numeric(2, 1),
	"rating_count" integer DEFAULT 0 NOT NULL,
	"status" "place_status" DEFAULT 'pending_review' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "place_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "place_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"language" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place_attribute_value" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"attribute_id" text NOT NULL,
	"value_boolean" boolean,
	"value_string" text,
	"value_integer" integer,
	"value_decimal" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "place_tag" (
	"place_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "place_tag_place_id_tag_id_pk" PRIMARY KEY("place_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "accommodation_detail" (
	"place_id" text PRIMARY KEY NOT NULL,
	"stars" integer,
	"accommodation_type" text,
	"capacity" integer,
	"pets_allowed" boolean,
	"pool" boolean,
	"spa" boolean,
	"family_rooms" boolean,
	"booking_url" text,
	"availability" jsonb
);
--> statement-breakpoint
CREATE TABLE "activity_detail" (
	"place_id" text PRIMARY KEY NOT NULL,
	"duration_min" integer,
	"min_age" integer,
	"max_age" integer,
	"price_min" text,
	"price_max" text,
	"seasons" text[]
);
--> statement-breakpoint
CREATE TABLE "gastronomy_detail" (
	"place_id" text PRIMARY KEY NOT NULL,
	"cuisine" text,
	"price_range" text,
	"takeaway" boolean,
	"delivery" boolean,
	"vegan" boolean,
	"brunch" boolean,
	"seating_capacity" integer
);
--> statement-breakpoint
CREATE TABLE "professional" (
	"place_id" text PRIMARY KEY NOT NULL,
	"siret" text,
	"sector" text,
	"emergency_support" boolean DEFAULT false NOT NULL,
	"emergency_phone" text
);
--> statement-breakpoint
CREATE TABLE "poi" (
	"id" text PRIMARY KEY NOT NULL,
	"trail_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"km_marker" numeric(6, 2)
);
--> statement-breakpoint
CREATE TABLE "trail" (
	"id" text PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"difficulty" "trail_difficulty",
	"distance_km" numeric(6, 2),
	"duration_min" integer,
	"ascent_m" integer,
	"descent_m" integer,
	"loop" boolean DEFAULT false NOT NULL,
	"gpx_url" text,
	"type" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trail_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"author_id" text NOT NULL,
	"parent_review_id" text,
	"title" text,
	"content" text NOT NULL,
	"rating" numeric(2, 1),
	"status" "review_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_rating" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"criterion" text NOT NULL,
	"score" numeric(2, 1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"cover_image_url" text,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "article_category_link" (
	"article_id" text NOT NULL,
	"category_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_category_link_article_id_category_id_pk" PRIMARY KEY("article_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "article_content" (
	"id" text PRIMARY KEY NOT NULL,
	"article_id" text NOT NULL,
	"content_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"language" text DEFAULT 'fr' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_place_comparison" (
	"id" text PRIMARY KEY NOT NULL,
	"article_id" text NOT NULL,
	"place_ids" text[] NOT NULL,
	"comparison_criteria" text[] NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_place_link" (
	"article_id" text NOT NULL,
	"place_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_place_link_article_id_place_id_pk" PRIMARY KEY("article_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"parent_comment_id" text,
	"target_type" "comment_target_type" NOT NULL,
	"article_id" text,
	"place_id" text,
	"trail_id" text,
	"event_id" text,
	"product_id" text,
	"content" text NOT NULL,
	"status" "comment_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"category_id" text,
	"place_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" "event_type",
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"max_participants" integer,
	"registration_deadline" timestamp,
	"is_paid" boolean DEFAULT false NOT NULL,
	"price" numeric(12, 2),
	"recurrence_rule" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_registration" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "event_registration_status" DEFAULT 'registered' NOT NULL,
	"amount_paid" numeric(12, 2),
	"payment_status" "event_payment_status",
	"payment_reference" text,
	"registered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_post" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"author_id" text NOT NULL,
	"parent_post_id" text,
	"content" text NOT NULL,
	"status" "forum_post_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_thread" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"status" "forum_thread_status" DEFAULT 'published' NOT NULL,
	"last_post_at" timestamp,
	"post_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classified" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"seller_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(12, 2),
	"condition" "classified_condition",
	"location" text,
	"status" "classified_status" DEFAULT 'pending_review' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"service_id" text NOT NULL,
	"booking_date" date NOT NULL,
	"booking_time" time NOT NULL,
	"duration_minutes" integer NOT NULL,
	"total_price" numeric(12, 2),
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"customer_message" text,
	"provider_response" text,
	"payment_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_service" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"provider_id" text NOT NULL,
	"place_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"base_price" numeric(12, 2),
	"price_type" text,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"duration_minutes" integer,
	"is_mobile" boolean DEFAULT false NOT NULL,
	"max_participants" integer,
	"booking_advance_hours" integer,
	"cancellation_hours" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" "local_service_status" DEFAULT 'pending_review' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"producer_id" text,
	"is_local" boolean DEFAULT true NOT NULL,
	"season_start" integer,
	"season_end" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "conversation_type" DEFAULT 'direct' NOT NULL,
	"subject" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'participant' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "group_member" (
	"group_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "group_member_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "mediation_agreement" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"content" text NOT NULL,
	"actions" jsonb,
	"signed_by_reporter" boolean DEFAULT false NOT NULL,
	"signed_by_reported" boolean DEFAULT false NOT NULL,
	"signed_by_mediator" boolean DEFAULT false NOT NULL,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mediation_agreement_case_id_unique" UNIQUE("case_id")
);
--> statement-breakpoint
CREATE TABLE "mediation_case" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_user_id" text,
	"mediator_id" text,
	"related_entity_type" text,
	"related_entity_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"priority" "mediation_priority" DEFAULT 'normal' NOT NULL,
	"status" "mediation_status" DEFAULT 'opened' NOT NULL,
	"resolution" text,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"assigned_at" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mediation_session" (
	"id" text PRIMARY KEY NOT NULL,
	"case_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"type" text DEFAULT 'video' NOT NULL,
	"notes" text,
	"outcome" text,
	"status" "mediation_session_status" DEFAULT 'scheduled' NOT NULL,
	"conversation_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "education_enrollment_status" DEFAULT 'active' NOT NULL,
	"progress_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"completed_at" timestamp,
	"payment_transaction_id" text,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"type" "education_lesson_type" DEFAULT 'text' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"estimated_minutes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_module" (
	"id" text PRIMARY KEY NOT NULL,
	"educator_id" text NOT NULL,
	"category_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"difficulty" "education_difficulty" DEFAULT 'beginner' NOT NULL,
	"estimated_duration_hours" numeric(5, 1),
	"is_free" boolean DEFAULT true NOT NULL,
	"price" numeric(12, 2),
	"lesson_count" integer DEFAULT 0 NOT NULL,
	"enrollment_count" integer DEFAULT 0 NOT NULL,
	"status" "education_module_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "education_module_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "education_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"score" numeric(5, 1),
	"time_spent_seconds" integer,
	"completed_at" timestamp,
	"started_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_participation" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "volunteer_participation_status" DEFAULT 'signed_up' NOT NULL,
	"hours_logged" numeric(5, 1),
	"feedback" text,
	"signed_up_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "volunteer_project" (
	"id" text PRIMARY KEY NOT NULL,
	"coordinator_id" text NOT NULL,
	"category_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"start_date" date,
	"end_date" date,
	"volunteer_goal" integer,
	"volunteer_count" integer DEFAULT 0 NOT NULL,
	"funding_goal" numeric(12, 2),
	"funding_raised" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"status" "volunteer_project_status" DEFAULT 'draft' NOT NULL,
	"impact_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "volunteer_project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "volunteer_task" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"required_skills" text[],
	"max_volunteers" integer,
	"current_volunteers" integer DEFAULT 0 NOT NULL,
	"scheduled_date" date,
	"estimated_hours" numeric(5, 1),
	"status" "volunteer_task_status" DEFAULT 'open' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"donor_id" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"message" text,
	"transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funding_campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"project_id" text,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"goal_amount" numeric(12, 2) NOT NULL,
	"raised_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"donor_count" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"deadline" date NOT NULL,
	"status" "funding_campaign_status" DEFAULT 'draft' NOT NULL,
	"funded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funding_campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "impact_metric" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "impact_metric_type" NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"scope" text DEFAULT 'global' NOT NULL,
	"metadata" jsonb,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transparency_report" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content_json" jsonb NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"metric_ids" text[],
	"published_by" text NOT NULL,
	"status" "transparency_report_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transparency_report_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_item" (
	"id" text PRIMARY KEY NOT NULL,
	"gallery_id" text NOT NULL,
	"media_url" text NOT NULL,
	"media_type" "gallery_media_type" DEFAULT 'image' NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_commission" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"flat_fee" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"applies_to" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_commission_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translation" ADD CONSTRAINT "category_translation_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_translation" ADD CONSTRAINT "tag_translation_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attribute_def_translation" ADD CONSTRAINT "attribute_def_translation_attribute_definition_id_attribute_definition_id_fk" FOREIGN KEY ("attribute_definition_id") REFERENCES "public"."attribute_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_translation" ADD CONSTRAINT "place_translation_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_attribute_value" ADD CONSTRAINT "place_attribute_value_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_attribute_value" ADD CONSTRAINT "place_attribute_value_attribute_id_attribute_definition_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attribute_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_tag" ADD CONSTRAINT "place_tag_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_tag" ADD CONSTRAINT "place_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accommodation_detail" ADD CONSTRAINT "accommodation_detail_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_detail" ADD CONSTRAINT "activity_detail_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastronomy_detail" ADD CONSTRAINT "gastronomy_detail_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional" ADD CONSTRAINT "professional_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi" ADD CONSTRAINT "poi_trail_id_trail_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trail"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail" ADD CONSTRAINT "trail_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_rating" ADD CONSTRAINT "sub_rating_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_category_link" ADD CONSTRAINT "article_category_link_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_category_link" ADD CONSTRAINT "article_category_link_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_content" ADD CONSTRAINT "article_content_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_place_comparison" ADD CONSTRAINT "article_place_comparison_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_place_link" ADD CONSTRAINT "article_place_link_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_place_link" ADD CONSTRAINT "article_place_link_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_article_id_article_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."article"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_trail_id_trail_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trail"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_post" ADD CONSTRAINT "forum_post_thread_id_forum_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_post" ADD CONSTRAINT "forum_post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_thread" ADD CONSTRAINT "forum_thread_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_thread" ADD CONSTRAINT "forum_thread_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classified" ADD CONSTRAINT "classified_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classified" ADD CONSTRAINT "classified_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_provider_id_user_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_service_id_local_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."local_service"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_service" ADD CONSTRAINT "local_service_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_service" ADD CONSTRAINT "local_service_provider_id_user_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_service" ADD CONSTRAINT "local_service_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_availability" ADD CONSTRAINT "service_availability_service_id_local_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."local_service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_producer_id_user_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_agreement" ADD CONSTRAINT "mediation_agreement_case_id_mediation_case_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."mediation_case"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_case" ADD CONSTRAINT "mediation_case_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_case" ADD CONSTRAINT "mediation_case_reported_user_id_user_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_case" ADD CONSTRAINT "mediation_case_mediator_id_user_id_fk" FOREIGN KEY ("mediator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_session" ADD CONSTRAINT "mediation_session_case_id_mediation_case_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."mediation_case"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediation_session" ADD CONSTRAINT "mediation_session_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_enrollment" ADD CONSTRAINT "education_enrollment_module_id_education_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."education_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_enrollment" ADD CONSTRAINT "education_enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_lesson" ADD CONSTRAINT "education_lesson_module_id_education_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."education_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_module" ADD CONSTRAINT "education_module_educator_id_user_id_fk" FOREIGN KEY ("educator_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_module" ADD CONSTRAINT "education_module_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_progress" ADD CONSTRAINT "education_progress_enrollment_id_education_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."education_enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_progress" ADD CONSTRAINT "education_progress_lesson_id_education_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."education_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_participation" ADD CONSTRAINT "volunteer_participation_task_id_volunteer_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."volunteer_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_participation" ADD CONSTRAINT "volunteer_participation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_project" ADD CONSTRAINT "volunteer_project_coordinator_id_user_id_fk" FOREIGN KEY ("coordinator_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_project" ADD CONSTRAINT "volunteer_project_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_task" ADD CONSTRAINT "volunteer_task_project_id_volunteer_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."volunteer_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_campaign_id_funding_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."funding_campaign"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_donor_id_user_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_campaign" ADD CONSTRAINT "funding_campaign_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_campaign" ADD CONSTRAINT "funding_campaign_project_id_volunteer_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."volunteer_project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transparency_report" ADD CONSTRAINT "transparency_report_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_item" ADD CONSTRAINT "gallery_item_gallery_id_gallery_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_item" ADD CONSTRAINT "gallery_item_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_user_id_uidx" ON "profile" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_username_uidx" ON "profile" USING btree ("username");--> statement-breakpoint
CREATE INDEX "profile_location_idx" ON "profile" USING btree ("location");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_user_role_uidx" ON "user_role" USING btree ("user_id","role");--> statement-breakpoint
CREATE INDEX "user_role_user_id_idx" ON "user_role" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_role_role_idx" ON "user_role" USING btree ("role");--> statement-breakpoint
CREATE INDEX "transaction_wallet_id_idx" ON "transaction" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "transaction_type_idx" ON "transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transaction_created_at_idx" ON "transaction" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transaction_reference_idx" ON "transaction" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_user_id_uidx" ON "wallet" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_id_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_read_idx" ON "notification" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notification_type_idx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "favorite_user_target_uidx" ON "favorite" USING btree ("user_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "favorite_user_id_idx" ON "favorite" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_target_idx" ON "favorite" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "image_content_idx" ON "image" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "image_uploaded_by_idx" ON "image" USING btree ("uploaded_by");--> statement-breakpoint
CREATE UNIQUE INDEX "category_parent_slug_uidx" ON "category" USING btree ("parent_id","slug");--> statement-breakpoint
CREATE INDEX "category_type_idx" ON "category" USING btree ("type");--> statement-breakpoint
CREATE INDEX "category_parent_id_idx" ON "category" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cat_trans_category_lang_uidx" ON "category_translation" USING btree ("category_id","lang");--> statement-breakpoint
CREATE INDEX "cat_trans_lang_idx" ON "category_translation" USING btree ("lang");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_slug_uidx" ON "tag" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tag_trans_tag_lang_uidx" ON "tag_translation" USING btree ("tag_id","lang");--> statement-breakpoint
CREATE INDEX "tag_trans_lang_idx" ON "tag_translation" USING btree ("lang");--> statement-breakpoint
CREATE UNIQUE INDEX "attr_def_trans_attr_lang_uidx" ON "attribute_def_translation" USING btree ("attribute_definition_id","lang");--> statement-breakpoint
CREATE INDEX "attr_def_trans_lang_idx" ON "attribute_def_translation" USING btree ("lang");--> statement-breakpoint
CREATE UNIQUE INDEX "attr_def_slug_uidx" ON "attribute_definition" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "address_city_idx" ON "address" USING btree ("city");--> statement-breakpoint
CREATE INDEX "address_country_idx" ON "address" USING btree ("country");--> statement-breakpoint
CREATE UNIQUE INDEX "place_slug_uidx" ON "place" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "place_owner_id_idx" ON "place" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "place_category_id_idx" ON "place" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "place_status_idx" ON "place" USING btree ("status");--> statement-breakpoint
CREATE INDEX "place_rating_avg_idx" ON "place" USING btree ("rating_avg");--> statement-breakpoint
CREATE INDEX "place_lat_lng_idx" ON "place" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE UNIQUE INDEX "place_trans_place_lang_uidx" ON "place_translation" USING btree ("place_id","language");--> statement-breakpoint
CREATE INDEX "place_trans_lang_idx" ON "place_translation" USING btree ("language");--> statement-breakpoint
CREATE UNIQUE INDEX "place_attr_val_place_attr_uidx" ON "place_attribute_value" USING btree ("place_id","attribute_id");--> statement-breakpoint
CREATE INDEX "place_attr_val_place_idx" ON "place_attribute_value" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "poi_trail_id_idx" ON "poi" USING btree ("trail_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trail_slug_uidx" ON "trail" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "trail_created_by_idx" ON "trail" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "trail_difficulty_idx" ON "trail" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "review_place_id_idx" ON "review" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "review_author_id_idx" ON "review" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "review_status_idx" ON "review" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "review_author_place_root_uidx" ON "review" USING btree ("author_id","place_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sub_rating_review_criterion_uidx" ON "sub_rating" USING btree ("review_id","criterion");--> statement-breakpoint
CREATE INDEX "sub_rating_review_idx" ON "sub_rating" USING btree ("review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "article_slug_uidx" ON "article" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_author_id_idx" ON "article" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "article_status_idx" ON "article" USING btree ("status");--> statement-breakpoint
CREATE INDEX "article_published_at_idx" ON "article" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "article_content_article_lang_uidx" ON "article_content" USING btree ("article_id","language");--> statement-breakpoint
CREATE INDEX "article_place_comp_article_idx" ON "article_place_comparison" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "comment_author_id_idx" ON "comment" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "comment_target_type_idx" ON "comment" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "comment_article_id_idx" ON "comment" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "comment_place_id_idx" ON "comment" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "comment_trail_id_idx" ON "comment" USING btree ("trail_id");--> statement-breakpoint
CREATE INDEX "comment_event_id_idx" ON "comment" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "comment_status_idx" ON "comment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comment_created_at_idx" ON "comment" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "event_slug_uidx" ON "event" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "event_created_by_idx" ON "event" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "event_start_at_idx" ON "event" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "event_category_id_idx" ON "event" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "event_place_id_idx" ON "event" USING btree ("place_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_reg_event_user_uidx" ON "event_registration" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_reg_event_idx" ON "event_registration" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_reg_user_idx" ON "event_registration" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_post_thread_idx" ON "forum_post" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "forum_post_author_idx" ON "forum_post" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "forum_post_created_idx" ON "forum_post" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "forum_thread_cat_slug_uidx" ON "forum_thread" USING btree ("category_id","slug");--> statement-breakpoint
CREATE INDEX "forum_thread_author_idx" ON "forum_thread" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "forum_thread_category_idx" ON "forum_thread" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "forum_thread_status_idx" ON "forum_thread" USING btree ("status");--> statement-breakpoint
CREATE INDEX "forum_thread_last_post_idx" ON "forum_thread" USING btree ("last_post_at");--> statement-breakpoint
CREATE INDEX "classified_seller_idx" ON "classified" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "classified_category_idx" ON "classified" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "classified_status_idx" ON "classified" USING btree ("status");--> statement-breakpoint
CREATE INDEX "classified_expires_idx" ON "classified" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "booking_customer_idx" ON "booking" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "booking_provider_idx" ON "booking" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "booking_service_idx" ON "booking" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_date_idx" ON "booking" USING btree ("booking_date");--> statement-breakpoint
CREATE INDEX "local_service_provider_idx" ON "local_service" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "local_service_category_idx" ON "local_service" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "local_service_place_idx" ON "local_service" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "local_service_status_idx" ON "local_service" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "service_avail_service_day_time_uidx" ON "service_availability" USING btree ("service_id","day_of_week","start_time");--> statement-breakpoint
CREATE INDEX "service_avail_service_idx" ON "service_availability" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "conversation_type_idx" ON "conversation" USING btree ("type");--> statement-breakpoint
CREATE INDEX "conversation_last_msg_idx" ON "conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX "conv_part_conv_user_uidx" ON "conversation_participant" USING btree ("conversation_id","user_id");--> statement-breakpoint
CREATE INDEX "conv_part_user_idx" ON "conversation_participant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conv_part_conv_idx" ON "conversation_participant" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_conv_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_sender_idx" ON "message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_sent_at_idx" ON "message" USING btree ("sent_at");--> statement-breakpoint
CREATE UNIQUE INDEX "group_slug_uidx" ON "group" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "group_created_by_idx" ON "group" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "group_member_user_idx" ON "group_member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mediation_agreement_case_uidx" ON "mediation_agreement" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "mediation_case_reporter_idx" ON "mediation_case" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "mediation_case_reported_idx" ON "mediation_case" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "mediation_case_mediator_idx" ON "mediation_case" USING btree ("mediator_id");--> statement-breakpoint
CREATE INDEX "mediation_case_status_idx" ON "mediation_case" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mediation_case_priority_idx" ON "mediation_case" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "mediation_session_case_idx" ON "mediation_session" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "mediation_session_scheduled_idx" ON "mediation_session" USING btree ("scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_enrollment_module_user_uidx" ON "education_enrollment" USING btree ("module_id","user_id");--> statement-breakpoint
CREATE INDEX "edu_enrollment_user_idx" ON "education_enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "edu_enrollment_module_idx" ON "education_enrollment" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_lesson_module_slug_uidx" ON "education_lesson" USING btree ("module_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_lesson_module_order_uidx" ON "education_lesson" USING btree ("module_id","sort_order");--> statement-breakpoint
CREATE INDEX "edu_lesson_module_idx" ON "education_lesson" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_module_slug_uidx" ON "education_module" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "edu_module_educator_idx" ON "education_module" USING btree ("educator_id");--> statement-breakpoint
CREATE INDEX "edu_module_category_idx" ON "education_module" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "edu_module_status_idx" ON "education_module" USING btree ("status");--> statement-breakpoint
CREATE INDEX "edu_module_difficulty_idx" ON "education_module" USING btree ("difficulty");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_progress_enrollment_lesson_uidx" ON "education_progress" USING btree ("enrollment_id","lesson_id");--> statement-breakpoint
CREATE INDEX "edu_progress_enrollment_idx" ON "education_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_part_task_user_uidx" ON "volunteer_participation" USING btree ("task_id","user_id");--> statement-breakpoint
CREATE INDEX "volunteer_part_user_idx" ON "volunteer_participation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "volunteer_part_task_idx" ON "volunteer_participation" USING btree ("task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_project_slug_uidx" ON "volunteer_project" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "volunteer_project_coordinator_idx" ON "volunteer_project" USING btree ("coordinator_id");--> statement-breakpoint
CREATE INDEX "volunteer_project_status_idx" ON "volunteer_project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "volunteer_project_category_idx" ON "volunteer_project" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "volunteer_task_project_idx" ON "volunteer_task" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "volunteer_task_status_idx" ON "volunteer_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "volunteer_task_date_idx" ON "volunteer_task" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "donation_campaign_idx" ON "donation" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "donation_donor_idx" ON "donation" USING btree ("donor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "funding_campaign_slug_uidx" ON "funding_campaign" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "funding_campaign_creator_idx" ON "funding_campaign" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "funding_campaign_project_idx" ON "funding_campaign" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "funding_campaign_status_idx" ON "funding_campaign" USING btree ("status");--> statement-breakpoint
CREATE INDEX "funding_campaign_deadline_idx" ON "funding_campaign" USING btree ("deadline");--> statement-breakpoint
CREATE UNIQUE INDEX "impact_metric_type_period_scope_uidx" ON "impact_metric" USING btree ("type","period_start","period_end","scope");--> statement-breakpoint
CREATE INDEX "impact_metric_type_idx" ON "impact_metric" USING btree ("type");--> statement-breakpoint
CREATE INDEX "impact_metric_period_idx" ON "impact_metric" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE UNIQUE INDEX "transparency_report_slug_uidx" ON "transparency_report" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "transparency_report_status_idx" ON "transparency_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transparency_report_period_idx" ON "transparency_report" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "gallery_created_by_idx" ON "gallery" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "gallery_item_gallery_idx" ON "gallery_item" USING btree ("gallery_id");--> statement-breakpoint
CREATE INDEX "gallery_item_sort_idx" ON "gallery_item" USING btree ("gallery_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "system_commission_name_uidx" ON "system_commission" USING btree ("name");