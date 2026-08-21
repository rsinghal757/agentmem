import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: number;
  title?: string;
};

export function BrandMark({ className, size = 36, title = "GizzNote" }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[30%] bg-primary text-primary-foreground shadow-[var(--shadow-mark)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden={title ? undefined : true}
      title={title}
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none" aria-hidden="true">
        <rect
          x="4.2"
          y="3.4"
          width="11.4"
          height="14.2"
          rx="2.2"
          stroke="currentColor"
          strokeWidth="1.45"
        />
        <rect
          x="8.2"
          y="6.4"
          width="11.4"
          height="14.2"
          rx="2.2"
          fill="currentColor"
        />
        <path
          d="M13.9 12.15 14.35 13.4l1.25.45-1.25.45-.45 1.25-.45-1.25-1.25-.45 1.25-.45z"
          fill="var(--primary)"
        />
      </svg>
    </span>
  );
}
