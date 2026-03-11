import type { VaultStorage } from "@/types/vault";
import { db } from "@/db";
import { vaultNotes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/** Database-backed vault storage for persistent storage */
class DatabaseVaultStorage implements VaultStorage {
  async read(userId: string, filePath: string): Promise<string | null> {
    const result = await db
      .select({ content: vaultNotes.content })
      .from(vaultNotes)
      .where(and(eq(vaultNotes.userId, userId), eq(vaultNotes.path, filePath)))
      .limit(1);
    return result[0]?.content ?? null;
  }

  async write(userId: string, filePath: string, content: string): Promise<void> {
    const existing = await db
      .select({ id: vaultNotes.id })
      .from(vaultNotes)
      .where(and(eq(vaultNotes.userId, userId), eq(vaultNotes.path, filePath)))
      .limit(1);

    if (existing[0]) {
      await db
        .update(vaultNotes)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(vaultNotes.id, existing[0].id));
    } else {
      await db.insert(vaultNotes).values({
        userId,
        path: filePath,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async delete(userId: string, filePath: string): Promise<void> {
    await db
      .delete(vaultNotes)
      .where(and(eq(vaultNotes.userId, userId), eq(vaultNotes.path, filePath)));
  }

  async list(
    userId: string,
    directory: string,
    recursive: boolean,
  ): Promise<string[]> {
    const results = await db
      .select({ path: vaultNotes.path })
      .from(vaultNotes)
      .where(eq(vaultNotes.userId, userId));

    let paths = results.map((r) => r.path);

    if (directory) {
      const dirPrefix = directory.endsWith("/") ? directory : `${directory}/`;
      paths = paths.filter((p) => p.startsWith(dirPrefix));
    }

    if (!recursive) {
      const dirSet = new Set<string>();
      paths = paths
        .map((p) => {
          const relative = directory ? p.slice(directory.length + 1) : p;
          const firstPart = relative.split("/")[0];
          return directory ? `${directory}/${firstPart}` : firstPart;
        })
        .filter((p) => {
          if (p.endsWith("/") || !dirSet.has(p)) {
            dirSet.add(p);
            return true;
          }
          return false;
        });
    }

    return paths;
  }

  async exists(userId: string, filePath: string): Promise<boolean> {
    const result = await db
      .select({ id: vaultNotes.id })
      .from(vaultNotes)
      .where(and(eq(vaultNotes.userId, userId), eq(vaultNotes.path, filePath)))
      .limit(1);
    return result.length > 0;
  }
}

/** Get the vault storage instance based on environment */
function createVaultStorage(): VaultStorage {
  return new DatabaseVaultStorage();
}

export const vaultStorage: VaultStorage = createVaultStorage();
