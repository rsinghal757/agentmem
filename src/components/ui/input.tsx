import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "sq-control flex h-8 w-full min-w-0 border border-input bg-card px-2.5 py-1 text-[13px] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)] focus:border-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
