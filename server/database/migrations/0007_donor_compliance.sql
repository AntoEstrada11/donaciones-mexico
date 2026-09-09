CREATE TYPE "public"."donor_compliance_status" AS ENUM('rapid', 'cfdi', 'pld_pending', 'sat_report');
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "fiscal_name" varchar(160);
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "tax_regime" varchar(8);
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "cfdi_use" varchar(8);
--> statement-breakpoint
ALTER TABLE "donor_profiles" ADD COLUMN "compliance_status" "donor_compliance_status" DEFAULT 'rapid' NOT NULL;
