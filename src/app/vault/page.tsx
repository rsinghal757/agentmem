import { FileTree } from "@/components/vault/FileTree";
import Link from "next/link";

export default function VaultPage() {
  return (
    <div className="flex h-full rounded-2xl">
      {/* File tree sidebar */}
      <div className="w-72 overflow-y-auto rounded-l-2xl border-r border-white/10 bg-neutral-950/70 backdrop-blur">
        <div className="border-b border-white/10 px-4 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-neutral-100">
            📂 Vault Explorer
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Browse your knowledge base
          </p>
        </div>
        <FileTree />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 items-center justify-center rounded-r-2xl bg-neutral-950/50">
        <div className="rounded-3xl border border-white/10 bg-neutral-900/60 px-10 py-12 text-center shadow-[0_24px_60px_-46px_rgba(124,58,237,0.95)]">
          <div className="mb-4 text-6xl">📚</div>
          <h2 className="mb-2 text-lg font-semibold text-neutral-100">
            Your Knowledge Vault
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-neutral-400">
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
