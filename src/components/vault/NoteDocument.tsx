"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, FileQuestion, Link2, Pencil, Tag } from "lucide-react";
import { useVaultFile, useVaultFiles } from "@/hooks/useVaultFiles";
import { MarkdownContent } from "@/components/shared/MarkdownContent";
import {
  EditorRibbon,
  type EditorMode,
  type RibbonCommand,
} from "@/components/vault/EditorRibbon";
import {
  buildVaultHref,
  markdownWithWikiLinks,
  resolveVaultLinkTarget,
} from "@/lib/vault/links";
import {
  htmlToMarkdown,
  parseMarkdownForEditor,
  type WrapMemory,
  serializeNoteContent,
  splitNoteContent,
} from "@/lib/vault/markdown-html";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NoteDocumentProps {
  path: string;
}

const INLINE_WRAPPERS: Partial<Record<RibbonCommand, string>> = {
  bold: "**",
  italic: "*",
  strike: "~~",
  code: "`",
};

const LINE_PREFIXES: Partial<Record<RibbonCommand, string>> = {
  body: "",
  h1: "# ",
  h2: "## ",
  h3: "### ",
  quote: "> ",
  bullet: "- ",
  ordered: "1. ",
};

const VISUAL_BLOCK_TAGS: Partial<Record<RibbonCommand, string>> = {
  body: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  quote: "blockquote",
  codeblock: "pre",
};

