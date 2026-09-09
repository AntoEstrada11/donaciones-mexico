ALTER TABLE "users" ADD COLUMN "hub_user_id" varchar(64);--> statement-breakpoint
CREATE UNIQUE INDEX "users_hub_user_id_key" ON "users" USING btree ("hub_user_id");