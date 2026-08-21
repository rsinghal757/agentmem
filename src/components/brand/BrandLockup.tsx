import { BrandMark } from "@/components/brand/BrandMark";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
  tagline?: string;
  compact?: boolean;
};

export function BrandLockup({
  className,
  markSize = 36,
  showTagline = true,
  tagline = "Notes that think with you",
  compact = false,
}: BrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandMark size={markSize} />
      <div className="min-w-0">
        <div
          className={cn(
            "truncate font-display leading-none tracking-[-0.03em] text-[var(--text-strong)]",
            compact ? "text-[1.15rem]" : "text-[1.35rem]",
          )}
        >
          GizzNote
        </div>
        {showTagline ? (
          <p className="mt-1 truncate font-display text-[0.78rem] italic leading-none text-muted-foreground">
            {tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}
