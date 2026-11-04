ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'editor';
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "home_church_external_id" varchar(64);
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "home_church_name" varchar(200);
--> statement-breakpoint
CREATE INDEX "donor_profiles_home_church_idx" ON "donor_profiles" USING btree ("home_church_external_id");
