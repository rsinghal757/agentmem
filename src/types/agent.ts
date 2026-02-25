/** Memory entry from Mem0 */
export interface Mem0Memory {
  id: string;
  memory: string;
  created_at?: string;
  updated_at?: string;
}

/** Context injected into the system prompt */
export interface AgentContext {
  mem0Memories: Mem0Memory[];
  coreMemory: string;
}

/** Chat conversation metadata */
export interface Chat {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Tool call display info for the UI */
export interface ToolCallInfo {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
}

/** Vault tool names */
export type VaultToolName =
  | "vault_read"
  | "vault_write"
  | "vault_search"
  | "vault_list"
  | "vault_link"
  | "vault_delete";
