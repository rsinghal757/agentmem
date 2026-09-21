/**
 * Markdown ⇄ HTML for the visual note editor.
 *
 * The file on disk is the source of truth, so both directions have to be
 * loss-free for everything GizzNote renders: paragraphs that are hard-wrapped
 * in the source, nested lists, GFM tables, rules and fenced code. Wikilinks
 * are deliberately left as literal `[[text]]` so the writer edits the link
 * rather than a resolved href.
 */

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

/** Convert markdown source into the HTML the contenteditable surface shows. */
export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const listStack: ListFrame[] = [];
  let paragraph: string[] = [];

  const closeParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const closeLists = (toIndent = -1) => {
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

      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      index -= 1;

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

      html.push(renderInlineMarkdown(listItem[3]));
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeBlocks();
      const quote: string[] = [trimmed.replace(/^>\s?/, "")];
      while (index + 1 < lines.length && lines[index + 1].trim().startsWith(">")) {
        index += 1;
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
      }
      html.push(`<blockquote>${renderInlineMarkdown(quote.join(" "))}</blockquote>`);
      continue;
    }

    // A continuation of the current paragraph: markdown treats a single
    // newline as a space, so hard-wrapped source must not become <p> per line.
    if (listStack.length > 0) {
      html.push(` ${renderInlineMarkdown(trimmed)}`);
      continue;
    }

    paragraph.push(trimmed);
  }

  closeBlocks();
  return html.join("\n");
}

/** Convert the contenteditable surface's HTML back into markdown. */
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
        const line = `${indent}${marker} ${inline.join("").replace(/\s+/g, " ").trim()}`;
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

    return [
      `| ${header.join(" | ")} |`,
      `| ${header.map(() => "---").join(" | ")} |`,
      ...bodyRows.map((row) => `| ${toCells(row).join(" | ")} |`),
    ].join("\n");
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
