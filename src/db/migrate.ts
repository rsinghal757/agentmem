import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDb } from "./index";

const db = getDb();
if (db) {
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations completed");
} else {
  console.error("Database not initialized");
}
