"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Plus, Search, Share2, X } from "lucide-react";
import { useVaultFiles } from "@/hooks/useVaultFiles";
import { useCreateNote } from "@/hooks/useCreateNote";
import { VaultTree } from "@/components/vault/VaultTree";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NoteRail({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { files, isLoading } = useVaultFiles("", true);
  const { create, isCreating, error: createError, clearError } = useCreateNote();

  const [query, setQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [newNotePath, setNewNotePath] = useState("");

  const noteCount = files.filter((file) => file.endsWith(".md")).length;

  async function createNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (await create(newNotePath)) {
      setNewNotePath("");
      setIsComposing(false);
      onNavigate?.();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--surface-rail)]">
      <div className="shrink-0 space-y-2 border-b border-border px-2.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-faint)]"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a note"
              aria-label="Find a note"
              className="sq-control h-8 w-full border border-transparent bg-card pl-8 pr-2 text-[13px] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)] focus:border-ring"
            />
          </div>
          <Button
            type="button"
            variant={isComposing ? "secondary" : "outline"}
            size="icon"
            onClick={() => {
              setIsComposing(!isComposing);
              clearError();
            }}
            aria-label={isComposing ? "Cancel new note" : "New note"}
            title={isComposing ? "Cancel new note" : "New note"}
          >
            {isComposing ? (
              <X className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={1.5} />
            )}
          </Button>
        </div>

        {isComposing ? (
          <form onSubmit={createNote} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={newNotePath}
                onChange={(event) => setNewNotePath(event.target.value)}
                placeholder="folder/note-name"
                aria-label="New note path"
                className="sq-control h-8 w-full min-w-0 flex-1 border border-border bg-card px-2.5 font-mono text-[12px] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)] focus:border-ring"
              />
              <Button type="submit" size="icon" disabled={isCreating} aria-label="Create note">
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={1.5} />
                )}
              </Button>
            </div>
            {createError ? (
              <p className="text-[11px] text-destructive">{createError}</p>
            ) : (
              <p className="text-[11px] text-[var(--text-faint)]">
                Slashes make folders. Markdown is added for you.
              </p>
            )}
          </form>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pt-2" onClick={onNavigate}>
        <VaultTree files={files} isLoading={isLoading} query={query} />
      </div>

      <div className="shrink-0 border-t border-border px-2.5 py-2">
        <Link
          href="/vault/graph"
          onClick={onNavigate}
          className={cn(
            "sq-control focus-ring flex h-8 items-center gap-2 px-2 text-[13px] outline-none",
            pathname === "/vault/graph"
              ? "bg-[var(--brand-tint)] font-medium text-[var(--brand-deep)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]",
          )}
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Connections
          <span className="ml-auto text-[11px] tabular-nums text-[var(--text-faint)]">
            {noteCount}
          </span>
        </Link>
      </div>
    </div>
  );
}
