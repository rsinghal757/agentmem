/** Build a vault route path with per-segment URL encoding. */
export function buildVaultHref(path: string): string {
  const encodedPath = path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/vault/${encodedPath}`;
}

/**
 * Resolve a wikilink reference to a concrete markdown path from known vault files.
 *
 * Supports full paths (with or without .md) and filename-only links like [[chiara-marletto]].
 */
export function resolveVaultLinkTarget(
  linkName: string,
  allPaths: string[],
): string | null {
  const normalizedLink = linkName.trim();
  if (!normalizedLink) return null;

  if (allPaths.includes(normalizedLink)) {
    return normalizedLink;
  }

  const withExtension = normalizedLink.endsWith(".md")
    ? normalizedLink
    : `${normalizedLink}.md`;
  if (allPaths.includes(withExtension)) {
    return withExtension;
  }

  for (const path of allPaths) {
    const filename = path.split("/").pop()?.replace(/\.md$/, "");
    if (filename === normalizedLink) {
      return path;
    }
  }

  return null;
}
