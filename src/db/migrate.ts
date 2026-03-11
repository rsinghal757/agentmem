import { getDb } from "./index";

const db = await getDb();
if (db) {
  console.log("Migrations completed");
} else {
  console.error("Database not initialized");
}
