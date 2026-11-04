ALTER TABLE "identity_documents" ADD COLUMN "object_key" varchar(512);
--> statement-breakpoint
ALTER TABLE "identity_documents" ALTER COLUMN "bytes" DROP NOT NULL;
