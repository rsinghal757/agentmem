/**
 * Normalize vault paths so all systems resolve to the same canonical markdown file path.
 */
export function normalizeVaultPath(inputPath: string): string {
  const trimmed = inputPath.trim();
  const noLeading = trimmed.replace(/^[/\\]+/, "");
  const normalizedSeparators = noLeading.replace(/\\+/g, "/");
  const collapsed = normalizedSeparators.replace(/\/+/g, "/");
  const cleaned = collapsed
    .split("/")
    .filter((segment) => segment.length > 0)
    .join("/");

  if (!cleaned) {
    return "untitled.md";
  }

  if (cleaned.endsWith(".md")) {
    return cleaned;
  }

  const filename = cleaned.split("/").pop() || "";
  if (filename.includes(".")) {
    return cleaned;
  }

  return `${cleaned}.md`;
}
