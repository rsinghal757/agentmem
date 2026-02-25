import { FileTree } from "@/components/vault/FileTree";
import Link from "next/link";

export default function VaultPage() {
  return (
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-72 overflow-y-auto border-r border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-200">
            📂 Vault Explorer
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Browse your knowledge base
          </p>
        </div>
        <FileTree />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-200">
            Your Knowledge Vault
          </h2>
          <p className="max-w-md text-sm text-neutral-400">
            Select a note from the file tree to view it, or go to the{" "}
            <Link
              href="/vault/graph"
              className="text-violet-400 hover:text-violet-300"
            >
              graph view
            </Link>{" "}
            to see how your notes connect.
          </p>
        </div>
      </div>
    </div>
  );
}
