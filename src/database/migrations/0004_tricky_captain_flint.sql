ALTER TABLE "blog_posts" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "blog_organizations" SET "slug" = LOWER(REPLACE("name", ' ', '-')) WHERE "slug" IS NULL;--> statement-breakpoint
ALTER TABLE "blog_organizations" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "alternate_name" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "description" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "slogan" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "telephone" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "fax_number" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "address" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "contact_point" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "legal_name" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "tax_id" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "vat_id" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "lei_code" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "duns" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "isic_v4" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "naics" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "nonprofit_status" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "founder" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "founding_date" timestamp;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "founding_location" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "number_of_employees" integer;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "employee" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "alumni" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "parent_organization" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "sub_organization" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "department" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "owns" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "brand" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "makes_offer" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "seeks" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "has_offer_catalog" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "area_served" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "service_area" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "award" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "has_credential" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "knows_language" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "knows_about" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "keywords" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "member_of" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "same_as" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "publishing_principles" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "actionable_feedback_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "corrections_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "diversity_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "ethics_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "masthead" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "mission_coverage_priorities_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "no_bylines_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "ownership_funding_info" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "unnamed_sources_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "verification_fact_checking_policy" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "diversity_staffing_report" text;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "aggregate_rating" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "interaction_statistic" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "review" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "event" jsonb;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_organizations" ADD CONSTRAINT "blog_organizations_slug_unique" UNIQUE("slug");