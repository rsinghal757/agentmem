"use client";

import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { FileTree } from "@/components/vault/FileTree";

export function VaultSidebar() {
  return (
    <aside className="w-72 rounded-2xl border border-[#DCE5DF] bg-white/85 p-3 shadow-[0_20px_50px_-42px_rgba(26,54,42,0.65)] backdrop-blur-md">
      <div className="mb-3 rounded-xl border border-[#E1E8E3] bg-[#F8FAF8] p-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[#74827D]">Workspace</div>
        <div className="mt-1 text-lg font-semibold tracking-tight text-[#171B1A]">0xMem</div>
      </div>

      <Link
        href="/"
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4E2DA] bg-white px-3 py-2 text-sm font-medium text-[#22342D] hover:bg-[#F8FAF8]"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </Link>

      <SidebarTabs />

      <div className="mb-2 px-1 text-xs font-medium uppercase tracking-[0.12em] text-[#7A8882]">
        Filesystem
      </div>

      <div className="h-[calc(100dvh-250px)] overflow-y-auto pr-1">
        <FileTree panel />
      </div>
    </aside>
  );
}
