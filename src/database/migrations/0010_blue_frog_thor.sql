CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp
);
