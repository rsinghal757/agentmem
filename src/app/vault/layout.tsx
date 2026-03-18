"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import { VaultSidebar } from "@/components/layout/VaultSidebar";
import { Button } from "@/components/ui/button";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative mx-auto flex h-full max-w-[1600px] gap-3 bg-transparent px-4 pb-4 pt-3">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 z-20 bg-black/25 md:hidden"
        />
      )}

      <VaultSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#DCE5DF] bg-white/80 shadow-[0_25px_65px_-48px_rgba(10,32,22,0.65)] backdrop-blur-md">
        <div className="border-b border-[#E2E8E4] bg-[#FAFCFB] px-4 py-2 md:hidden">
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
