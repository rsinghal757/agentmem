"use client";

import { buildVaultHref, resolveVaultLinkTarget } from "@/lib/vault/links";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
  isInverted?: boolean;
}

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
}: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "markdown-content max-w-none break-words text-[15px] leading-[1.6]",
        isInverted ? "text-white" : "text-[#1C1C1C]",
        className,
      )}
      dangerouslySetInnerHTML={{
        __html: markdownToHtml(content),
      }}
    />
  );
}
