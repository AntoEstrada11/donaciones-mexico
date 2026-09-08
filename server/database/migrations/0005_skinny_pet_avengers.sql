CREATE TYPE "public"."payment_mode" AS ENUM('test', 'live');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('mercadopago', 'paypal', 'spei_manual');--> statement-breakpoint
ALTER TYPE "public"."donation_method" ADD VALUE 'paypal';--> statement-breakpoint
ALTER TYPE "public"."donation_status" ADD VALUE 'refunded';--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_event_id" varchar(128) NOT NULL,
	"donation_id" uuid,
	"event_type" varchar(80) NOT NULL,
	"mapped_status" "donation_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"card_provider" "payment_provider" DEFAULT 'mercadopago' NOT NULL,
	"mode" "payment_mode" DEFAULT 'test' NOT NULL,
	"card_enabled" boolean DEFAULT false NOT NULL,
	"paypal_enabled" boolean DEFAULT false NOT NULL,
	"spei_manual_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "provider" "payment_provider";--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "provider_reference" varchar(128);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "provider_payment_id" varchar(128);--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_donation_id_donations_id_fk" FOREIGN KEY ("donation_id") REFERENCES "public"."donations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_events_provider_event_key" ON "payment_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE INDEX "payment_events_donation_idx" ON "payment_events" USING btree ("donation_id");--> statement-breakpoint
CREATE INDEX "donations_provider_ref_idx" ON "donations" USING btree ("provider","provider_reference");