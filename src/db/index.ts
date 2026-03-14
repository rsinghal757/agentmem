import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
const shouldAutoMigrate = process.env.AUTO_DB_MIGRATE !== "false";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let client: postgres.Sql | null = null;
let migrationPromise: Promise<void> | null = null;
let migrationsEnsured = false;

async function ensureSchemaTables(
  database: NonNullable<ReturnType<typeof drizzle<typeof schema>>>,
) {
  await database.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_threads (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      title text DEFAULT 'New chat' NOT NULL,
      preview text,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
  `);

  await database.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id serial PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      role text NOT NULL,
      content text NOT NULL,
      parts text,
      created_at timestamp DEFAULT now(),
      thread_id text,
      message_uuid text
    );
  `);

  await database.execute(sql`
    CREATE TABLE IF NOT EXISTS vault_notes (
      id serial PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      path text NOT NULL,
      content text NOT NULL,
      title text,
      tags text,
      note_type text,
      wikilinks text,
      word_count integer DEFAULT 0,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    );
  `);

  await database.execute(sql`
    ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS thread_id text;
  `);

  await database.execute(sql`
    ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS message_uuid text;
  `);

  await database.execute(sql`
    ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS parts text;
  `);

  await database.execute(sql`
    UPDATE chat_messages
    SET thread_id = user_id || ':default'
    WHERE thread_id IS NULL;
  `);

  await database.execute(sql`
    UPDATE chat_messages
    SET message_uuid = md5(
      coalesce(user_id, '') || ':' ||
      coalesce(role, '') || ':' ||
      coalesce(content, '') || ':' ||
      coalesce(created_at::text, '') || ':' ||
      id::text
    )
    WHERE message_uuid IS NULL;
  `);

  await database.execute(sql`
    INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at)
    SELECT
      user_id || ':default' AS id,
      user_id,
      'Imported chat' AS title,
      max(content) FILTER (WHERE content IS NOT NULL) AS preview,
      min(created_at) AS created_at,
      max(created_at) AS updated_at
    FROM chat_messages
    GROUP BY user_id
    ON CONFLICT (id) DO NOTHING;
  `);

  await database.execute(sql`
    ALTER TABLE chat_messages
    ALTER COLUMN thread_id SET NOT NULL;
  `);

  await database.execute(sql`
    ALTER TABLE chat_messages
    ALTER COLUMN message_uuid SET NOT NULL;
  `);

  await database.execute(sql`
    CREATE INDEX IF NOT EXISTS chat_threads_user_updated_idx
    ON chat_threads (user_id, updated_at);
  `);

  await database.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS chat_messages_user_thread_uuid_unique
    ON chat_messages (user_id, thread_id, message_uuid);
  `);

  await database.execute(sql`
    CREATE INDEX IF NOT EXISTS chat_messages_user_thread_created_idx
    ON chat_messages (user_id, thread_id, created_at);
  `);

  await database.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS vault_notes_user_path_unique
    ON vault_notes (user_id, path);
  `);
}

async function ensureMigrations(
  database: NonNullable<ReturnType<typeof drizzle<typeof schema>>>,
) {
  if (!shouldAutoMigrate || migrationsEnsured) return;

  if (!migrationPromise) {
    migrationPromise = migrate(database, { migrationsFolder: "./src/db/migrations" })
      .then(() => {
        console.log("[DB] Auto-migrations complete");
      })
      .catch(async (error) => {
        const message =
          error instanceof Error ? error.message : "Unknown migration error";
        console.warn(
          `[DB] File-based migrations failed; applying schema bootstrap fallback: ${message}`,
        );
        await ensureSchemaTables(database);
        console.log("[DB] Schema bootstrap fallback complete");
      })
      .finally(() => {
        migrationsEnsured = true;
        migrationPromise = null;
      });
  }

  await migrationPromise;
}

export async function getDb() {
  if (!db && connectionString) {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
  }

  if (!db) return null;

  await ensureMigrations(db);
  return db;
}

export { schema };
