"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleAlert,
  FilePenLine,
  FolderTree,
  Link2,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolIcons: Record<string, LucideIcon> = {
  vault_read: BookOpen,
  vault_write: FilePenLine,
  vault_search: Search,
  vault_link: Link2,
  vault_list: FolderTree,
  vault_delete: Trash2,
};

const toolLabels: Record<string, string> = {
  vault_read: "Read",
  vault_write: "Wrote",
  vault_search: "Searched",
  vault_link: "Linked",
  vault_list: "Listed",
  vault_delete: "Deleted",
};

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  className?: string;
}

/**
 * A single quiet line of provenance: what the agent touched in the vault.
 */
export function ToolCallBadge({
  toolName,
  args,
  result,
  className,
}: ToolCallBadgeProps) {
  const safeToolName = toolName || "unknown";
  const Icon = toolIcons[safeToolName] || Wrench;
  const succeeded = !(result && "success" in result && result.success === false);
  const label = toolLabels[safeToolName] || safeToolName;
  const safeArgs = args || {};
  const path = (safeArgs.path || safeArgs.fromPath || safeArgs.query || "") as string;

  return (
    <span
      className={cn(
        "flex max-w-full items-center gap-1.5 text-[11px] text-[var(--text-faint)]",
        !succeeded && "text-destructive",
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={1.5} />
      <span className="shrink-0">{succeeded ? label : `${label} failed`}</span>
      {path ? (
        <span className="truncate font-mono text-[10.5px] text-[var(--text-faint)]">
          {path.length > 42 ? `…${path.slice(-41)}` : path}
        </span>
      ) : null}
      {!succeeded ? <CircleAlert className="h-3 w-3 shrink-0" strokeWidth={1.5} /> : null}
    </span>
  );
}
