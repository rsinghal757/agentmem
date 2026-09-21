import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "accent" | "destructive";

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-border bg-card text-[var(--text-muted)]",
  accent:
    "border-[color-mix(in_oklab,var(--brand),transparent_70%)] bg-[var(--brand-tint)] text-[var(--brand-deep)]",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
};

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-[0.01em] [&>svg]:size-3",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
