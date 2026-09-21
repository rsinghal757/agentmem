import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "sq-control flex min-h-16 w-full border border-input bg-card px-3 py-2 text-[14px] text-[var(--text-strong)] outline-none placeholder:text-[var(--text-faint)] focus:border-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
