DROP TABLE "comments" CASCADE;--> statement-breakpoint
-- Ligne supprimée : la colonne post_id n'existe plus, entity_id déjà en place
ALTER TABLE "blog_comments" ADD COLUMN "entity_type" text NOT NULL;