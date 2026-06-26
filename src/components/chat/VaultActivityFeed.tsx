"use client";

import { useVaultFiles } from "@/hooks/useVaultFiles";
import { FileText, RefreshCw } from "lucide-react";

export function VaultActivityFeed() {
  const { files, count, isLoading, refresh } = useVaultFiles("", true);

  // Filter to only .md files and sort by name (most recent first for daily notes)
  const mdFiles = files
    .filter((f: string) => f.endsWith(".md"))
    .slice(0, 20);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <h3 className="text-[13px] font-medium text-[var(--text-muted)]">
          Vault Activity
        </h3>
        <button
          onClick={() => refresh()}
          className="rounded-[8px] border border-[var(--border-subtle)] bg-white p-2 text-[var(--text-muted)] hover:text-[#1C1C1C] active:bg-[var(--brand-softer)]"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-[13px] text-[var(--text-muted)]">
            Loading vault...
          </div>
        ) : mdFiles.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-[var(--text-muted)]">
            No vault notes yet. Start chatting to build your knowledge base!
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] px-3 py-3">
            {mdFiles.map((file: string) => (
              <div
                key={file}
                className="flex items-center gap-2.5 rounded-[8px] px-3 py-3 text-[13px] transition-colors hover:bg-[var(--brand-softer)]"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
                <span className="truncate text-[var(--text-muted)]" title={file}>
                  {file}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-subtle)] px-5 py-3 text-[13px] text-[var(--text-muted)]">
        {count} files in vault
      </div>
    </div>
  );
}
