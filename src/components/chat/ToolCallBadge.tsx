"use client";

import { cn } from "@/lib/utils";

const toolIcons: Record<string, string> = {
  vault_read: "📖",
  vault_write: "📝",
  vault_search: "🔍",
  vault_link: "🔗",
  vault_list: "📂",
  vault_delete: "🗑️",
};

const toolLabels: Record<string, string> = {
  vault_read: "Read note",
  vault_write: "Wrote note",
  vault_search: "Searched vault",
  vault_link: "Linked notes",
  vault_list: "Listed files",
  vault_delete: "Deleted note",
};

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  className?: string;
}

export function ToolCallBadge({
  toolName,
  args,
  result,
  className,
}: ToolCallBadgeProps) {
  const safeToolName = toolName || "unknown";
  const icon = toolIcons[safeToolName] || "🔧";
  const defaultLabel = toolLabels[safeToolName] || safeToolName;
  const label = result && "success" in result && result.success === false
    ? (safeToolName === "vault_write" ? "Write failed" : `${defaultLabel} failed`)
    : defaultLabel;
  const safeArgs = args || {};
  const path = (safeArgs.path || safeArgs.fromPath || safeArgs.query || "") as string;
  const reason = (safeArgs.reason || safeArgs.context || "") as string;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-raised)] px-2.5 py-1.5 text-[13px] text-[var(--text-muted)]",
        className,
      )}
    >
      <span>{icon}</span>
      <span className="font-medium text-[var(--text-strong)]">{label}</span>
      {path && (
        <span className="text-[var(--text-muted)]">
          {path.length > 40 ? `...${path.slice(-37)}` : path}
        </span>
      )}
      {reason && (
        <span className="hidden text-[var(--text-faint)] sm:inline">
          — {reason.length > 50 ? `${reason.slice(0, 47)}...` : reason}
        </span>
      )}
      {result && "success" in result && (
        <span className={result.success ? "text-[var(--brand)]" : "text-red-500"}>
          {result.success ? "✓" : "✗"}
        </span>
      )}
    </div>
  );
}
