ALTER TABLE "notification" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "notification" RENAME COLUMN "targetType" TO "target_type";--> statement-breakpoint
ALTER TABLE "notification" RENAME COLUMN "targetId" TO "target_id";--> statement-breakpoint
ALTER TABLE "notification" RENAME COLUMN "isRead" TO "is_read";--> statement-breakpoint
ALTER TABLE "notification" RENAME COLUMN "readAt" TO "read_at";--> statement-breakpoint
ALTER TABLE "notification" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "notification" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "blog_post_authors" ADD CONSTRAINT "blog_post_authors_post_id_author_id_pk" PRIMARY KEY("post_id","author_id");--> statement-breakpoint
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_post_id_category_id_pk" PRIMARY KEY("post_id","category_id");--> statement-breakpoint
ALTER TABLE "blog_post_media" ADD CONSTRAINT "blog_post_media_post_id_media_id_type_pk" PRIMARY KEY("post_id","media_id","type");--> statement-breakpoint
ALTER TABLE "services_media_links" ADD CONSTRAINT "services_media_links_service_id_media_id_type_pk" PRIMARY KEY("service_id","media_id","type");--> statement-breakpoint
ALTER TABLE "blog_post_authors" ADD CONSTRAINT "blog_post_authors_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_authors" ADD CONSTRAINT "blog_post_authors_author_id_blog_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."blog_authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_categories" ADD CONSTRAINT "blog_post_categories_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_media" ADD CONSTRAINT "blog_post_media_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_media" ADD CONSTRAINT "blog_post_media_media_id_blog_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."blog_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_translations" ADD CONSTRAINT "blog_translations_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_media_links" ADD CONSTRAINT "services_media_links_service_id_services_listings_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_media_links" ADD CONSTRAINT "services_media_links_media_id_services_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."services_media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_translations" ADD CONSTRAINT "services_translations_service_id_services_listings_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_reviews" ADD CONSTRAINT "services_reviews_service_id_services_listings_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_availability" ADD CONSTRAINT "services_availability_service_id_services_listings_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_bookings" ADD CONSTRAINT "services_bookings_service_id_services_listings_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services_listings"("id") ON DELETE cascade ON UPDATE no action;