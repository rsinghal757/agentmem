"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

function buildTree(files: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of files) {
    const parts = filePath.split("/");
    let current = root;

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join("/");
      let existing = current.find((node) => node.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isDirectory: !isLast,
          children: [],
        };
        current.push(existing);
      }

      current = existing.children;
    }
  }

  return sortTree(root);
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map((node) => ({ ...node, children: sortTree(node.children) }))
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
}

function Folder({
  node,
  depth,
  activePath,
  forceOpen,
}: {
  node: TreeNode;
  depth: number;
  activePath?: string;
  forceOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const open = forceOpen || isOpen;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!open)}
        className="sq-control flex h-7 w-full items-center gap-1 pr-2 text-left text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-faint)] outline-none hover:bg-[var(--surface-hover)] hover:text-[var(--text-muted)]"
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
      >
        <ChevronRight
          className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-90")}
          strokeWidth={2}
        />
        <span className="truncate">{node.name}</span>
      </button>

      {open ? (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              forceOpen={forceOpen}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  activePath,
  forceOpen,
}: {
  node: TreeNode;
  depth: number;
  activePath?: string;
  forceOpen: boolean;
}) {
  if (node.isDirectory) {
    return <Folder node={node} depth={depth} activePath={activePath} forceOpen={forceOpen} />;
  }

  const isActive = activePath === node.path;

  return (
    <Link
      href={`/vault/${node.path}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "sq-control focus-ring flex h-7 items-center gap-2 pr-2 text-[13px] outline-none",
        isActive
          ? "bg-[var(--brand-tint)] font-medium text-[var(--brand-deep)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)]",
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <FileText
        className={cn("h-3.5 w-3.5 shrink-0", isActive ? "opacity-90" : "opacity-55")}
        strokeWidth={1.5}
      />
      <span className="truncate">{node.name.replace(/\.md$/, "")}</span>
    </Link>
  );
}

export function VaultTree({
  files,
  isLoading,
  query,
}: {
  files: string[];
  isLoading: boolean;
  query: string;
}) {
  const pathname = usePathname();
  const activePath = pathname.startsWith("/vault/")
    ? decodeURIComponent(pathname.slice("/vault/".length))
    : undefined;

  const normalizedQuery = query.trim().toLowerCase();

  const tree = useMemo(() => {
    const markdown = files.filter((file) => file.endsWith(".md"));
    const filtered = normalizedQuery
      ? markdown.filter((file) => file.toLowerCase().includes(normalizedQuery))
      : markdown;
    return buildTree(filtered);
  }, [files, normalizedQuery]);

  if (isLoading) {
    return (
      <div className="space-y-1.5 px-2 py-1">
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="h-4 w-[52%]" />
        <Skeleton className="h-4 w-[82%]" />
        <Skeleton className="h-4 w-[44%]" />
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <p className="px-2 py-6 text-[12px] leading-relaxed text-[var(--text-faint)]">
        {normalizedQuery
          ? `No note matches “${query.trim()}”.`
          : "No notes yet. Create one above, or ask the agent to write the first."}
      </p>
    );
  }

  return (
    <div className="space-y-px pb-2">
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          activePath={activePath}
          forceOpen={normalizedQuery.length > 0}
        />
      ))}
    </div>
  );
}
