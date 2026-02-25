import * as fs from "fs/promises";
import * as path from "path";
import type { VaultStorage } from "@/types/vault";

const VAULT_LOCAL_PATH = process.env.VAULT_LOCAL_PATH || ".vault";

/** Local filesystem vault storage for development */
class LocalVaultStorage implements VaultStorage {
  private getFullPath(userId: string, filePath: string): string {
    return path.join(process.cwd(), VAULT_LOCAL_PATH, userId, filePath);
  }

  async read(userId: string, filePath: string): Promise<string | null> {
    try {
      const fullPath = this.getFullPath(userId, filePath);
      const content = await fs.readFile(fullPath, "utf-8");
      return content;
    } catch {
      return null;
    }
  }

  async write(userId: string, filePath: string, content: string): Promise<void> {
    const fullPath = this.getFullPath(userId, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  async delete(userId: string, filePath: string): Promise<void> {
    try {
      const fullPath = this.getFullPath(userId, filePath);
      await fs.unlink(fullPath);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  async list(
    userId: string,
    directory: string,
    recursive: boolean,
  ): Promise<string[]> {
    const basePath = this.getFullPath(userId, directory || "");
    try {
      await fs.access(basePath);
    } catch {
      return [];
    }

    if (recursive) {
      return this.listRecursive(basePath, "");
    }

    const entries = await fs.readdir(basePath, { withFileTypes: true });
    return entries.map((entry) => {
      const relativePath = directory
        ? `${directory}/${entry.name}`
        : entry.name;
      return entry.isDirectory() ? `${relativePath}/` : relativePath;
    });
  }

  private async listRecursive(
    basePath: string,
    prefix: string,
  ): Promise<string[]> {
    const results: string[] = [];
    try {
      const entries = await fs.readdir(basePath, { withFileTypes: true });
      for (const entry of entries) {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          const subResults = await this.listRecursive(
            path.join(basePath, entry.name),
            relativePath,
          );
          results.push(...subResults);
        } else {
          results.push(relativePath);
        }
      }
    } catch {
      // Directory doesn't exist
    }
    return results;
  }

  async exists(userId: string, filePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(userId, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

/** Get the vault storage instance based on environment */
function createVaultStorage(): VaultStorage {
  // For now, always use local storage
  // In production, this would switch to BlobVaultStorage
  return new LocalVaultStorage();
}

export const vaultStorage: VaultStorage = createVaultStorage();
