"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { VaultActivityFeed } from "../chat/VaultActivityFeed";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-3 top-16 z-10 rounded-xl border border-white/10 bg-neutral-900/90 p-2 text-neutral-400 shadow-sm backdrop-blur transition-colors hover:text-neutral-200"
      >
        {isOpen ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelRightOpen className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar panel */}
      <div
        className={cn(
          "border-l border-white/10 bg-neutral-950/70 backdrop-blur transition-all duration-200",
          isOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <VaultActivityFeed />
      </div>
    </>
  );
}
