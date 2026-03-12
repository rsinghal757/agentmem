import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const vaultNotes = pgTable(
  "vault_notes",
  {
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
  },
  (table) => [unique("vault_notes_user_path_unique").on(table.userId, table.path)],
);

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull().default("New chat"),
    preview: text("preview"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("chat_threads_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    threadId: text("thread_id").notNull(),
    messageUuid: text("message_uuid").notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    parts: text("parts"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique("chat_messages_user_thread_uuid_unique").on(
      table.userId,
      table.threadId,
      table.messageUuid,
    ),
    index("chat_messages_user_thread_created_idx").on(
      table.userId,
      table.threadId,
      table.createdAt,
    ),
  ],
);

export type VaultNoteInsert = typeof vaultNotes.$inferInsert;
export type VaultNoteSelect = typeof vaultNotes.$inferSelect;
export type ChatMessageInsert = typeof chatMessages.$inferInsert;
export type ChatMessageSelect = typeof chatMessages.$inferSelect;
export type ChatThreadInsert = typeof chatThreads.$inferInsert;
export type ChatThreadSelect = typeof chatThreads.$inferSelect;
