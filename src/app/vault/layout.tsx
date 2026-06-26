"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { VaultSidebar } from "@/components/layout/VaultSidebar";
import { Button } from "@/components/ui/button";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 z-20 bg-black/25 lg:hidden"
        />
      )}

      <VaultSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="workspace-panel flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-3 lg:hidden">
          <Button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
