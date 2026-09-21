/**
 * Markdown ⇄ HTML for the visual note editor.
 *
 * The file on disk is the source of truth, so both directions have to be
 * loss-free for everything GizzNote renders: paragraphs that are hard-wrapped
 * in the source, nested lists, GFM tables, rules and fenced code. Wikilinks
 * are deliberately left as literal `[[text]]` so the writer edits the link
 * rather than a resolved href.
 *
 * Markdown collapses a single newline into a space, so a hard-wrapped
 * paragraph has to become one `<p>`. Writing it back out as one long line
 * would be semantically identical but would reflow the whole file, burying a
 * one-word edit in a whole-note diff. `parseMarkdownForEditor` therefore
 * hands back a memory of how each block was wrapped, and `htmlToMarkdown`
 * reuses it for every block the writer left alone.
 */

/** Original wrapping for each block, keyed by that block's unwrapped text. */
export type WrapMemory = Map<string, string[]>;

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text: string) {
  let rendered = escapeHtml(text);

  rendered = rendered.replace(/`([^`]+)`/g, "<code>$1</code>");
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/~~([^~]+)~~/g, "<s>$1</s>");
  rendered = rendered.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_full, label, href) => {
    const safeHref = escapeHtml(String(href));
    const external = safeHref.startsWith("http://") || safeHref.startsWith("https://");
    return `<a href="${safeHref}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`;
  });

  return rendered;
}

type ListFrame = { tag: "ul" | "ol"; indent: number };

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_DIVIDER = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** The single-line form of a block, used to key its original wrapping. */
function unwrap(lines: string[]) {
  return lines.map((line) => line.trim()).join(" ");
}

/** Build the exact string `renderTable` emits, so tables can be looked up. */
function tableKey(header: string[], rows: string[][]) {
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

/**
 * Convert markdown source into the HTML the contenteditable surface shows,
 * along with a record of how the source wrapped each block.
 */
export function parseMarkdownForEditor(markdown: string): {
  html: string;
  wrapMemory: WrapMemory;
} {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const listStack: ListFrame[] = [];
  const wrapMemory: WrapMemory = new Map();
  let paragraph: string[] = [];

  /** Only worth remembering when the source actually spanned several lines. */
  const remember = (key: string, original: string[]) => {
    if (original.length > 1 && key) wrapMemory.set(key, original);
  };

  // A list item's text can continue across lines, so it is accumulated until
  // the next item or the end of the list.
  let openItem: string[] | null = null;

  const closeItem = () => {
    if (!openItem) return;
    // The marker belongs to the list, not the item's text.
    const [first, ...rest] = openItem;
    const withoutMarker = first.replace(LIST_ITEM, "$3");
    remember(unwrap([withoutMarker, ...rest]), [withoutMarker, ...rest]);
    openItem = null;
  };

  const closeParagraph = () => {
    if (paragraph.length === 0) return;
    remember(unwrap(paragraph), [...paragraph]);
    html.push(`<p>${renderInlineMarkdown(unwrap(paragraph))}</p>`);
    paragraph = [];
  };

  const closeLists = (toIndent = -1) => {
    if (listStack.length > 0) closeItem();
    while (listStack.length > 0 && listStack[listStack.length - 1].indent > toIndent) {
      html.push(`</li></${listStack.pop()!.tag}>`);
    }
  };

  const closeBlocks = () => {
    closeParagraph();
    closeLists();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      closeBlocks();
      continue;
    }

    if (trimmed.startsWith("```")) {
      closeBlocks();
      const language = trimmed.slice(3).trim();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        body.push(lines[index]);
        index += 1;
      }
      const languageClass = language ? ` class="language-${escapeHtml(language)}"` : "";
      html.push(`<pre><code${languageClass}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      closeBlocks();
      html.push("<hr>");
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeBlocks();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    // GFM table: a header row followed by a divider row.
    if (
      trimmed.includes("|") &&
      index + 1 < lines.length &&
      TABLE_DIVIDER.test(lines[index + 1]) &&
      lines[index + 1].includes("|")
    ) {
      closeBlocks();
      const header = splitTableRow(trimmed);
      index += 2;

      const originalTable = [lines[index - 2], lines[index - 1]];
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().includes("|")) {
        originalTable.push(lines[index]);
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      index -= 1;

      // Tables are remembered so aligned pipe padding is not squashed.
      wrapMemory.set(tableKey(header, rows), originalTable);

      const headCells = header
        .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
        .join("");
      const bodyRows = rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`,
        )
        .join("");

      html.push(
        `<table><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table>`,
      );
      continue;
    }

    const listItem = line.match(LIST_ITEM);
    if (listItem) {
      closeParagraph();
      closeItem();
      const indent = listItem[1].length;
      const tag: "ul" | "ol" = /\d/.test(listItem[2]) ? "ol" : "ul";
      const top = listStack[listStack.length - 1];

      if (!top || indent > top.indent) {
        listStack.push({ tag, indent });
        html.push(`<${tag}><li>`);
      } else {
        closeLists(indent);
        const current = listStack[listStack.length - 1];
        if (!current) {
          listStack.push({ tag, indent });
          html.push(`<${tag}><li>`);
        } else if (current.tag !== tag) {
          html.push(`</li></${current.tag}>`);
          listStack[listStack.length - 1] = { tag, indent };
          html.push(`<${tag}><li>`);
        } else {
          html.push("</li><li>");
        }
      }

      // Opened only after the stack settles, since closing a level flushes
      // whichever item is currently open.
      openItem = [line];
      html.push(renderInlineMarkdown(listItem[3]));
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeBlocks();
      const original: string[] = [line];
      const quote: string[] = [trimmed.replace(/^>\s?/, "")];
      while (index + 1 < lines.length && lines[index + 1].trim().startsWith(">")) {
        index += 1;
        original.push(lines[index]);
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
      }
      remember(unwrap(quote), original);
      html.push(`<blockquote>${renderInlineMarkdown(unwrap(quote))}</blockquote>`);
      continue;
    }

    // A continuation of the current paragraph: markdown treats a single
    // newline as a space, so hard-wrapped source must not become <p> per line.
    if (listStack.length > 0) {
      openItem?.push(line);
      html.push(` ${renderInlineMarkdown(trimmed)}`);
      continue;
    }

    paragraph.push(line);
  }

  closeBlocks();
  return { html: html.join("\n"), wrapMemory };
}

