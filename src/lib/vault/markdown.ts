import matter from "gray-matter";
import type { FrontMatter } from "@/types/vault";

/** Parse frontmatter from markdown content */
export function parseFrontmatter(content: string): FrontMatter | null {
  try {
    const { data } = matter(content);
    return {
      title: data.title || "",
      created: data.created || new Date().toISOString(),
      updated: data.updated || new Date().toISOString(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      type: data.type || "concept",
      links: Array.isArray(data.links) ? data.links : [],
      confidence: data.confidence,
      "auto-maintained": data["auto-maintained"],
    };
  } catch {
    return null;
  }
}

/** Extract the body (content without frontmatter) */
export function extractBody(content: string): string {
  try {
    const { content: body } = matter(content);
    return body.trim();
  } catch {
    return content;
  }
}

/** Extract all [[wikilinks]] from markdown content */
export function extractWikilinks(content: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const link = match[1].split("|")[0].trim(); // handle [[link|display text]]
    if (!links.includes(link)) {
      links.push(link);
    }
  }

  return links;
}

/** Resolve a wikilink name to a file path */
export function resolveWikilink(
  linkName: string,
  allPaths: string[],
): string | null {
  // Exact match
  const exactMatch = allPaths.find(
    (p) => p === linkName || p === `${linkName}.md`,
  );
  if (exactMatch) return exactMatch;

  // Match by filename (without directory)
  const byFilename = allPaths.find((p) => {
    const filename = p.split("/").pop()?.replace(".md", "");
    return filename === linkName;
  });
  if (byFilename) return byFilename;

  return null;
}

/** Count words in markdown content (excluding frontmatter) */
export function countWords(content: string): number {
  const body = extractBody(content);
  return body
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/** Add a wikilink reference to an existing note's content */
export function addWikilinkToContent(
  content: string,
  targetName: string,
  context: string,
): string {
  const body = extractBody(content);
  const { data } = matter(content);

  // Check if the link already exists
  if (content.includes(`[[${targetName}]]`)) {
    return content;
  }

  // Add to the Connections section if it exists, otherwise append
  const connectionsRegex = /## Connections\n/;
  let updatedBody: string;

  if (connectionsRegex.test(body)) {
    updatedBody = body.replace(
      /## Connections\n/,
      `## Connections\n- ${context}: [[${targetName}]]\n`,
    );
  } else {
    updatedBody = `${body}\n\n## Connections\n- ${context}: [[${targetName}]]\n`;
  }

  // Update the frontmatter links array
  const links = Array.isArray(data.links) ? data.links : [];
  if (!links.includes(targetName)) {
    links.push(targetName);
  }
  data.links = links;
  data.updated = new Date().toISOString();

  return matter.stringify(updatedBody, data);
}

/** Generate frontmatter string from data */
export function generateFrontmatter(data: Partial<FrontMatter>): string {
  const fm: Record<string, unknown> = {
    title: data.title || "Untitled",
    created: data.created || new Date().toISOString(),
    updated: data.updated || new Date().toISOString(),
    tags: data.tags || [],
    type: data.type || "concept",
  };

  if (data.links && data.links.length > 0) {
    fm.links = data.links;
  }
  if (data.confidence) {
    fm.confidence = data.confidence;
  }

  return matter.stringify("", fm).trim();
}
