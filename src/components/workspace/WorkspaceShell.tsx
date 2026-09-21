"use client";

import { useState } from "react";
import { AgentDock } from "@/components/workspace/AgentDock";
import { NoteRail } from "@/components/workspace/NoteRail";
import { TopBar } from "@/components/workspace/TopBar";
import { cn } from "@/lib/utils";

/**
 * Three panes, fixed roles: notes on the left, the document in the middle,
 * the agent docked on the right. The document is always the widest thing on
 * screen — the side panes never grow into it.
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [isRailDocked, setIsRailDocked] = useState(true);
  const [isRailOverlayOpen, setIsRailOverlayOpen] = useState(false);
  const [isDockDocked, setIsDockDocked] = useState(true);
  const [isDockOverlayOpen, setIsDockOverlayOpen] = useState(false);

  const hasOverlay = isRailOverlayOpen || isDockOverlayOpen;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <TopBar
        isRailDocked={isRailDocked}
        isDockDocked={isDockDocked}
        onToggleRailOverlay={() => setIsRailOverlayOpen((open) => !open)}
        onToggleRailDocked={() => setIsRailDocked((docked) => !docked)}
        onToggleDockOverlay={() => setIsDockOverlayOpen((open) => !open)}
        onToggleDockDocked={() => setIsDockDocked((docked) => !docked)}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {hasOverlay ? (
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => {
              setIsRailOverlayOpen(false);
              setIsDockOverlayOpen(false);
            }}
            className="absolute inset-0 z-30 bg-[var(--espresso)]/25 backdrop-blur-[1px] xl:hidden"
          />
        ) : null}

        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-40 w-[min(84vw,var(--rail-width))] shrink-0 border-r border-border transition-transform duration-200 lg:static lg:z-auto lg:w-[var(--rail-width)] lg:translate-x-0 lg:shadow-none",
            isRailOverlayOpen
              ? "translate-x-0 shadow-[var(--shadow-panel)]"
              : "-translate-x-full",
            !isRailDocked && "lg:hidden",
          )}
        >
          <NoteRail onNavigate={() => setIsRailOverlayOpen(false)} />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
          {children}
        </main>

        <aside
          className={cn(
            "absolute inset-y-0 right-0 z-40 w-[min(92vw,var(--dock-width))] shrink-0 border-l border-border transition-transform duration-200 xl:static xl:z-auto xl:w-[var(--dock-width)] xl:translate-x-0 xl:shadow-none",
            isDockOverlayOpen
              ? "translate-x-0 shadow-[var(--shadow-panel)]"
              : "translate-x-full",
            !isDockDocked && "xl:hidden",
          )}
        >
          <AgentDock onClose={() => setIsDockOverlayOpen(false)} />
        </aside>
      </div>
    </div>
  );
}
