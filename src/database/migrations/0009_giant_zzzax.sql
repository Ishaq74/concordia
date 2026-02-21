DROP TABLE "comments" CASCADE;--> statement-breakpoint
ALTER TABLE "blog_comments" RENAME COLUMN "post_id" TO "entity_id";--> statement-breakpoint
ALTER TABLE "blog_comments" ADD COLUMN "entity_type" text NOT NULL;