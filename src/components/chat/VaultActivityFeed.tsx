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
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Vault Activity
        </h3>
        <button
          onClick={() => refresh()}
          className="rounded p-1 text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-xs text-neutral-500">
            Loading vault...
          </div>
        ) : mdFiles.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-neutral-500">
            No vault notes yet. Start chatting to build your knowledge base!
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/50">
            {mdFiles.map((file: string) => (
              <div
                key={file}
                className="flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-neutral-800/50"
              >
                <FileText className="h-3 w-3 shrink-0 text-violet-400" />
                <span className="truncate text-neutral-300" title={file}>
                  {file}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-neutral-800 px-3 py-2 text-xs text-neutral-500">
        {count} files in vault
      </div>
    </div>
  );
}
