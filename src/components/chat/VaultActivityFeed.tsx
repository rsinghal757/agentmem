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
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Vault Activity
        </h3>
        <button
          onClick={() => refresh()}
          className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 transition-colors hover:text-gray-600 active:bg-gray-50"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-xs text-gray-400">
            Loading vault...
          </div>
        ) : mdFiles.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            No vault notes yet. Start chatting to build your knowledge base!
          </div>
        ) : (
          <div className="divide-y divide-gray-100 px-2 py-2">
            {mdFiles.map((file: string) => (
              <div
                key={file}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs transition-colors hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#6B8F71]" />
                <span className="truncate text-gray-600" title={file}>
                  {file}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-2.5 text-xs text-gray-400">
        {count} files in vault
      </div>
    </div>
  );
}
