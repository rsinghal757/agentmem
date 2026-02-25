"use client";

import { useVaultFile } from "@/hooks/useVaultFiles";
import Link from "next/link";
import { ArrowLeft, Tag, Clock, FileText } from "lucide-react";

interface NoteViewerProps {
  path: string;
}

/** Render markdown content with wikilink resolution */
function renderContent(content: string): React.ReactNode {
  // Replace [[wikilinks]] with clickable links
  const parts = content.split(/(\[\[[^\]]+\]\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/);
    if (match) {
      const linkText = match[1];
      const [target, display] = linkText.split("|");
      return (
        <Link
          key={i}
          href={`/vault/${target.trim()}`}
          className="text-[#0B6B3A] underline decoration-[#0B6B3A]/30 transition-colors hover:text-[#0F7A43]"
        >
          {display?.trim() || target.trim()}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function NoteViewer({ path }: NoteViewerProps) {
  const { content, frontmatter, wikilinks, wordCount, isLoading, error } =
    useVaultFile(path);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[15px] text-[#6B6B6B]">
        Loading note...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText className="mb-4 h-12 w-12 text-[#C7CCC6]" />
        <p className="text-[15px] text-[#6B6B6B]">Note not found</p>
        <Link
          href="/vault"
          className="mt-4 text-[15px] text-[#0B6B3A] hover:text-[#0F7A43]"
        >
          ← Back to vault
        </Link>
      </div>
    );
  }

  // Extract body (content without frontmatter)
  const bodyStart = content.indexOf("---", content.indexOf("---") + 3);
  const body =
    bodyStart > 0 ? content.slice(bodyStart + 3).trim() : content;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 rounded-[10px] border border-[#E8EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Link
          href="/vault"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-[#6B6B6B] transition-colors hover:text-[#1C1C1C]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to vault
        </Link>

        <h1 className="mb-3 text-[24px] font-medium text-[#1C1C1C]">
          {frontmatter?.title || path.split("/").pop()?.replace(".md", "")}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#6B6B6B]">
          {frontmatter?.type && (
            <span className="rounded-[8px] border border-[#E8EAE7] bg-[#F7F8F6] px-2.5 py-1 font-medium capitalize text-[#1C1C1C]">
              {frontmatter.type}
            </span>
          )}
          {frontmatter?.updated && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(frontmatter.updated).toLocaleDateString()}
            </span>
          )}
          <span>{wordCount} words</span>
        </div>

        {/* Tags */}
        {frontmatter?.tags && frontmatter.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {frontmatter.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-[8px] border border-[#E8EAE7] bg-[#F7F8F6] px-2.5 py-1 text-[13px] font-medium text-[#0B6B3A]"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-none rounded-[10px] border border-[#E8EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="whitespace-pre-wrap text-[15px] leading-[1.6] text-[#1C1C1C]">
          {renderContent(body)}
        </div>
      </div>

      {/* Wikilinks */}
      {wikilinks.length > 0 && (
        <div className="mt-8 border-t border-[#E8EAE7] pt-6">
          <h3 className="mb-3 text-[18px] font-medium text-[#1C1C1C]">
            Links ({wikilinks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {wikilinks.map((link: string) => (
              <Link
                key={link}
                href={`/vault/${link}`}
                className="rounded-[8px] border border-[#E8EAE7] bg-white px-3 py-1.5 text-[13px] font-medium text-[#6B6B6B] transition-colors hover:border-[#0B6B3A]/40 hover:text-[#1C1C1C]"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
