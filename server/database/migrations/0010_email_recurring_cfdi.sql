ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "users" SET "email_verified_at" = "created_at" WHERE "email_verified_at" IS NULL;
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_idx" ON "email_verification_tokens" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_tokens_hash_key" ON "email_verification_tokens" USING btree ("token_hash");
--> statement-breakpoint
CREATE TYPE "public"."recurring_frequency" AS ENUM('weekly', 'biweekly', 'monthly');
--> statement-breakpoint
CREATE TYPE "public"."recurring_status" AS ENUM('active', 'paused', 'cancelled', 'pending_setup');
--> statement-breakpoint
CREATE TABLE "recurring_donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"church_external_id" varchar(64) NOT NULL,
	"church_name" varchar(200),
	"campaign_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'MXN' NOT NULL,
	"frequency" "recurring_frequency" DEFAULT 'monthly' NOT NULL,
	"method" "donation_method" DEFAULT 'spei' NOT NULL,
	"status" "recurring_status" DEFAULT 'pending_setup' NOT NULL,
	"next_charge_at" timestamp with time zone,
	"last_donation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_last_donation_id_donations_id_fk" FOREIGN KEY ("last_donation_id") REFERENCES "public"."donations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "recurring_donations_user_idx" ON "recurring_donations" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "recurring_donations_next_idx" ON "recurring_donations" USING btree ("status", "next_charge_at");
--> statement-breakpoint
CREATE TYPE "public"."cfdi_invoice_status" AS ENUM('pending_stamp', 'stamped', 'failed', 'cancelled');
--> statement-breakpoint
CREATE TABLE "cfdi_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donation_id" uuid NOT NULL,
	"user_id" uuid,
	"status" "cfdi_invoice_status" DEFAULT 'pending_stamp' NOT NULL,
	"uuid" varchar(36),
	"error_code" varchar(80),
	"object_key_xml" varchar(512),
	"object_key_pdf" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cfdi_invoices" ADD CONSTRAINT "cfdi_invoices_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cfdi_invoices" ADD CONSTRAINT "cfdi_invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "cfdi_invoices_donation_key" ON "cfdi_invoices" USING btree ("donation_id");
--> statement-breakpoint
CREATE INDEX "cfdi_invoices_user_idx" ON "cfdi_invoices" USING btree ("user_id");
