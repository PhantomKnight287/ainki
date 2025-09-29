CREATE TYPE "public"."anki_card_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."anki_card_type" AS ENUM('vocabulary', 'verb', 'phrase', 'grammar');--> statement-breakpoint
CREATE TABLE "anki_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"card_data" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"anki_deck_id" text
);
--> statement-breakpoint
ALTER TABLE "anki_cards" ADD CONSTRAINT "anki_cards_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;