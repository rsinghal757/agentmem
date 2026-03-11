import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const vaultNotes = pgTable("vault_notes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull(),
  title: text("title"),
  tags: text("tags"),
  noteType: text("note_type"),
  wikilinks: text("wikilinks"),
  wordCount: integer("word_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type VaultNoteInsert = typeof vaultNotes.$inferInsert;
export type VaultNoteSelect = typeof vaultNotes.$inferSelect;
export type ChatMessageInsert = typeof chatMessages.$inferInsert;
export type ChatMessageSelect = typeof chatMessages.$inferSelect;
