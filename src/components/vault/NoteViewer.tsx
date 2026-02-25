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
          className="text-violet-400 underline decoration-violet-400/30 transition-colors hover:text-violet-300"
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
      <div className="flex items-center justify-center py-16 text-neutral-500">
        Loading note...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText className="mb-4 h-12 w-12 text-neutral-600" />
        <p className="text-neutral-400">Note not found</p>
        <Link
          href="/vault"
          className="mt-4 text-sm text-violet-400 hover:text-violet-300"
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
      <div className="mb-6 rounded-2xl border border-white/10 bg-neutral-900/60 p-5 shadow-[0_20px_45px_-36px_rgba(124,58,237,0.95)]">
        <Link
          href="/vault"
          className="mb-4 inline-flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to vault
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-neutral-100">
          {frontmatter?.title || path.split("/").pop()?.replace(".md", "")}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          {frontmatter?.type && (
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 capitalize">
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
                className="inline-flex items-center gap-1 rounded-full bg-violet-900/30 px-2 py-0.5 text-xs text-violet-300"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-sm max-w-none rounded-2xl border border-white/10 bg-neutral-900/40 p-5">
        <div className="whitespace-pre-wrap leading-relaxed text-neutral-200">
          {renderContent(body)}
        </div>
      </div>

      {/* Wikilinks */}
      {wikilinks.length > 0 && (
        <div className="mt-8 border-t border-neutral-800 pt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Links ({wikilinks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {wikilinks.map((link: string) => (
              <Link
                key={link}
                href={`/vault/${link}`}
                className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:border-violet-500 hover:text-violet-300"
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
