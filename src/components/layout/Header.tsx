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
    <header className="sticky top-0 z-30 mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-neutral-950/75 px-4 shadow-[0_8px_30px_-20px_rgba(124,58,237,0.8)] backdrop-blur sm:mx-4">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-1.5">
          <Brain className="h-4 w-4 text-violet-300" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-neutral-100">
          Obsidian Agent
        </span>
      </Link>

      <nav className="flex items-center gap-1 rounded-xl border border-white/10 bg-neutral-900/80 p-1">
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
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-violet-500/20 text-violet-200 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.4)]"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200",
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
