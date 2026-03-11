import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
const shouldAutoMigrate = process.env.AUTO_DB_MIGRATE !== "false";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let client: postgres.Sql | null = null;
let migrationPromise: Promise<void> | null = null;

async function ensureMigrations(
  database: NonNullable<ReturnType<typeof drizzle<typeof schema>>>,
) {
  if (!shouldAutoMigrate) return;

  if (!migrationPromise) {
    migrationPromise = migrate(database, { migrationsFolder: "./src/db/migrations" })
      .then(() => {
        console.log("[DB] Auto-migrations complete");
      })
      .catch((error) => {
        migrationPromise = null;
        throw error;
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
