"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVaultFile, useVaultFiles } from "@/hooks/useVaultFiles";
import Link from "next/link";
import { Tag, Clock, FileText, Save, Pencil, X } from "lucide-react";
import {
  MarkdownContent,
  markdownToHtml,
  markdownWithWikiLinks,
} from "@/components/shared/MarkdownContent";
import { buildVaultHref, resolveVaultLinkTarget } from "@/lib/vault/links";

interface NoteViewerProps {
  path: string;
}

function splitNoteContent(noteContent: string) {
  const frontmatterMatch = noteContent.match(/^---\n[\s\S]*?\n---\n?/);
  if (!frontmatterMatch) {
    return { frontmatterBlock: "", body: noteContent.trim() };
  }

  return {
    frontmatterBlock: frontmatterMatch[0].trim(),
    body: noteContent.slice(frontmatterMatch[0].length).trim(),
  };
}

function serializeNoteContent(frontmatterBlock: string, body: string) {
  const normalizedBody = body.trim();
  if (!frontmatterBlock) {
    return `${normalizedBody}\n`;
  }
  return `${frontmatterBlock}\n\n${normalizedBody}\n`;
}

function htmlToMarkdown(html: string) {
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

    if (tag === "ul") {
      return Array.from(node.querySelectorAll(":scope > li"))
        .map((li) => `- ${Array.from(li.childNodes).map(renderInline).join("").trim()}`)
        .join("\n");
    }

    if (tag === "ol") {
      return Array.from(node.querySelectorAll(":scope > li"))
        .map((li, index) => `${index + 1}. ${Array.from(li.childNodes).map(renderInline).join("").trim()}`)
        .join("\n");
    }

    return inlineContent;
  };

  return Array.from(doc.body.childNodes)
    .map(renderBlock)
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function NoteViewer({ path }: NoteViewerProps) {
  const { content, frontmatter, wikilinks, wordCount, isLoading, error } =
    useVaultFile(path);
  const { files } = useVaultFiles("", true);
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual");
  const [draftBody, setDraftBody] = useState("");
  const [visualHtml, setVisualHtml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);

  const { frontmatterBlock, body } = useMemo(
    () => splitNoteContent(content || ""),
    [content],
  );

  useEffect(() => {
    if (!isEditing && typeof content === "string") {
      setDraftBody(body);
      setVisualHtml(markdownToHtml(body));
    }
  }, [body, content, isEditing]);

  useEffect(() => {
    if (!isEditing || editorMode !== "visual" || !visualEditorRef.current) {
      return;
    }

    if (visualEditorRef.current.innerHTML !== visualHtml) {
      visualEditorRef.current.innerHTML = visualHtml;
    }
  }, [editorMode, isEditing, visualHtml]);

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const nextBody =
        editorMode === "visual"
          ? htmlToMarkdown(visualEditorRef.current?.innerHTML || visualHtml)
          : draftBody;
      const nextContent = serializeNoteContent(frontmatterBlock, nextBody);
      const response = await fetch("/api/vault/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content: nextContent }),
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
      <div className="flex h-full items-center justify-center py-16 text-[15px] text-[#6B6B6B]">
        Loading note viewer...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16">
        <FileText className="mb-4 h-12 w-12 text-[#C7CCC6]" />
        <p className="text-[15px] text-[#6B6B6B]">Note not found</p>
        <Link
          href="/vault"
          className="mt-4 text-[15px] text-[#0B6B3A] hover:text-[#0F7A43]"
        >
          Open vault root
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 rounded-[10px] border border-[#E8EAE7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h1 className="mb-3 text-[24px] font-medium text-[#1C1C1C]">
              {frontmatter?.title || path.split("/").pop()?.replace(".md", "")}
            </h1>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditorMode("visual");
                    setDraftBody(body);
                    setVisualHtml(markdownToHtml(body));
                  }}
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
                      setEditorMode("visual");
                      setDraftBody(body);
                      setVisualHtml(markdownToHtml(body));
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
                <div className="mb-3 inline-flex rounded-[8px] border border-[#E8EAE7] bg-[#F7F8F6] p-1">
                  <button
                    onClick={() => {
                      setEditorMode("visual");
                      setVisualHtml(markdownToHtml(draftBody));
                    }}
                    className={`rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      editorMode === "visual"
                        ? "bg-white text-[#1C1C1C] shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
                        : "text-[#6B6B6B] hover:text-[#1C1C1C]"
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => {
                      const markdownFromVisual = htmlToMarkdown(
                        visualEditorRef.current?.innerHTML || visualHtml,
                      );
                      setDraftBody(markdownFromVisual);
                      setEditorMode("markdown");
                    }}
                    className={`rounded-[6px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      editorMode === "markdown"
                        ? "bg-white text-[#1C1C1C] shadow-[0_1px_1px_rgba(0,0,0,0.08)]"
                        : "text-[#6B6B6B] hover:text-[#1C1C1C]"
                    }`}
                  >
                    Markdown
                  </button>
                </div>
                {editorMode === "visual" ? (
                  <div
                    ref={visualEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(event) => {
                      const nextHtml = event.currentTarget.innerHTML;
                      setVisualHtml(nextHtml);
                    }}
                    className="markdown-content min-h-[420px] w-full rounded-[8px] border border-[#E8EAE7] bg-[#FDFEFC] p-4 text-[15px] leading-[1.6] text-[#1C1C1C] outline-none transition-colors focus:border-[#0B6B3A]/50"
                  />
                ) : (
                  <textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    className="min-h-[420px] w-full resize-y rounded-[8px] border border-[#E8EAE7] bg-[#FDFEFC] p-4 font-mono text-[13px] leading-[1.6] text-[#1C1C1C] outline-none transition-colors focus:border-[#0B6B3A]/50"
                    spellCheck={false}
                  />
                )}
                {saveError && (
                  <p className="mt-3 text-[13px] text-[#B42318]">{saveError}</p>
                )}
              </div>
            ) : (
              <MarkdownContent
                content={markdownWithWikiLinks(body, files)}
                className="text-[15px] leading-[1.6] text-[#1C1C1C]"
              />
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
                    href={buildVaultHref(resolveVaultLinkTarget(link, files) || link)}
                    className="rounded-[8px] border border-[#E8EAE7] bg-white px-3 py-1.5 text-[13px] font-medium text-[#6B6B6B] transition-colors hover:border-[#0B6B3A]/40 hover:text-[#1C1C1C]"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
