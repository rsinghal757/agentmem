import Link from "next/link";

export default function VaultPage() {
  return (
    <div className="flex h-full flex-col bg-[#F7F8F6]">
      <div className="border-b border-[#E8EAE7] px-6 py-6">
        <h2 className="text-[24px] font-medium tracking-tight text-[#1C1C1C]">
          Vault Explorer
        </h2>
        <p className="mt-1 text-[15px] text-[#6B6B6B]">
          Browse your knowledge base from the filesystem panel or{" "}
          <Link
            href="/vault/graph"
            className="text-[#0B6B3A] hover:text-[#0F7A43]"
          >
            view graph
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-lg rounded-[10px] border border-[#E8EAE7] bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[16px] font-medium text-[#1C1C1C]">Filesystem ready</p>
          <p className="mt-2 text-[14px] text-[#6B6B6B]">
            Select or create notes directly from the left sidebar filesystem.
          </p>
        </div>
      </div>
    </div>
  );
}
