import { FileTree } from "@/components/vault/FileTree";
import Link from "next/link";

export default function VaultPage() {
  return (
    <div className="flex h-full flex-col bg-[#F7F8F6]">
      {/* Header */}
      <div className="border-b border-[#E8EAE7] px-6 py-6">
        <h2 className="text-[24px] font-medium tracking-tight text-[#1C1C1C]">
          Vault Explorer
        </h2>
        <p className="mt-1 text-[15px] text-[#6B6B6B]">
          Browse your knowledge base or{" "}
          <Link
            href="/vault/graph"
            className="text-[#0B6B3A] hover:text-[#0F7A43]"
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
