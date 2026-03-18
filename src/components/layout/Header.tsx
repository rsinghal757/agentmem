"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Brain, MessageSquare, FolderOpen, GitBranch, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/vault/graph", label: "Graph", icon: GitBranch },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl border border-[#DCE5DF] bg-white/85 px-4 shadow-[0_20px_50px_-42px_rgba(26,54,42,0.65)] backdrop-blur-md sm:mx-4">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="rounded-xl border border-[#BFD3C4] bg-[#EDF4EE] p-1.5">
          <Brain className="h-4 w-4 text-[#0B6B3A]" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[#171B1A]">
          0xMem
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <nav className="hidden items-center gap-1 rounded-xl border border-[#DCE5DF] bg-[#F8FAF8] p-1 sm:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-[#0B6B3A]/12 text-[#0B6B3A] shadow-[inset_0_0_0_1px_rgba(11,107,58,0.25)]"
                    : "text-[#62706A] hover:bg-white hover:text-[#171B1A]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-[124px] items-center justify-end gap-2">
          <ClerkLoading>
            <Loader2 className="h-4 w-4 animate-spin text-[#62706A]" />
          </ClerkLoading>

          <ClerkLoaded>
            <SignedOut>
              <div className="flex gap-2">
                <SignInButton>
                  <button className="rounded-lg border border-[#DCE5DF] bg-white px-3 py-1.5 text-xs font-medium text-[#171B1A] hover:bg-[#F5F7F5]">
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button className="rounded-lg bg-[#0B6B3A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0F7A43]">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}
