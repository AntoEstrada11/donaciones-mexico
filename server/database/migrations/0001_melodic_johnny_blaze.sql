CREATE TYPE "public"."user_role" AS ENUM('donor', 'admin');--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"alt" varchar(160) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'donor' NOT NULL;--> statement-breakpoint
CREATE INDEX "hero_slides_active_sort_idx" ON "hero_slides" USING btree ("active","sort_order");