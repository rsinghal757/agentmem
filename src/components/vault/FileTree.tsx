"use client";

import { useVaultFiles } from "@/hooks/useVaultFiles";
import { FileText, Folder, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  activePath,
  depth = 0,
}: {
  node: TreeNode;
  activePath?: string;
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
              <TreeItem
                key={child.path}
                node={child}
                activePath={activePath}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = activePath === node.path;

  return (
    <Link
      href={`/vault/${node.path}`}
      className={cn(
        "flex items-center gap-2 rounded-[8px] px-3 py-3 text-[15px] transition-colors active:bg-[#F1F3F0]",
        isActive
          ? "border border-[#0B6B3A]/20 bg-[#EAF6EE] text-[#1C1C1C]"
          : "text-[#6B6B6B] hover:bg-white hover:text-[#1C1C1C]",
      )}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      <FileText className="h-4 w-4 shrink-0 text-[#0B6B3A]" />
      <span className="truncate">{node.name}</span>
    </Link>
  );
}

interface FileTreeProps {
  activePath?: string;
  panel?: boolean;
}

export function FileTree({ activePath, panel = false }: FileTreeProps) {
  const router = useRouter();
  const { files, isLoading, refresh } = useVaultFiles("", true);
  const [newFilePath, setNewFilePath] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const tree = buildTree(files.filter((f: string) => f.endsWith(".md")));

  async function handleCreateFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    const trimmedPath = newFilePath.trim();
    if (!trimmedPath) {
      setCreateError("Please enter a file name.");
      return;
    }

    const normalizedPath = trimmedPath.endsWith(".md")
      ? trimmedPath
      : `${trimmedPath}.md`;
    const fileName = normalizedPath.split("/").pop()?.replace(/\.md$/, "") || "New Note";
    const initialContent = `# ${fileName}\n\n`;

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/vault/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: normalizedPath, content: initialContent }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create file");
      }

      const data = await response.json();
      await refresh();
      setNewFilePath("");
      router.push(`/vault/${data.path}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create file";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[15px] text-[#6B6B6B]">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[10px] border border-[#E8EAE7] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        panel ? "m-0 h-full" : "mx-6 my-6",
      )}
    >
      <form
        onSubmit={handleCreateFile}
        className="mb-3 rounded-[8px] border border-[#E8EAE7] bg-[#F7F8F6] p-3"
      >
        <label
          htmlFor="new-vault-file"
          className="mb-2 block text-[13px] font-medium text-[#1C1C1C]"
        >
          Create new file
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="new-vault-file"
            type="text"
            value={newFilePath}
            onChange={(event) => setNewFilePath(event.target.value)}
            placeholder="notes/my-note or my-note.md"
            className="h-10 min-w-0 flex-1 rounded-[8px] border border-[#D8DCD7] bg-white px-3 text-[14px] text-[#1C1C1C] outline-none ring-[#0B6B3A]/30 transition focus:ring-2"
          />
          <button
            type="submit"
            disabled={isCreating}
            aria-label={isCreating ? "Creating file" : "Create file"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#0B6B3A] p-0 text-white transition hover:bg-[#0F7A43] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {createError && (
          <p className="mt-2 text-[13px] text-[#A11A1A]">{createError}</p>
        )}
      </form>
      {tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#E8EAE7] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mb-3 text-4xl">📚</div>
          <p className="text-[15px] text-[#1C1C1C]">Vault is empty</p>
          <p className="mt-1 text-[13px] text-[#6B6B6B]">
            Start chatting to build your knowledge base
          </p>
        </div>
      ) : (
        tree.map((node) => (
          <TreeItem key={node.path} node={node} activePath={activePath} />
        ))
      )}
    </div>
  );
}
