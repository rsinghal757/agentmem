"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeft, PanelRight, Sparkles } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BrandMark } from "@/components/workspace/BrandMark";
import { ThemeToggle } from "@/components/workspace/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

function useCrumbs(): Crumb[] {
  const pathname = usePathname();

  if (pathname === "/vault/graph") {
    return [{ label: "Graph" }];
  }

  if (pathname.startsWith("/vault/")) {
    const segments = decodeURIComponent(pathname.slice("/vault/".length))
      .split("/")
      .filter(Boolean);

    return segments.map((segment, index) => ({
      label: segment.replace(/\.md$/, ""),
      href:
        index === segments.length - 1
          ? undefined
          : `/vault/${segments.slice(0, index + 1).join("/")}`,
    }));
  }

  return [{ label: "Desk" }];
}

type TopBarProps = {
  onToggleRailOverlay: () => void;
  onToggleRailDocked: () => void;
  onToggleDockOverlay: () => void;
  onToggleDockDocked: () => void;
  isRailDocked: boolean;
  isDockDocked: boolean;
};

export function TopBar({
  onToggleRailOverlay,
  onToggleRailDocked,
  onToggleDockOverlay,
  onToggleDockDocked,
  isRailDocked,
  isDockDocked,
}: TopBarProps) {
  const crumbs = useCrumbs();

  return (
    <header className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2 border-b border-border bg-card px-2.5 sm:px-4">
      <Button
        type="button"
        onClick={onToggleRailOverlay}
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label="Open notes"
      >
        <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
      </Button>

      <Button
        type="button"
        onClick={onToggleRailDocked}
        variant="ghost"
        size="icon-sm"
        className="hidden lg:inline-flex"
        aria-label={isRailDocked ? "Hide notes" : "Show notes"}
        title={isRailDocked ? "Hide notes" : "Show notes"}
      >
        <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
      </Button>

      <Link
        href="/"
        className="ml-0.5 mr-1 inline-flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]"
      >
        <BrandMark className="h-6 w-6" />
        <span className="hidden text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-strong)] sm:inline">
          GizzNote
        </span>
      </Link>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1 border-l border-border pl-3 text-[13px]"
      >
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" strokeWidth={1.5} />
            ) : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="truncate text-[var(--text-faint)] hover:text-[var(--text-strong)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  index === crumbs.length - 1
                    ? "font-medium text-[var(--text-strong)]"
                    : "text-[var(--text-faint)]",
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />

        <Button
          type="button"
          onClick={onToggleDockOverlay}
          variant="ghost"
          size="sm"
          className="gap-1.5 xl:hidden"
          aria-label="Open agent"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Agent</span>
        </Button>

        <Button
          type="button"
          onClick={onToggleDockDocked}
          variant="ghost"
          size="icon-sm"
          className="hidden xl:inline-flex"
          aria-label={isDockDocked ? "Hide agent" : "Show agent"}
          title={isDockDocked ? "Hide agent" : "Show agent"}
        >
          <PanelRight className="h-4 w-4" strokeWidth={1.5} />
        </Button>

        <div className="ml-1 flex items-center">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
