import { MemoryClient } from "mem0ai";
import type { Mem0Memory } from "@/types/agent";

/** Lazy-initialized Mem0 client */
let client: MemoryClient | null = null;

function getClient(): MemoryClient | null {
  if (!process.env.MEM0_API_KEY) {
    return null;
  }
  if (!client) {
    client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });
  }
  return client;
}

/**
 * Retrieve relevant memories for a query.
 * Returns empty array if Mem0 is not configured or query is empty.
 */
export async function retrieveMemories(
  query: string,
  options: { user_id: string; limit?: number },
): Promise<Mem0Memory[]> {
  const mem0 = getClient();
  if (!mem0 || !query.trim()) {
    return [];
  }

  try {
    const results = await mem0.search(query, {
      user_id: options.user_id,
      limit: options.limit || 10,
    });

    return results.map((r) => ({
      id: r.id || "",
      memory: r.memory || "",
      created_at: r.created_at ? String(r.created_at) : undefined,
      updated_at: r.updated_at ? String(r.updated_at) : undefined,
    }));
  } catch (error) {
    console.error("[Mem0] Error retrieving memories:", error);
    return [];
  }
}

/**
 * Add new memories from a conversation.
 * Mem0 auto-extracts facts from the messages.
 */
export async function addMemories(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  options: { user_id: string },
): Promise<void> {
  const mem0 = getClient();
  if (!mem0) {
    return;
  }

  try {
    await mem0.add(messages, { user_id: options.user_id });
  } catch (error) {
    console.error("[Mem0] Error adding memories:", error);
  }
}

/**
 * Get all memories for a user.
 */
export async function getAllMemories(
  userId: string,
): Promise<Mem0Memory[]> {
  const mem0 = getClient();
  if (!mem0) {
    return [];
  }

  try {
    const results = await mem0.getAll({ user_id: userId });
    return results.map((r) => ({
      id: r.id || "",
      memory: r.memory || "",
      created_at: r.created_at ? String(r.created_at) : undefined,
      updated_at: r.updated_at ? String(r.updated_at) : undefined,
    }));
  } catch (error) {
    console.error("[Mem0] Error getting all memories:", error);
    return [];
  }
}
