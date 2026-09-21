ALTER TYPE "public"."consent_type" ADD VALUE IF NOT EXISTS 'identity_document';
--> statement-breakpoint
CREATE TYPE "public"."identity_side" AS ENUM('front', 'back');
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "colony" varchar(120);
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "identity_verified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "church_name" varchar(200);
--> statement-breakpoint
CREATE TABLE "identity_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"side" "identity_side" NOT NULL,
	"mime" varchar(32) NOT NULL,
	"bytes" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identity_documents" ADD CONSTRAINT "identity_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "identity_documents_user_side_key" ON "identity_documents" USING btree ("user_id","side");
