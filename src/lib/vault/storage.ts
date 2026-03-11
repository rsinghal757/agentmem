import type { VaultStorage } from "@/types/vault";
import { getDb } from "@/db";
import { vaultNotes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { normalizeVaultPath } from "./paths";

/** Database-backed vault storage for persistent storage */
class DatabaseVaultStorage implements VaultStorage {
  private getDbOrNull() {
    const db = getDb();
    if (!db) {
      console.warn("Database not configured - vault operations will be skipped");
    }
    return db;
  }

  async read(userId: string, filePath: string): Promise<string | null> {
    const db = this.getDbOrNull();
    if (!db) return null;
    const normalizedPath = normalizeVaultPath(filePath);
    const result = await db
      .select({ content: vaultNotes.content })
      .from(vaultNotes)
      .where(
        and(
          eq(vaultNotes.userId, userId),
          eq(vaultNotes.path, normalizedPath),
        ),
      )
      .limit(1);
    return result[0]?.content ?? null;
  }

  async write(userId: string, filePath: string, content: string): Promise<void> {
    const db = this.getDbOrNull();
    if (!db) return;
    const normalizedPath = normalizeVaultPath(filePath);

    await db
      .insert(vaultNotes)
      .values({
        userId,
        path: normalizedPath,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [vaultNotes.userId, vaultNotes.path],
        set: {
          content,
          updatedAt: new Date(),
        },
      });
  }

  async delete(userId: string, filePath: string): Promise<void> {
    const db = this.getDbOrNull();
    if (!db) return;
    const normalizedPath = normalizeVaultPath(filePath);
    await db
      .delete(vaultNotes)
      .where(
        and(eq(vaultNotes.userId, userId), eq(vaultNotes.path, normalizedPath)),
      );
  }

  async list(
    userId: string,
    directory: string,
    recursive: boolean,
  ): Promise<string[]> {
    const db = this.getDbOrNull();
    if (!db) return [];
    const normalizedDirectory = directory ? normalizeVaultPath(directory) : "";
    const directoryPrefix = normalizedDirectory.replace(/\.md$/, "").replace(/\/$/, "");

    const results = await db
      .select({ path: vaultNotes.path })
      .from(vaultNotes)
      .where(eq(vaultNotes.userId, userId));

    let paths = results.map((r) => normalizeVaultPath(r.path));

    if (directoryPrefix) {
      const dirPrefix = `${directoryPrefix}/`;
      paths = paths.filter((p) => p.startsWith(dirPrefix));
    }

    if (!recursive) {
      const dirSet = new Set<string>();
      paths = paths
        .map((p) => {
          const relative = directoryPrefix ? p.slice(directoryPrefix.length + 1) : p;
          const firstPart = relative.split("/")[0];
          return directoryPrefix ? `${directoryPrefix}/${firstPart}` : firstPart;
        })
        .filter((p) => {
          if (!dirSet.has(p)) {
            dirSet.add(p);
            return true;
          }
          return false;
        });
    }

    return paths;
  }

  async exists(userId: string, filePath: string): Promise<boolean> {
    const db = this.getDbOrNull();
    if (!db) return false;
    const normalizedPath = normalizeVaultPath(filePath);
    const result = await db
      .select({ id: vaultNotes.id })
      .from(vaultNotes)
      .where(
        and(
          eq(vaultNotes.userId, userId),
          eq(vaultNotes.path, normalizedPath),
        ),
      )
      .limit(1);
    return result.length > 0;
  }
}

/** Get the vault storage instance based on environment */
function createVaultStorage(): VaultStorage {
  return new DatabaseVaultStorage();
}

export const vaultStorage: VaultStorage = createVaultStorage();
