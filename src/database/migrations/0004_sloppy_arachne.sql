CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"user_id" text,
	"target_id" text,
	"ip" text,
	"user_agent" text,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
