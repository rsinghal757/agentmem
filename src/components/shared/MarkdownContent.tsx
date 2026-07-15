"use client";

import { code } from "@streamdown/code";
import { Streamdown, type Components } from "streamdown";
import { buildVaultHref, resolveVaultLinkTarget } from "@/lib/vault/links";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
  isInverted?: boolean;
  variant?: "chat" | "note";
}

const streamdownPlugins = { code };
const typesetComponents: Components = {
  p: ({ node: _node, ...props }) => <p {...props} />,
  h1: ({ node: _node, ...props }) => <h1 {...props} />,
  h2: ({ node: _node, ...props }) => <h2 {...props} />,
  h3: ({ node: _node, ...props }) => <h3 {...props} />,
  h4: ({ node: _node, ...props }) => <h4 {...props} />,
  h5: ({ node: _node, ...props }) => <h5 {...props} />,
  h6: ({ node: _node, ...props }) => <h6 {...props} />,
  ul: ({ node: _node, ...props }) => <ul {...props} />,
  ol: ({ node: _node, ...props }) => <ol {...props} />,
  li: ({ node: _node, ...props }) => <li {...props} />,
  blockquote: ({ node: _node, ...props }) => <blockquote {...props} />,
  table: ({ node: _node, ...props }) => (
    <div className="typeset-scroll">
      <table {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }) => <thead {...props} />,
  tbody: ({ node: _node, ...props }) => <tbody {...props} />,
  tfoot: ({ node: _node, ...props }) => <tfoot {...props} />,
  tr: ({ node: _node, ...props }) => <tr {...props} />,
  th: ({ node: _node, ...props }) => <th {...props} />,
  td: ({ node: _node, ...props }) => <td {...props} />,
  a: ({ node: _node, ...props }) => <a {...props} />,
  strong: ({ node: _node, ...props }) => <strong {...props} />,
  em: ({ node: _node, ...props }) => <em {...props} />,
  hr: ({ node: _node, ...props }) => <hr {...props} />,
};

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
  rendered = rendered.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_full, label, href) => {
    const safeHref = escapeHtml(String(href));
    const external = safeHref.startsWith("http://") || safeHref.startsWith("https://");
    const attrs = external
      ? ' target="_blank" rel="noreferrer"'
      : "";
    return `<a href="${safeHref}"${attrs}>${label}</a>`;
  });

  return rendered;
}

export function markdownToHtml(markdown: string) {
  const codeBlocks: string[] = [];

  const withoutCode = markdown.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_full, lang, code) => {
    const safeCode = escapeHtml(code.trimEnd());
    const languageClass = lang ? ` class="language-${escapeHtml(String(lang))}"` : "";
    codeBlocks.push(`<pre><code${languageClass}>${safeCode}</code></pre>`);
    return `@@CODEBLOCK_${codeBlocks.length - 1}@@`;
  });

  const lines = withoutCode.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(listMatch[1])}</li>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<blockquote>${renderInlineMarkdown(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    if (inList) {
      html.push("</ul>");
      inList = false;
    }

    html.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }

  if (inList) {
    html.push("</ul>");
  }

  let rendered = html.join("\n");
  rendered = rendered.replace(/@@CODEBLOCK_(\d+)@@/g, (_full, index) => codeBlocks[Number(index)] || "");
  return rendered;
}

export function markdownWithWikiLinks(content: string, allPaths: string[] = []) {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    const [target, display] = String(raw).split("|");
    const trimmedTarget = target.trim();
    const text = (display || target).trim();
    const resolvedPath = resolveVaultLinkTarget(trimmedTarget, allPaths) || trimmedTarget;
    return `[${text}](${buildVaultHref(resolvedPath)})`;
  });
}

export function MarkdownContent({
  content,
  className,
  isInverted = false,
  variant = "note",
}: MarkdownContentProps) {
  return (
    <Streamdown
      mode={variant === "chat" ? "streaming" : "static"}
      plugins={streamdownPlugins}
      components={typesetComponents}
      controls={false}
      parseIncompleteMarkdown={variant === "chat"}
      className={cn(
        "typeset w-full min-w-0 max-w-none space-y-0 overflow-hidden break-words",
        variant === "chat" ? "typeset-chat" : "typeset-note",
        isInverted && "typeset-inverted",
        className,
      )}
    >
      {content}
    </Streamdown>
  );
}
