CREATE TABLE "chat_threads" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT 'New chat' NOT NULL,
	"preview" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "thread_id" text;
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "message_uuid" text;
--> statement-breakpoint
UPDATE "chat_messages"
SET "thread_id" = "user_id" || ':default',
    "message_uuid" = md5(coalesce("user_id", '') || ':' || coalesce("role", '') || ':' || coalesce("content", '') || ':' || coalesce("created_at"::text, '') || ':' || "id"::text)
WHERE "thread_id" IS NULL OR "message_uuid" IS NULL;
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "thread_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "chat_messages" ALTER COLUMN "message_uuid" SET NOT NULL;
--> statement-breakpoint
INSERT INTO "chat_threads" ("id", "user_id", "title", "preview", "created_at", "updated_at")
SELECT
  "user_id" || ':default' AS id,
  "user_id",
  'Imported chat' AS title,
  max("content") FILTER (WHERE "content" IS NOT NULL) AS preview,
  min("created_at") AS created_at,
  max("created_at") AS updated_at
FROM "chat_messages"
GROUP BY "user_id"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
CREATE INDEX "chat_threads_user_updated_idx" ON "chat_threads" USING btree ("user_id","updated_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "chat_messages_user_thread_uuid_unique" ON "chat_messages" USING btree ("user_id","thread_id","message_uuid");
--> statement-breakpoint
CREATE INDEX "chat_messages_user_thread_created_idx" ON "chat_messages" USING btree ("user_id","thread_id","created_at");
--> statement-breakpoint
WITH normalized AS (
  SELECT
    id,
    user_id,
    CASE
      WHEN path IS NULL OR btrim(path) = '' THEN 'untitled.md'
      ELSE
        CASE
          WHEN right(regexp_replace(regexp_replace(btrim(path), '^[/\\]+', ''), '/+', '/', 'g'), 3) = '.md'
            THEN regexp_replace(regexp_replace(btrim(path), '^[/\\]+', ''), '/+', '/', 'g')
          WHEN split_part(regexp_replace(regexp_replace(btrim(path), '^[/\\]+', ''), '/+', '/', 'g'), '/', array_length(string_to_array(regexp_replace(regexp_replace(btrim(path), '^[/\\]+', ''), '/+', '/', 'g'), '/'), 1)) LIKE '%.%'
            THEN regexp_replace(regexp_replace(btrim(path), '^[/\\]+', ''), '/+', '/', 'g')
          ELSE regexp_replace(regexp_replace(btrim(path), '^[/\\]+', ''), '/+', '/', 'g') || '.md'
        END
    END AS normalized_path
  FROM vault_notes
), deduped AS (
  SELECT id, user_id, normalized_path,
         row_number() OVER (PARTITION BY user_id, normalized_path ORDER BY updated_at DESC NULLS LAST, id DESC) AS rn
  FROM vault_notes v
  JOIN normalized n ON v.id = n.id
)
DELETE FROM vault_notes v
USING deduped d
WHERE v.id = d.id AND d.rn > 1;
--> statement-breakpoint
UPDATE vault_notes v
SET path = n.normalized_path
FROM normalized n
WHERE v.id = n.id;
--> statement-breakpoint
CREATE UNIQUE INDEX "vault_notes_user_path_unique" ON "vault_notes" USING btree ("user_id","path");
