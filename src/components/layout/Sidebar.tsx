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
        className="absolute right-2 top-14 z-10 rounded-md border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 transition-colors hover:text-neutral-200"
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
          "border-l border-neutral-800 bg-neutral-900 transition-all duration-200",
          isOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <VaultActivityFeed />
      </div>
    </>
  );
}
