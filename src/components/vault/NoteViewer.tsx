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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

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
      void Promise.resolve().then(() => {
        setDraftBody(body);
        setVisualHtml(markdownToHtml(body));
      });
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
      <div className="mx-auto max-w-3xl space-y-5 px-5 py-8 sm:px-8">
        <Skeleton className="h-40 w-full rounded-[var(--radius-panel)]" />
        <Skeleton className="h-[28rem] w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[30%] bg-[var(--wash-sand)] text-muted-foreground">
          <FileText className="h-6 w-6" />
        </div>
        <p className="font-display text-xl tracking-[-0.03em] text-[var(--text-strong)]">Note not found</p>
        <Link
          href="/vault"
          className="mt-2 text-sm font-medium text-primary hover:text-[var(--brand-hover)]"
        >
          Open vault root
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <Card className="mb-5 border-[var(--border-subtle)] bg-card/85 shadow-[var(--shadow-raised)]">
            <CardContent className="p-5 sm:p-6">
            <div className="eyebrow">Note</div>
            <h1 className="display-title mb-4 mt-2 text-[2rem] leading-[1.12] text-[var(--text-strong)] sm:text-[2.15rem]">
              {frontmatter?.title || path.split("/").pop()?.replace(".md", "")}
            </h1>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setEditorMode("visual");
                    setDraftBody(body);
                    setVisualHtml(markdownToHtml(body));
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit note
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError(null);
                      setEditorMode("visual");
                      setDraftBody(body);
                      setVisualHtml(markdownToHtml(body));
                    }}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </>
              )}
            </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {frontmatter?.type && (
            <Badge variant="secondary" className="capitalize">
              {frontmatter.type}
            </Badge>
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
              <Badge
                key={tag}
                variant="outline"
                className="text-primary bg-[var(--wash-sand)]"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="max-w-none border-[var(--border-subtle)] bg-card/85 shadow-[var(--shadow-raised)]">
            <CardContent className="p-5 sm:p-7">
            {isEditing ? (
              <div>
                <div className="mb-4 inline-flex rounded-full border border-[var(--border-subtle)] bg-secondary/80 p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={editorMode === "visual" ? "outline" : "ghost"}
                    onClick={() => {
                      setEditorMode("visual");
                      setVisualHtml(markdownToHtml(draftBody));
                    }}
                    className="h-7 rounded-full shadow-none"
                  >
                    Visual
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={editorMode === "markdown" ? "outline" : "ghost"}
                    onClick={() => {
                      const markdownFromVisual = htmlToMarkdown(
                        visualEditorRef.current?.innerHTML || visualHtml,
                      );
                      setDraftBody(markdownFromVisual);
                      setEditorMode("markdown");
                    }}
                    className="h-7 rounded-full shadow-none"
                  >
                    Markdown
                  </Button>
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
                    className="typeset typeset-note min-h-[420px] w-full rounded-[1.3rem] border border-input bg-[var(--wash-sand)]/40 p-5 outline-none focus:border-ring focus:ring-[3px] focus:ring-[var(--focus-ring)]"
                  />
                ) : (
                  <Textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    className="min-h-[420px] w-full resize-y rounded-[1.3rem] bg-[var(--wash-sand)]/40 p-5 font-mono text-[13px] leading-[1.65] shadow-none"
                    spellCheck={false}
                  />
                )}
                {saveError && (
                  <p className="mt-3 text-xs text-destructive">{saveError}</p>
                )}
              </div>
            ) : (
              <MarkdownContent
                content={markdownWithWikiLinks(body, files)}
                variant="note"
              />
            )}
            </CardContent>
          </Card>

          {/* Wikilinks */}
          {wikilinks.length > 0 && (
            <div className="mt-6 border-t pt-5">
              <h3 className="display-title mb-3 text-xl text-[var(--text-strong)]">
                Linked notes
                <span className="ml-2 font-sans text-sm italic text-muted-foreground">{wikilinks.length}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {wikilinks.map((link: string) => (
                  <Link
                    key={link}
                    href={buildVaultHref(resolveVaultLinkTarget(link, files) || link)}
                    className="focus-ring rounded-full border border-[var(--border-subtle)] bg-[var(--wash-sand)] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[color-mix(in_oklab,var(--brand),white_70%)] hover:text-foreground"
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
