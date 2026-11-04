CREATE TYPE "public"."donor_request_type" AS ENUM('identity', 'fiscal', 'email_verify');
--> statement-breakpoint
CREATE TYPE "public"."donor_request_status" AS ENUM('open', 'resolved', 'cancelled');
--> statement-breakpoint
CREATE TABLE "donor_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "donor_request_type" NOT NULL,
	"status" "donor_request_status" DEFAULT 'open' NOT NULL,
	"created_by_user_id" uuid,
	"sent_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donor_requests" ADD CONSTRAINT "donor_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "donor_requests" ADD CONSTRAINT "donor_requests_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "donor_requests_user_status_idx" ON "donor_requests" USING btree ("user_id","status");
--> statement-breakpoint
CREATE INDEX "donor_requests_user_type_idx" ON "donor_requests" USING btree ("user_id","type","status");
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "starts_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "ends_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX "campaigns_active_window_idx" ON "campaigns" USING btree ("active","starts_at","ends_at");
