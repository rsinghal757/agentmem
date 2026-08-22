"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleCheck,
  CircleX,
  FilePenLine,
  FolderTree,
  Link2,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const Icon = toolIcons[safeToolName] || Wrench;
  const succeeded = !(result && "success" in result && result.success === false);
  const defaultLabel = toolLabels[safeToolName] || safeToolName;
  const label = succeeded
    ? defaultLabel
    : safeToolName === "vault_write"
      ? "Write failed"
      : `${defaultLabel} failed`;
  const safeArgs = args || {};
  const path = (safeArgs.path || safeArgs.fromPath || safeArgs.query || "") as string;
  const StatusIcon = succeeded ? CircleCheck : CircleX;

  return (
    <Badge
      variant="outline"
      className={cn(
        "max-w-full gap-1.5 rounded-full bg-[var(--wash-sage)] px-3 py-1.5 text-xs font-normal text-muted-foreground shadow-none",
        className,
      )}
    >
      <Icon className="text-primary" />
      <span className="font-medium text-foreground">{label}</span>
      {path && (
        <span className="max-w-48 truncate">
          {path.length > 44 ? `…${path.slice(-43)}` : path}
        </span>
      )}
      {result && (
        <StatusIcon className={succeeded ? "text-primary" : "text-destructive"} />
      )}
    </Badge>
  );
}
