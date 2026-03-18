"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MessageSquarePlus, X } from "lucide-react";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { cn } from "@/lib/utils";
import { FileTree } from "@/components/vault/FileTree";

type VaultSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function VaultSidebar({ isOpen = true, onClose }: VaultSidebarProps) {
  return (
    <aside
      className={cn(
        "absolute bottom-4 left-4 top-3 z-30 flex w-72 flex-col overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white/85 p-3 shadow-[0_20px_50px_-42px_rgba(26,54,42,0.65)] backdrop-blur-md transition-transform duration-200 md:static md:top-0 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-[110%]",
      )}
    >
      <div className="mb-3 flex items-center justify-between md:hidden">
        <p className="text-sm font-medium text-[#171B1A]">Filesystem</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-[#62706A] hover:bg-[#EFF3EF] hover:text-[#171B1A]"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 rounded-xl border border-[#E1E8E3] bg-[#F8FAF8] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#74827D]">Workspace</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-[#171B1A]">0xMem</div>
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="rounded-lg border border-[#DCE5DF] bg-white px-2.5 py-1 text-xs font-medium text-[#171B1A] hover:bg-[#F5F7F5]">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
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
