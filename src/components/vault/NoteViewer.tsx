"use client";

import { useEffect, useState } from "react";
import { useVaultFile } from "@/hooks/useVaultFiles";
import Link from "next/link";
import { ArrowLeft, Tag, Clock, FileText, Save, Pencil, X } from "lucide-react";
import { MarkdownContent, markdownWithWikiLinks } from "@/components/shared/MarkdownContent";

interface NoteViewerProps {
  path: string;
}

export function NoteViewer({ path }: NoteViewerProps) {
  const { content, frontmatter, wikilinks, wordCount, isLoading, error } =
    useVaultFile(path);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing && typeof content === "string") {
      setDraftContent(content);
    }
  }, [content, isEditing]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/vault/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content: draftContent }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Failed to save note");
      }

      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  }

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

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E8EAE7] bg-[#F7F8F6] px-3 py-1.5 text-[13px] font-medium text-[#1C1C1C] transition-colors hover:border-[#0B6B3A]/40"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit note
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#0B6B3A] bg-[#0B6B3A] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0F7A43] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSaveError(null);
                  setDraftContent(content || "");
                }}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E8EAE7] bg-[#F7F8F6] px-3 py-1.5 text-[13px] font-medium text-[#1C1C1C] transition-colors hover:border-[#BFC5BE] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </>
          )}
        </div>

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
        {isEditing ? (
          <div>
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              className="min-h-[420px] w-full resize-y rounded-[8px] border border-[#E8EAE7] bg-[#FDFEFC] p-4 font-mono text-[13px] leading-[1.6] text-[#1C1C1C] outline-none transition-colors focus:border-[#0B6B3A]/50"
              spellCheck={false}
            />
            {saveError && (
              <p className="mt-3 text-[13px] text-[#B42318]">{saveError}</p>
            )}
          </div>
        ) : (
          <MarkdownContent content={markdownWithWikiLinks(body)} className="text-[15px] leading-[1.6] text-[#1C1C1C]" />
        )}
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
