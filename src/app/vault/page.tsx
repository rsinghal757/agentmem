import { FileTree } from "@/components/vault/FileTree";
import Link from "next/link";

export default function VaultPage() {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
          Vault Explorer
        </h2>
        <p className="mt-0.5 text-xs text-gray-400">
          Browse your knowledge base or{" "}
          <Link
            href="/vault/graph"
            className="text-[#6B8F71] hover:text-[#4A6B4F]"
          >
            view graph
          </Link>
        </p>
      </div>

      {/* File tree — full width on mobile */}
      <div className="flex-1 overflow-y-auto">
        <FileTree />
      </div>
    </div>
  );
}
