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
  // Safely handle undefined toolName
  const safeToolName = toolName || "unknown";
  const icon = toolIcons[safeToolName] || "🔧";
  const defaultLabel = toolLabels[safeToolName] || safeToolName;
  const label = result && "success" in result && result.success === false
    ? (safeToolName === "vault_write" ? "Write failed" : `${defaultLabel} failed`)
    : defaultLabel;
  // Safely access args properties with null/undefined checks
  const safeArgs = args || {};
  const path = (safeArgs.path || safeArgs.fromPath || safeArgs.query || "") as string;
  const reason = (safeArgs.reason || safeArgs.context || "") as string;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600",
        className,
      )}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
      {path && (
        <span className="text-gray-400">
          {path.length > 40 ? `...${path.slice(-37)}` : path}
        </span>
      )}
      {reason && (
        <span className="hidden text-gray-400 sm:inline">
          — {reason.length > 50 ? `${reason.slice(0, 47)}...` : reason}
        </span>
      )}
      {result && "success" in result && (
        <span className={result.success ? "text-[#6B8F71]" : "text-red-400"}>
          {result.success ? "✓" : "✗"}
        </span>
      )}
    </div>
  );
}
