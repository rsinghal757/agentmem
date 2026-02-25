/** Frontmatter metadata for a vault note */
export interface FrontMatter {
  title: string;
  created: string;
  updated: string;
  tags: string[];
  type: NoteType;
  links?: string[];
  confidence?: "high" | "medium" | "low";
  "auto-maintained"?: boolean;
}

/** Allowed note types in the vault */
export type NoteType =
  | "concept"
  | "person"
  | "project"
  | "decision"
  | "daily"
  | "fleeting"
  | "reference"
  | "core-memory";

/** A parsed vault note with content and metadata */
export interface VaultNote {
  path: string;
  content: string;
  frontmatter: FrontMatter;
  body: string; // content without frontmatter
  wikilinks: string[];
}

/** A vault file entry (from the index/database) */
export interface VaultFile {
  id: string;
  userId: string;
  path: string;
  title: string | null;
  tags: string[];
  type: string | null;
  wikilinkTargets: string[];
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Graph node for D3 visualization */
export interface GraphNode {
  id: string;
  title: string | null;
  type: string | null;
  tags: string[];
  backlinks: number;
}

/** Graph edge for D3 visualization */
export interface GraphEdge {
  source: string;
  target: string;
}

/** Full graph data for the vault */
export interface VaultGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Search result from vault search */
export interface VaultSearchResult {
  path: string;
  title: string | null;
  tags: string[];
  type: string | null;
  snippet?: string;
  similarity?: number;
}

/** Vault activity event for the activity feed */
export interface VaultActivity {
  id: string;
  action: "created" | "updated" | "deleted" | "linked";
  path: string;
  reason?: string;
  timestamp: Date;
}

/** Storage abstraction interface */
export interface VaultStorage {
  read(userId: string, path: string): Promise<string | null>;
  write(userId: string, path: string, content: string): Promise<void>;
  delete(userId: string, path: string): Promise<void>;
  list(
    userId: string,
    directory: string,
    recursive: boolean,
  ): Promise<string[]>;
  exists(userId: string, path: string): Promise<boolean>;
}
