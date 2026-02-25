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
  const pathname = usePathname();

  return (
    <nav className="border-t border-gray-200 bg-white/95 backdrop-blur-lg pb-safe">
      <div className="flex h-16 items-stretch">
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
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-[#6B8F71]"
                  : "text-gray-400 active:text-gray-500",
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.2 : 1.5} />
              <span
                className={cn(
                  "text-[10px] leading-none",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+8px)] h-1 w-1 rounded-full bg-[#6B8F71]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
