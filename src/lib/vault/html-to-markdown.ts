/**
 * Converts the visual editor's contenteditable HTML back to markdown so the
 * file on disk stays the source of truth.
 */
export function htmlToMarkdown(html: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const renderInline = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    const content = Array.from(node.childNodes).map(renderInline).join("");
    const tag = node.tagName.toLowerCase();

    if (tag === "strong" || tag === "b") {
      return `**${content}**`;
    }

    if (tag === "em" || tag === "i") {
      return `*${content}*`;
    }

    if (tag === "s" || tag === "del" || tag === "strike") {
      return `~~${content}~~`;
    }

    if (tag === "code") {
      return `\`${content}\``;
    }

    if (tag === "a") {
      const href = node.getAttribute("href") || "#";
      return `[${content}](${href})`;
    }

    if (tag === "br") {
      return "\n";
    }

    return content;
  };

  const renderList = (node: HTMLElement, ordered: boolean, depth: number): string => {
    const indent = "  ".repeat(depth);

    return Array.from(node.children)
      .filter((child): child is HTMLElement => child.tagName.toLowerCase() === "li")
      .map((li, index) => {
        const nested: string[] = [];
        const inlineParts: string[] = [];

        for (const child of Array.from(li.childNodes)) {
          if (
            child instanceof HTMLElement &&
            (child.tagName.toLowerCase() === "ul" || child.tagName.toLowerCase() === "ol")
          ) {
            nested.push(
              renderList(child, child.tagName.toLowerCase() === "ol", depth + 1),
            );
            continue;
          }
          inlineParts.push(renderInline(child));
        }

        const marker = ordered ? `${index + 1}.` : "-";
        const line = `${indent}${marker} ${inlineParts.join("").trim()}`;
        return nested.length > 0 ? `${line}\n${nested.join("\n")}` : line;
      })
      .join("\n");
  };

  const renderBlock = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || "").trim();
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    const tag = node.tagName.toLowerCase();
    const inlineContent = Array.from(node.childNodes).map(renderInline).join("").trim();

    if (tag.match(/^h[1-6]$/)) {
      const level = Number(tag[1]);
      return `${"#".repeat(level)} ${inlineContent}`.trim();
    }

    if (tag === "hr") {
      return "---";
    }

    if (tag === "p" || tag === "div") {
      return inlineContent;
    }

    if (tag === "blockquote") {
      return inlineContent
        .split("\n")
        .filter(Boolean)
        .map((line) => `> ${line}`)
        .join("\n");
    }

    if (tag === "pre") {
      const code = node.querySelector("code")?.textContent || node.textContent || "";
      return `\`\`\`\n${code.trimEnd()}\n\`\`\``;
    }

    if (tag === "ul" || tag === "ol") {
      return renderList(node, tag === "ol", 0);
    }

    return inlineContent;
  };

  return Array.from(doc.body.childNodes)
    .map(renderBlock)
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Split a note into its frontmatter block and its body. */
export function splitNoteContent(noteContent: string) {
  const frontmatterMatch = noteContent.match(/^---\n[\s\S]*?\n---\n?/);
  if (!frontmatterMatch) {
    return { frontmatterBlock: "", body: noteContent.trim() };
  }

  return {
    frontmatterBlock: frontmatterMatch[0].trim(),
    body: noteContent.slice(frontmatterMatch[0].length).trim(),
  };
}

/** Rejoin a frontmatter block and body into a complete note. */
export function serializeNoteContent(frontmatterBlock: string, body: string) {
  const normalizedBody = body.trim();
  if (!frontmatterBlock) {
    return `${normalizedBody}\n`;
  }
  return `${frontmatterBlock}\n\n${normalizedBody}\n`;
}
