import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const vaultNotes = sqliteTable("vault_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull(),
  title: text("title"),
  tags: text("tags"), // JSON array stored as string
  noteType: text("note_type"),
  wikilinks: text("wikilinks"), // JSON array stored as string
  wordCount: integer("word_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type VaultNoteInsert = typeof vaultNotes.$inferInsert;
export type VaultNoteSelect = typeof vaultNotes.$inferSelect;
export type ChatMessageInsert = typeof chatMessages.$inferInsert;
export type ChatMessageSelect = typeof chatMessages.$inferSelect;
