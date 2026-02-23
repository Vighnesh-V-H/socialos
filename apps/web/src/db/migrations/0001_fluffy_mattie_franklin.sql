CREATE TYPE "public"."platform" AS ENUM('linkedin', 'instagram', 'twitter');--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	"content" text NOT NULL,
	"media_url" text,
	"platform_post_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"commenter_name" text NOT NULL,
	"commenter_profile_url" text,
	"commenter_avatar_url" text,
	"content" text NOT NULL,
	"platform" "platform" NOT NULL,
	"commented_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_like" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"liker_name" text NOT NULL,
	"liker_profile_url" text,
	"liker_avatar_url" text,
	"platform" "platform" NOT NULL,
	"liked_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;