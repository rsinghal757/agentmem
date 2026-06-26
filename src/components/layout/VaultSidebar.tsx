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
        "workspace-sidebar",
        isOpen ? "translate-x-0" : "-translate-x-[112%] lg:translate-x-0",
      )}
    >
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <p className="text-sm font-medium text-[var(--text-strong)]">Filesystem</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-[var(--text-strong)]"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3 rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(135deg,var(--brand-softer),rgba(255,255,255,0.82))] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--brand)]">Workspace</div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-strong)]">0xMem</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Files, notes, and graph context.</p>
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="rounded-lg border border-[var(--border-soft)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--text-strong)] hover:bg-accent">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      <Link
        href="/"
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-soft)] bg-white/70 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </Link>

      <SidebarTabs />

      <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Filesystem
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <FileTree panel />
      </div>
    </aside>
  );
}
