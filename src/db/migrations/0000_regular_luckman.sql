CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vault_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"path" text NOT NULL,
	"content" text NOT NULL,
	"title" text,
	"tags" text,
	"note_type" text,
	"wikilinks" text,
	"word_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
