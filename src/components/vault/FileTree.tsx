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
            "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100",
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          )}
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="truncate font-medium">{node.name}</span>
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
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100",
      )}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      <FileText className="h-4 w-4 shrink-0 text-[#6B8F71]" />
      <span className="truncate">{node.name}</span>
    </Link>
  );
}

export function FileTree() {
  const { files, isLoading } = useVaultFiles("", true);
  const tree = buildTree(files.filter((f: string) => f.endsWith(".md")));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 text-4xl">📚</div>
        <p className="text-sm text-gray-500">Vault is empty</p>
        <p className="mt-1 text-xs text-gray-400">
          Start chatting to build your knowledge base
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {tree.map((node) => (
        <TreeItem key={node.path} node={node} />
      ))}
    </div>
  );
}