/** Convert markdown source into the HTML the contenteditable surface shows. */
export function markdownToHtml(markdown: string) {
  return parseMarkdownForEditor(markdown).html;
}

/**
 * Convert the contenteditable surface's HTML back into markdown, restoring the
 * source's own line wrapping for any block the writer did not change.
 */
export function htmlToMarkdown(html: string, wrapMemory?: WrapMemory) {
  if (typeof window === "undefined") {
    return "";
  }

  const rewrap = (key: string) => wrapMemory?.get(key);

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

    if (tag === "strong" || tag === "b") return `**${content}**`;
    if (tag === "em" || tag === "i") return `*${content}*`;
    if (tag === "s" || tag === "del" || tag === "strike") return `~~${content}~~`;
    if (tag === "code") return `\`${content}\``;
    if (tag === "br") return "\n";
    if (tag === "a") {
      const href = node.getAttribute("href") || "#";
      return `[${content}](${href})`;
    }

    return content;
  };

  const renderList = (node: HTMLElement, ordered: boolean, depth: number): string => {
    const indent = "  ".repeat(depth);

    return Array.from(node.children)
      .filter((child): child is HTMLElement => child.tagName.toLowerCase() === "li")
      .map((li, position) => {
        const nested: string[] = [];
        const inline: string[] = [];

        for (const child of Array.from(li.childNodes)) {
          const childTag =
            child instanceof HTMLElement ? child.tagName.toLowerCase() : null;

          if (childTag === "ul" || childTag === "ol") {
            nested.push(renderList(child as HTMLElement, childTag === "ol", depth + 1));
            continue;
          }
          inline.push(renderInline(child));
        }

        const marker = ordered ? `${position + 1}.` : "-";
        const text = inline.join("").replace(/\s+/g, " ").trim();
        const remembered = rewrap(text);
        // Continuation lines keep the indentation the source gave them.
        const line = remembered
          ? [`${indent}${marker} ${remembered[0]}`, ...remembered.slice(1)].join("\n")
          : `${indent}${marker} ${text}`;
        return nested.length > 0 ? `${line}\n${nested.join("\n")}` : line;
      })
      .join("\n");
  };

  const renderTable = (node: HTMLElement): string => {
    const rows = Array.from(node.querySelectorAll("tr"));
    if (rows.length === 0) return "";

    const toCells = (row: Element) =>
      Array.from(row.children).map((cell) =>
        Array.from(cell.childNodes).map(renderInline).join("").trim(),
      );

    const [headerRow, ...bodyRows] = rows;
    const header = toCells(headerRow);
    const body = bodyRows.map(toCells);

    const normalized = tableKey(header, body);
    return rewrap(normalized)?.join("\n") ?? normalized;
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

    if (/^h[1-6]$/.test(tag)) {
      return `${"#".repeat(Number(tag[1]))} ${inlineContent}`.trim();
    }

    if (tag === "hr") return "---";
    if (tag === "table") return renderTable(node);
    if (tag === "ul" || tag === "ol") return renderList(node, tag === "ol", 0);

    if (tag === "blockquote") {
      const remembered = rewrap(inlineContent);
      if (remembered) return remembered.join("\n");

      return inlineContent
        .split("\n")
        .filter(Boolean)
        .map((line) => `> ${line}`)
        .join("\n");
    }

    if (tag === "pre") {
      const codeElement = node.querySelector("code");
      const code = codeElement?.textContent || node.textContent || "";
      const language =
        codeElement?.className.match(/language-([\w+-]+)/)?.[1] ?? "";
      return `\`\`\`${language}\n${code.trimEnd()}\n\`\`\``;
    }

    const remembered = rewrap(inlineContent);
    return remembered ? remembered.join("\n") : inlineContent;
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
