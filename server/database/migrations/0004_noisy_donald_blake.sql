CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"contact_phone" varchar(40) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"spei_bank" varchar(120) NOT NULL,
	"spei_beneficiary" varchar(200) NOT NULL,
	"spei_clabe" varchar(18) NOT NULL,
	"spei_concept" varchar(80) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
