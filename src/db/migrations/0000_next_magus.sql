CREATE TABLE `vault_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`path` text NOT NULL,
	`content` text NOT NULL,
	`title` text,
	`tags` text,
	`note_type` text,
	`wikilinks` text,
	`word_count` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
