CREATE TYPE "public"."consent_type" AS ENUM('privacy_notice', 'sensitive_data', 'marketing');--> statement-breakpoint
CREATE TABLE "consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"donation_id" uuid,
	"type" "consent_type" NOT NULL,
	"granted" boolean NOT NULL,
	"notice_version" varchar(32) NOT NULL,
	"ip_hash" varchar(64),
	"user_agent" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "wants_receipt" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consents" ADD CONSTRAINT "consents_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consents_user_created_idx" ON "consents" USING btree ("user_id","created_at");