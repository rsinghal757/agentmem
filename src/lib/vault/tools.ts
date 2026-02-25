import { tool } from "ai";
import { z } from "zod/v4";
import { vaultStorage } from "./storage";
import {
  parseFrontmatter,
  extractWikilinks,
  addWikilinkToContent,
  countWords,
} from "./markdown";
import { vaultSearch } from "./search";

/**
 * Create all vault tools scoped to a specific user.
 * These tools are used by the ToolLoopAgent to manage the vault.
 */
export function createVaultTools(userId: string) {
  return {
    vault_read: tool({
      description:
        "Read a vault note by path. Use before answering questions about topics that might already be documented.",
      inputSchema: z.object({
        path: z
          .string()
          .describe('Relative path like "concepts/typescript.md"'),
      }),
      execute: async ({
        path,
      }: {
        path: string;
      }) => {
        const content = await vaultStorage.read(userId, path);
        if (!content) {
          return { found: false as const, path };
        }
        const metadata = parseFrontmatter(content);
        const wikilinks = extractWikilinks(content);
        return { found: true as const, content, metadata, wikilinks, path };
      },
    }),

    vault_write: tool({
      description:
        "Create or update a vault note. Use to persist knowledge, user preferences, decisions, or anything worth remembering long-term. Always include YAML frontmatter with title, tags, type, created, updated.",
      inputSchema: z.object({
        path: z
          .string()
          .describe('Where to save, e.g. "concepts/typescript.md"'),
        content: z
          .string()
          .describe("Full markdown content including YAML frontmatter"),
        reason: z
          .string()
          .describe("Why this note is being created/updated"),
      }),
      execute: async ({
        path,
        content,
        reason,
      }: {
        path: string;
        content: string;
        reason: string;
      }) => {
        try {
          await vaultStorage.write(userId, path, content);
          const metadata = parseFrontmatter(content);
          const wikilinks = extractWikilinks(content);
          const words = countWords(content);

          return {
            success: true,
            path,
            reason,
            title: metadata?.title,
            tags: metadata?.tags,
            type: metadata?.type,
            wikilinkCount: wikilinks.length,
            wordCount: words,
          };
        } catch (error) {
          console.error("[Vault Tools] Write failed:", error);
          return {
            success: false,
            path,
            reason,
            error:
              error instanceof Error
                ? error.message
                : "Unknown storage write error",
          };
        }
      },
    }),

    vault_search: tool({
      description:
        "Search the vault by keyword or semantic similarity. Use to check if a topic already exists before creating a new note.",
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        mode: z
          .enum(["fulltext", "semantic"])
          .default("fulltext")
          .describe("Search mode: fulltext or semantic"),
        limit: z
          .number()
          .default(5)
          .describe("Maximum number of results"),
      }),
      execute: async ({
        query,
        mode,
        limit,
      }: {
        query: string;
        mode: "fulltext" | "semantic";
        limit: number;
      }) => {
        const results = await vaultSearch(userId, query, mode, limit);
        return { results, count: results.length };
      },
    }),

    vault_list: tool({
      description:
        "List vault files in a directory to understand the current structure.",
      inputSchema: z.object({
        directory: z
          .string()
          .default("")
          .describe('Directory to list, e.g. "concepts/" or "" for root'),
        recursive: z
          .boolean()
          .default(false)
          .describe("Whether to list recursively"),
      }),
      execute: async ({
        directory,
        recursive,
      }: {
        directory: string;
        recursive: boolean;
      }) => {
        const files = await vaultStorage.list(userId, directory, recursive);
        return { files, count: files.length };
      },
    }),

    vault_link: tool({
      description:
        "Add a wikilink from one note to another. Use to strengthen the knowledge graph.",
      inputSchema: z.object({
        fromPath: z.string().describe("Source note path"),
        toPath: z.string().describe("Target note path"),
        context: z
          .string()
          .describe("Sentence describing the relationship"),
      }),
      execute: async ({
        fromPath,
        toPath,
        context,
      }: {
        fromPath: string;
        toPath: string;
        context: string;
      }) => {
        const content = await vaultStorage.read(userId, fromPath);
        if (!content) {
          return { success: false, error: `Note not found: ${fromPath}` };
        }

        const targetName =
          toPath.split("/").pop()?.replace(".md", "") || toPath;
        const updatedContent = addWikilinkToContent(
          content,
          targetName,
          context,
        );
        await vaultStorage.write(userId, fromPath, updatedContent);

        return { success: true, fromPath, toPath, context };
      },
    }),

    vault_delete: tool({
      description: "Delete an outdated or incorrect note from the vault.",
      inputSchema: z.object({
        path: z.string().describe("Path of the note to delete"),
        reason: z.string().describe("Why this note is being deleted"),
      }),
      execute: async ({
        path,
        reason,
      }: {
        path: string;
        reason: string;
      }) => {
        const exists = await vaultStorage.exists(userId, path);
        if (!exists) {
          return { success: false, error: `Note not found: ${path}` };
        }
        await vaultStorage.delete(userId, path);
        return { success: true, path, reason };
      },
    }),
  };
}
