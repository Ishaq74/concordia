CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text,
	"full_name" text,
	"bio" text,
	"avatar_url" text,
	"location" text,
	"website" text,
	"preferred_language" text DEFAULT 'fr',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "title" text;--> statement-breakpoint
UPDATE "notification" SET "title" = COALESCE("message", "type", 'Notification') WHERE "title" IS NULL;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "body" text;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "targetType" text;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "targetId" text;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "data" jsonb;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "readAt" timestamp;