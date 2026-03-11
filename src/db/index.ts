import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let client: postgres.Sql | null = null;

export function getDb() {
  if (!db && connectionString) {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
  }
  return db;
}

export { schema };
