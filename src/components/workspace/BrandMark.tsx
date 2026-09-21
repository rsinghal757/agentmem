import { cn } from "@/lib/utils";

/**
 * An ink drop with its settled blot — the mark for a writing surface.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "sq-control inline-flex shrink-0 items-center justify-center bg-[var(--espresso)] text-white dark:bg-[var(--brand)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]" aria-hidden="true">
        <path
          d="M12 3.2c0 0 5.9 6.6 5.9 10.4a5.9 5.9 0 1 1-11.8 0C6.1 9.8 12 3.2 12 3.2Z"
          fill="currentColor"
        />
        <circle cx="9.7" cy="13.9" r="1.55" className="fill-[var(--espresso)] dark:fill-[var(--brand)]" />
      </svg>
    </span>
  );
}

export function BrandLockup({
  className,
  tagline = true,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <BrandMark className="h-7 w-7" />
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-strong)]">
          GizzNote
        </span>
        {tagline ? (
          <span className="mt-1 block truncate text-[11px] leading-none text-[var(--text-faint)]">
            A desk for thinking in markdown
          </span>
        ) : null}
      </span>
    </span>
  );
}