export function NoteDocument({ path }: NoteDocumentProps) {
  const { content, frontmatter, wikilinks, wordCount, isLoading, error, refresh } =
    useVaultFile(path);
  const { files, refresh: refreshFiles } = useVaultFiles("", true);

  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<EditorMode>("visual");
  const [draftBody, setDraftBody] = useState("");
  const [visualHtml, setVisualHtml] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const visualRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  // How the file on disk wrapped each block, so an untouched paragraph is
  // written back byte for byte instead of reflowed onto one line.
  const wrapMemoryRef = useRef<WrapMemory>(new Map());

  const { frontmatterBlock, body } = useMemo(
    () => splitNoteContent(content || ""),
    [content],
  );

  const toVisualHtml = useCallback((markdown: string) => {
    const { html, wrapMemory } = parseMarkdownForEditor(markdown);
    wrapMemoryRef.current = wrapMemory;
    return html;
  }, []);

  const toMarkdown = useCallback(
    (fallbackHtml: string) =>
      htmlToMarkdown(visualRef.current?.innerHTML || fallbackHtml, wrapMemoryRef.current),
    [],
  );

  useEffect(() => {
    setIsEditing(false);
    setSaveError(null);
  }, [path]);

  useEffect(() => {
    if (isEditing || typeof content !== "string") return;
    setDraftBody(body);
    setVisualHtml(toVisualHtml(body));
  }, [body, content, isEditing, toVisualHtml]);

  useEffect(() => {
    if (!isEditing || mode !== "visual" || !visualRef.current) return;
    if (visualRef.current.innerHTML !== visualHtml) {
      visualRef.current.innerHTML = visualHtml;
    }
  }, [isEditing, mode, visualHtml]);

  const applyMarkdownCommand = useCallback((command: RibbonCommand) => {
    const textarea = markdownRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);

    const wrapper = INLINE_WRAPPERS[command];
    if (wrapper) {
      const next = `${value.slice(0, selectionStart)}${wrapper}${selected}${wrapper}${value.slice(selectionEnd)}`;
      setDraftBody(next);
      queueMicrotask(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selectionStart + wrapper.length,
          selectionEnd + wrapper.length,
        );
      });
      return;
    }

    if (command === "link") {
      const href = window.prompt("Link to", "https://");
      if (!href) return;
      const label = selected || "link";
      const next = `${value.slice(0, selectionStart)}[${label}](${href})${value.slice(selectionEnd)}`;
      setDraftBody(next);
      return;
    }

    if (command === "divider") {
      const next = `${value.slice(0, selectionStart)}\n\n---\n\n${value.slice(selectionEnd)}`;
      setDraftBody(next);
      return;
    }

    if (command === "codeblock") {
      const next = `${value.slice(0, selectionStart)}\n\`\`\`\n${selected}\n\`\`\`\n${value.slice(selectionEnd)}`;
      setDraftBody(next);
      return;
    }

    const prefix = LINE_PREFIXES[command];
    if (prefix !== undefined) {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const lineEndIndex = value.indexOf("\n", selectionEnd);
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
      const block = value.slice(lineStart, lineEnd);
      const rewritten = block
        .split("\n")
        .map((line) => `${prefix}${line.replace(/^(#{1,6}\s+|>\s+|[-*]\s+|\d+\.\s+)/, "")}`)
        .join("\n");

      setDraftBody(`${value.slice(0, lineStart)}${rewritten}${value.slice(lineEnd)}`);
      queueMicrotask(() => textarea.focus());
    }
  }, []);

  const applyVisualCommand = useCallback((command: RibbonCommand) => {
    const editor = visualRef.current;
    if (!editor) return;
    editor.focus();

    const run = (name: string, value?: string) => {
      document.execCommand(name, false, value);
      setVisualHtml(editor.innerHTML);
    };

    if (command === "undo" || command === "redo") return run(command);
    if (command === "bold") return run("bold");
    if (command === "italic") return run("italic");
    if (command === "strike") return run("strikeThrough");
    if (command === "bullet") return run("insertUnorderedList");
    if (command === "ordered") return run("insertOrderedList");
    if (command === "divider") return run("insertHorizontalRule");

    if (command === "code") {
      const selection = window.getSelection()?.toString() || "code";
      return run("insertHTML", `<code>${selection}</code>`);
    }

    if (command === "link") {
      const href = window.prompt("Link to", "https://");
      if (!href) return;
      return run("createLink", href);
    }

    const tag = VISUAL_BLOCK_TAGS[command];
    if (tag) return run("formatBlock", `<${tag}>`);
  }, []);

  function handleCommand(command: RibbonCommand) {
    if (mode === "visual") {
      applyVisualCommand(command);
      return;
    }
    if (command === "undo" || command === "redo") {
      document.execCommand(command);
      return;
    }
    applyMarkdownCommand(command);
  }

  function switchMode(next: EditorMode) {
    if (next === mode) return;

    if (next === "markdown") {
      setDraftBody(toMarkdown(visualHtml));
    } else {
      setVisualHtml(toVisualHtml(draftBody));
    }
    setMode(next);
  }

  function startEditing() {
    setDraftBody(body);
    setVisualHtml(toVisualHtml(body));
    setMode("visual");
    setSaveError(null);
    setIsEditing(true);
  }

  function discard() {
    setDraftBody(body);
    setVisualHtml(toVisualHtml(body));
    setMode("visual");
    setSaveError(null);
    setIsEditing(false);
  }

  async function save() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const nextBody =
        mode === "visual"
          ? toMarkdown(visualHtml)
          : draftBody;

      const response = await fetch("/api/vault/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          content: serializeNoteContent(frontmatterBlock, nextBody),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Could not save this note.");
      }

      setIsEditing(false);
      await Promise.all([refresh(), refreshFiles()]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save this note.");
    } finally {
      setIsSaving(false);
    }
  }

  const title =
    frontmatter?.title || path.split("/").pop()?.replace(/\.md$/, "") || "Untitled";
  const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : null;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="h-12 shrink-0 border-b border-border bg-card" />
        <div className="flex-1 overflow-hidden px-4 py-6">
          <div className="sq-panel mx-auto w-full max-w-[var(--measure)] space-y-4 border border-border bg-[var(--paper)] p-10">
            <Skeleton className="h-8 w-[55%]" />
            <Skeleton className="h-3 w-[30%]" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <FileQuestion className="h-7 w-7 text-[var(--text-faint)]" strokeWidth={1.25} />
        <p className="mt-4 font-serif text-[20px] text-[var(--text-strong)]">
          There&rsquo;s no note at that path.
        </p>
        <p className="mt-1.5 font-mono text-[12px] text-[var(--text-faint)]">{path}</p>
        <Link
          href="/"
          className="mt-5 text-[13px] font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to the desk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto w-full max-w-[calc(var(--measure)+2rem)] px-2">
          {isEditing ? (
            <EditorRibbon
              mode={mode}
              onModeChange={switchMode}
              onCommand={handleCommand}
              onSave={save}
              onCancel={discard}
              isSaving={isSaving}
            />
          ) : (
            <div className="flex h-12 items-center gap-3">
              <span className="truncate font-mono text-[11.5px] text-[var(--text-faint)]">
                {path}
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-3 text-[11px] tabular-nums text-[var(--text-faint)]">
                <span>{wordCount} words</span>
                {wikilinks.length > 0 ? (
                  <span className="flex items-center gap-1">
                    <Link2 className="h-3 w-3" strokeWidth={1.5} />
                    {wikilinks.length}
                  </span>
                ) : null}
              </span>
              <Button type="button" onClick={startEditing} variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4 sm:px-6 sm:py-8">
        <article
          className={cn(
            "sq-panel mx-auto w-full max-w-[var(--measure)] border border-border bg-[var(--paper)] px-5 py-7 shadow-[var(--shadow-raised)] sm:px-12 sm:py-14",
          )}
        >
          <header className="mb-7 sm:mb-8">
            {folder ? (
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-faint)]">
                {folder}
              </p>
            ) : null}
            <h1 className="font-serif text-[clamp(24px,6.6vw,30px)] font-normal leading-[1.14] tracking-[-0.022em] text-[var(--text-strong)] sm:text-[clamp(28px,3.4vw,38px)] sm:leading-[1.12] sm:tracking-[-0.025em]">
              {title}
            </h1>

            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-2.5 text-[12px] text-[var(--text-faint)] sm:mt-4 sm:gap-y-2 sm:pt-3 sm:text-[11.5px]">
              {frontmatter?.type ? (
                <span className="capitalize">{frontmatter.type}</span>
              ) : null}
              {frontmatter?.updated ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  {new Date(frontmatter.updated).toLocaleDateString()}
                </span>
              ) : null}
              <span>{wordCount} words</span>
              {frontmatter?.tags?.length ? (
                <span className="flex flex-wrap items-center gap-2">
                  <Tag className="h-3 w-3" strokeWidth={1.5} />
                  {frontmatter.tags.map((tag: string) => (
                    <span key={tag} className="text-[0.96em] text-[var(--text-muted)]">
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
          </header>

          {isEditing ? (
            <>
              {mode === "visual" ? (
                <div
                  ref={visualRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => setVisualHtml(event.currentTarget.innerHTML)}
                  data-placeholder="Start writing…"
                  className="typeset typeset-note min-h-[420px] w-full outline-none"
                />
              ) : (
                <textarea
                  ref={markdownRef}
                  value={draftBody}
                  onChange={(event) => setDraftBody(event.target.value)}
                  spellCheck={false}
                  className="sq-control min-h-[420px] w-full resize-y border border-border bg-[var(--surface-sunken)] p-4 font-mono text-[13px] leading-[1.7] text-[var(--text-strong)] outline-none focus:border-ring"
                />
              )}

              {saveError ? (
                <p className="mt-4 text-[12.5px] text-destructive">{saveError}</p>
              ) : null}
            </>
          ) : (
            <MarkdownContent
              content={markdownWithWikiLinks(body, files)}
              variant="note"
            />
          )}

          {!isEditing && wikilinks.length > 0 ? (
            <footer className="mt-10 border-t border-border pt-4 sm:mt-12 sm:pt-5">
              <p className="eyebrow">Links out</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {wikilinks.map((link: string) => (
                  <Link
                    key={link}
                    href={buildVaultHref(resolveVaultLinkTarget(link, files) || link)}
                    className="sq-control border border-border px-2 py-1 text-[11.5px] text-[var(--text-muted)] outline-none hover:border-[color-mix(in_oklab,var(--brand),transparent_55%)] hover:text-[var(--brand-deep)] sm:text-[12px]"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </footer>
          ) : null}
        </article>
      </div>
    </div>
  );
}
