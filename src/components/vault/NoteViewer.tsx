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
          className="text-[#6B8F71] underline decoration-[#6B8F71]/30 transition-colors hover:text-[#4A6B4F]"
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
      <div className="flex items-center justify-center py-16 text-gray-400">
        Loading note...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText className="mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Note not found</p>
        <Link
          href="/vault"
          className="mt-4 text-sm text-[#6B8F71] hover:text-[#4A6B4F]"
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
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5">
        <Link
          href="/vault"
          className="mb-4 inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to vault
        </Link>

        <h1 className="mb-2 text-xl font-bold text-neutral-900">
          {frontmatter?.title || path.split("/").pop()?.replace(".md", "")}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {frontmatter?.type && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium capitalize text-gray-600">
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
          <div className="mt-3 flex flex-wrap gap-1.5">
            {frontmatter.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[#E8F0E9] px-2.5 py-0.5 text-xs font-medium text-[#4A6B4F]"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
          {renderContent(body)}
        </div>
      </div>

      {/* Wikilinks */}
      {wikilinks.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Links ({wikilinks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {wikilinks.map((link: string) => (
              <Link
                key={link}
                href={`/vault/${link}`}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#6B8F71]/40 hover:text-[#4A6B4F]"
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
