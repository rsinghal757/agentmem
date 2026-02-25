"use client";

import { useVaultFiles } from "@/hooks/useVaultFiles";
import { FileText, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

/** Build a tree structure from flat file paths */
function buildTree(files: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of files) {
    const parts = filePath.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let existing = current.find((n) => n.name === part);
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

/** Sort: directories first, then alphabetically */
function sortTree(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map((n) => ({ ...n, children: sortTree(n.children) }))
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
}

function TreeItem({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.isDirectory) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-neutral-500" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-neutral-500" />
          )}
          <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && (
          <div>
            {node.children.map((child) => (
              <TreeItem key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/vault/${node.path}`}
      className={cn(
        "flex items-center gap-1.5 rounded px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200",
      )}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-violet-400" />
      <span className="truncate">{node.name}</span>
    </Link>
  );
}

export function FileTree() {
  const { files, isLoading } = useVaultFiles("", true);
  const tree = buildTree(files.filter((f: string) => f.endsWith(".md")));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-neutral-500">
        Loading...
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-xs text-neutral-500">
        Vault is empty
      </div>
    );
  }

  return (
    <div className="py-1">
      {tree.map((node) => (
        <TreeItem key={node.path} node={node} />
      ))}
    </div>
  );
}
