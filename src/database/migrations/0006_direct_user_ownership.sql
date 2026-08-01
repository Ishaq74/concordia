ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "owner_id" text;
--> statement-breakpoint
UPDATE "blog_posts" AS post
SET "owner_id" = matched_user."id"
FROM (
  SELECT DISTINCT ON (post_author."post_id")
    post_author."post_id",
    app_user."id"
  FROM "blog_post_authors" AS post_author
  JOIN "blog_authors" AS author ON author."id" = post_author."author_id"
  JOIN "user" AS app_user ON lower(app_user."email") = lower(author."email")
  ORDER BY post_author."post_id", app_user."created_at"
) AS matched_user
WHERE post."id" = matched_user."post_id"
  AND post."owner_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "blog_posts"
  ADD CONSTRAINT "blog_posts_owner_id_user_id_fk"
  FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blog_posts_owner" ON "blog_posts" ("owner_id");
--> statement-breakpoint
UPDATE "services_listings" AS service
SET "provider_id" = owner_member."user_id"
FROM (
  SELECT DISTINCT ON (membership."organization_id")
    membership."organization_id",
    membership."user_id"
  FROM "member" AS membership
  JOIN "user" AS app_user ON app_user."id" = membership."user_id"
  WHERE membership."role" IN ('owner', 'admin')
  ORDER BY membership."organization_id",
    CASE membership."role" WHEN 'owner' THEN 0 ELSE 1 END,
    membership."created_at"
) AS owner_member
WHERE service."organization_id" = owner_member."organization_id"
  AND NOT EXISTS (
    SELECT 1 FROM "user" AS current_provider
    WHERE current_provider."id" = service."provider_id"
  );
--> statement-breakpoint
DELETE FROM "services_listings" AS service
WHERE NOT EXISTS (
  SELECT 1 FROM "user" AS app_user
  WHERE app_user."id" = service."provider_id"
);
--> statement-breakpoint
ALTER TABLE "services_listings"
  ADD CONSTRAINT "services_listings_provider_id_user_id_fk"
  FOREIGN KEY ("provider_id") REFERENCES "public"."user"("id")
  ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "active_organization_id";
--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "organization_id";
--> statement-breakpoint
ALTER TABLE "blog_authors" DROP COLUMN IF EXISTS "works_for_id";
--> statement-breakpoint
ALTER TABLE "services_listings" DROP COLUMN IF EXISTS "organization_id";
--> statement-breakpoint
DROP TABLE IF EXISTS "invitation";
--> statement-breakpoint
DROP TABLE IF EXISTS "member";
--> statement-breakpoint
DROP TABLE IF EXISTS "organization";
--> statement-breakpoint
DROP TABLE IF EXISTS "blog_organizations";
