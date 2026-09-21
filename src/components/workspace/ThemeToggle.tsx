"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/components/workspace/ThemeScript";
import { Button } from "@/components/ui/button";

/**
 * The icon is driven by the `data-theme` attribute through the `dark:`
 * variant, so there is no React state to get out of step with the document.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private modes; the toggle still works.
    }
  }

  return (
    <Button
      type="button"
      onClick={toggle}
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      <Moon className="h-4 w-4 dark:hidden" strokeWidth={1.5} />
      <Sun className="hidden h-4 w-4 dark:block" strokeWidth={1.5} />
    </Button>
  );
}
