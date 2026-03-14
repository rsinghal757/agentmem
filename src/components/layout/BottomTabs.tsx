"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, FolderOpen, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/vault/graph", label: "Graph", icon: GitBranch },
];

export function BottomTabs() {
  return <NavigationTabs orientation="bottom" />;
}

export function SidebarTabs() {
  return <NavigationTabs orientation="sidebar" />;
}

function NavigationTabs({ orientation }: { orientation: "bottom" | "sidebar" }) {
  const pathname = usePathname();
  const isSidebar = orientation === "sidebar";

  return (
    <nav
      className={cn(
        isSidebar
          ? "mb-3 rounded-xl border border-[#E1E8E3] bg-[#F8FAF8] p-1.5"
          : "border-t border-[#E8EAE7] bg-[#F7F8F6]/95 backdrop-blur pb-safe",
      )}
    >
      <div className={cn("flex items-stretch", isSidebar ? "gap-1" : "h-16")}>
        {tabs.map(({ href, label, icon: Icon }) => {
          // Exact match for Chat ("/"), Graph ("/vault/graph")
          // Vault matches /vault but NOT /vault/graph
          const isActive =
            href === "/"
              ? pathname === "/"
              : href === "/vault"
                ? pathname === "/vault" ||
                  (pathname.startsWith("/vault") &&
                    !pathname.startsWith("/vault/graph"))
                : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                isSidebar
                  ? "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors"
                  : "relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-[#0B6B3A]"
                  : "text-[#6B6B6B] active:text-[#1C1C1C]",
                isSidebar && isActive && "bg-white shadow-[0_3px_10px_-8px_rgba(11,107,58,0.5)]",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              <span
                className={cn(
                  isSidebar ? "text-[11px] leading-none" : "text-[10px] leading-none",
                  isActive ? "font-medium" : "font-normal",
                )}
              >
                {label}
              </span>
              {isActive && !isSidebar && (
                <div className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+8px)] h-1 w-1 rounded-full bg-[#0B6B3A]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
