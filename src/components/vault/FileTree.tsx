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
            "flex w-full items-center gap-2 rounded-[8px] px-3 py-3 text-[15px] text-[#1C1C1C] transition-colors hover:bg-white active:bg-[#F1F3F0]",
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#6B6B6B]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#6B6B6B]" />
          )}
          <Folder className="h-4 w-4 shrink-0 text-[#6B6B6B]" />
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
        "flex items-center gap-2 rounded-[8px] px-3 py-3 text-[15px] text-[#6B6B6B] transition-colors hover:bg-white hover:text-[#1C1C1C] active:bg-[#F1F3F0]",
      )}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      <FileText className="h-4 w-4 shrink-0 text-[#0B6B3A]" />
      <span className="truncate">{node.name}</span>
    </Link>
  );
}

export function FileTree() {
  const { files, isLoading } = useVaultFiles("", true);
  const tree = buildTree(files.filter((f: string) => f.endsWith(".md")));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[15px] text-[#6B6B6B]">
        Loading...
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#E8EAE7] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="mb-3 text-4xl">📚</div>
        <p className="text-[15px] text-[#1C1C1C]">Vault is empty</p>
        <p className="mt-1 text-[13px] text-[#6B6B6B]">
          Start chatting to build your knowledge base
        </p>
      </div>
    );
  }

  return (
    <div className="mx-6 my-6 rounded-[10px] border border-[#E8EAE7] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {tree.map((node) => (
        <TreeItem key={node.path} node={node} />
      ))}
    </div>
  );
}
