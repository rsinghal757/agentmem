"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MessageSquarePlus, Orbit, X } from "lucide-react";
import { SidebarTabs } from "@/components/layout/BottomTabs";
import { cn } from "@/lib/utils";
import { FileTree } from "@/components/vault/FileTree";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="mb-3 border-border/80 bg-card/80 shadow-none">
        <CardContent className="flex items-center justify-between gap-3 p-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.7rem] bg-primary text-primary-foreground shadow-[var(--shadow-control)]">
              <Orbit className="h-[1.1rem] w-[1.1rem]" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold tracking-[-0.025em] text-[var(--text-strong)]">GizzNote</div>
              <p className="truncate text-[0.7rem] text-muted-foreground">Notes that think with you</p>
            </div>
          </div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
        </CardContent>
      </Card>

      <Link
        href="/"
        className="focus-ring mb-3 flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-input bg-card px-3 text-sm font-medium text-foreground shadow-[var(--shadow-control)] hover:bg-accent"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New chat
      </Link>

      <SidebarTabs />

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <FileTree panel />
      </div>
    </aside>
  );
}
