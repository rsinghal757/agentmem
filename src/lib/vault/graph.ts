import type { GraphNode, GraphEdge, VaultGraph } from "@/types/vault";
import { vaultStorage } from "./storage";
import { parseFrontmatter, extractWikilinks } from "./markdown";

/** Build a graph from all vault files for a user */
export async function buildVaultGraph(userId: string): Promise<VaultGraph> {
  const allFiles = await vaultStorage.list(userId, "", true);
  const mdFiles = allFiles.filter((f) => f.endsWith(".md"));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const backlinkCounts: Record<string, number> = {};

  // First pass: collect all nodes and edges
  for (const filePath of mdFiles) {
    const content = await vaultStorage.read(userId, filePath);
    if (!content) continue;

    const frontmatter = parseFrontmatter(content);
    const wikilinks = extractWikilinks(content);

    nodes.push({
      id: filePath,
      title: frontmatter?.title || filePath.split("/").pop()?.replace(".md", "") || filePath,
      type: frontmatter?.type || null,
      tags: frontmatter?.tags || [],
      backlinks: 0, // will be computed in second pass
    });

    // Create edges from wikilinks
    for (const link of wikilinks) {
      // Try to resolve the wikilink to a file path
      const targetPath = resolveLink(link, mdFiles);
      if (targetPath) {
        edges.push({ source: filePath, target: targetPath });
        backlinkCounts[targetPath] = (backlinkCounts[targetPath] || 0) + 1;
      }
    }
  }

  // Second pass: set backlink counts
  for (const node of nodes) {
    node.backlinks = backlinkCounts[node.id] || 0;
  }

  return { nodes, edges };
}

/** Resolve a wikilink name to a file path from the list of known files */
function resolveLink(linkName: string, allPaths: string[]): string | null {
  // Try exact path match
  if (allPaths.includes(linkName)) return linkName;
  if (allPaths.includes(`${linkName}.md`)) return `${linkName}.md`;

  // Try matching by filename only
  for (const p of allPaths) {
    const filename = p.split("/").pop()?.replace(".md", "");
    if (filename === linkName) return p;
  }

  return null;
}

/** Get backlinks for a specific note */
export async function getBacklinks(
  userId: string,
  targetPath: string,
): Promise<{ path: string; title: string | null }[]> {
  const allFiles = await vaultStorage.list(userId, "", true);
  const mdFiles = allFiles.filter((f) => f.endsWith(".md"));
  const backlinks: { path: string; title: string | null }[] = [];

  const targetName = targetPath.split("/").pop()?.replace(".md", "") || "";

  for (const filePath of mdFiles) {
    if (filePath === targetPath) continue;

    const content = await vaultStorage.read(userId, filePath);
    if (!content) continue;

    const wikilinks = extractWikilinks(content);
    const linksToTarget = wikilinks.some(
      (link) =>
        link === targetName ||
        link === targetPath ||
        link === targetPath.replace(".md", ""),
    );

    if (linksToTarget) {
      const frontmatter = parseFrontmatter(content);
      backlinks.push({
        path: filePath,
        title: frontmatter?.title || null,
      });
    }
  }

  return backlinks;
}
