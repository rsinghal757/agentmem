"use client";

import Link from "next/link";
import { MessageSquarePlus, X } from "lucide-react";
import { WorkspaceIdentity } from "@/components/brand/WorkspaceIdentity";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { cn } from "@/lib/utils";
import { FileTree } from "@/components/vault/FileTree";
import { Button } from "@/components/ui/button";

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
        <p className="font-display text-lg tracking-[-0.03em] text-[var(--text-strong)]">Library</p>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <WorkspaceIdentity />

      <Link
        href="/"
        className="focus-ring mb-4 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-control)] hover:bg-[var(--brand-hover)]"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </Link>

      <SidebarTabs />

      <p className="mb-2 px-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Library
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <FileTree panel />
      </div>
    </aside>
  );
}
