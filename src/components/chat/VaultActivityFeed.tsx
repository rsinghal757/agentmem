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
      <div className="flex items-center justify-between border-b border-[#E8EAE7] px-5 py-4">
        <h3 className="text-[13px] font-medium text-[#6B6B6B]">
          Vault Activity
        </h3>
        <button
          onClick={() => refresh()}
          className="rounded-[8px] border border-[#E8EAE7] bg-white p-2 text-[#6B6B6B] hover:text-[#1C1C1C] active:bg-[#F7F8F6]"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-[13px] text-[#6B6B6B]">
            Loading vault...
          </div>
        ) : mdFiles.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">
            No vault notes yet. Start chatting to build your knowledge base!
          </div>
        ) : (
          <div className="divide-y divide-[#E8EAE7] px-3 py-3">
            {mdFiles.map((file: string) => (
              <div
                key={file}
                className="flex items-center gap-2.5 rounded-[8px] px-3 py-3 text-[13px] transition-colors hover:bg-[#F7F8F6]"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#0B6B3A]" />
                <span className="truncate text-[#6B6B6B]" title={file}>
                  {file}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#E8EAE7] px-5 py-3 text-[13px] text-[#6B6B6B]">
        {count} files in vault
      </div>
    </div>
  );
}
