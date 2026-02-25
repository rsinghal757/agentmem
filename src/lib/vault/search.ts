import type { VaultSearchResult } from "@/types/vault";
import { vaultStorage } from "./storage";
import { parseFrontmatter, extractBody } from "./markdown";

/**
 * Search the vault by keyword (fulltext) or semantic similarity.
 * For local dev, semantic search falls back to fulltext.
 * In production, this would use pgvector embeddings.
 */
export async function vaultSearch(
  userId: string,
  query: string,
  mode: "fulltext" | "semantic" = "fulltext",
  limit: number = 5,
): Promise<VaultSearchResult[]> {
  // For local dev, both modes use fulltext search
  // In production, semantic mode would use OpenAI embeddings + pgvector
  if (mode === "semantic") {
    // TODO: Implement semantic search with embeddings in production
    return fulltextSearch(userId, query, limit);
  }

  return fulltextSearch(userId, query, limit);
}

/** Full-text search across all vault files */
async function fulltextSearch(
  userId: string,
  query: string,
  limit: number,
): Promise<VaultSearchResult[]> {
  const allFiles = await vaultStorage.list(userId, "", true);
  const mdFiles = allFiles.filter((f) => f.endsWith(".md"));
  const results: VaultSearchResult[] = [];
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 0);

  for (const filePath of mdFiles) {
    const content = await vaultStorage.read(userId, filePath);
    if (!content) continue;

    const frontmatter = parseFrontmatter(content);
    const body = extractBody(content);
    const contentLower = content.toLowerCase();

    // Score based on matches
    let score = 0;

    // Title match (highest weight)
    if (frontmatter?.title?.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Tag match
    if (frontmatter?.tags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
      score += 5;
    }

    // Body match - count term occurrences
    for (const term of queryTerms) {
      const occurrences = (contentLower.match(new RegExp(term, "g")) || []).length;
      score += occurrences;
    }

    if (score > 0) {
      // Extract a snippet around the first match
      const snippet = extractSnippet(body, queryTerms[0] || query);

      results.push({
        path: filePath,
        title: frontmatter?.title || null,
        tags: frontmatter?.tags || [],
        type: frontmatter?.type || null,
        snippet,
        similarity: score / 20, // normalize to 0-1 range roughly
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

  return results.slice(0, limit);
}

/** Extract a text snippet around the first occurrence of a search term */
function extractSnippet(
  body: string,
  term: string,
  contextChars: number = 100,
): string {
  const lowerBody = body.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const index = lowerBody.indexOf(lowerTerm);

  if (index === -1) {
    return body.slice(0, contextChars * 2) + (body.length > contextChars * 2 ? "..." : "");
  }

  const start = Math.max(0, index - contextChars);
  const end = Math.min(body.length, index + term.length + contextChars);
  let snippet = body.slice(start, end);

  if (start > 0) snippet = "..." + snippet;
  if (end < body.length) snippet = snippet + "...";

  return snippet;
}
