import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let db: ReturnType<typeof createDatabase<typeof schema>> | null = null;

export function getDb() {
  if (!db) {
    db = createDatabase(schema);
  }
  return db;
}

export { schema };
