"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, MessageSquare, FolderOpen, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/vault/graph", label: "Graph", icon: GitBranch },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-12 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4">
      <Link href="/" className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-violet-400" />
        <span className="text-sm font-semibold text-neutral-100">
          Obsidian Agent
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
