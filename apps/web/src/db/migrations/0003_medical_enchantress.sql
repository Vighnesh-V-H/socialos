CREATE TYPE "public"."scheduled_post_status" AS ENUM('pending', 'published', 'cancelled');--> statement-breakpoint
CREATE TABLE "scheduled_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"platforms" "platform"[] NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" "scheduled_post_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scheduled_post" ADD CONSTRAINT "scheduled_post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;