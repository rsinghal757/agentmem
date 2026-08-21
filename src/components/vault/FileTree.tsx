"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Library,
  Plus,
} from "lucide-react";
import { useVaultFiles } from "@/hooks/useVaultFiles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-full justify-start gap-1.5 rounded-xl px-2 text-[0.8rem] text-foreground shadow-none hover:bg-card/80"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <Folder className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium">{node.name}</span>
        </Button>

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
        "focus-ring flex h-9 items-center gap-2 rounded-xl border px-2 text-[0.8rem] transition-colors",
        isActive
          ? "border-transparent bg-[var(--wash-sage)] font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:bg-card/80 hover:text-foreground",
      )}
      style={{ paddingLeft: `${depth * 16 + 24}px` }}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="truncate">{node.name.replace(/\.md$/, "")}</span>
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
  const tree = buildTree(files.filter((file: string) => file.endsWith(".md")));

  async function handleCreateFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreating) return;

    const trimmedPath = newFilePath.trim();
    if (!trimmedPath) {
      setCreateError("Please enter a file name.");
      return;
    }

    const normalizedPath = trimmedPath.endsWith(".md")
      ? trimmedPath
      : `${trimmedPath}.md`;
    const fileName =
      normalizedPath.split("/").pop()?.replace(/\.md$/, "") || "New Note";

    setCreateError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/vault/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: normalizedPath,
          content: `# ${fileName}\n\n`,
        }),
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
      setCreateError(
        error instanceof Error ? error.message : "Failed to create file",
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-1">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-8 w-[82%]" />
        <Skeleton className="h-8 w-[68%]" />
        <Skeleton className="h-8 w-[88%]" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        panel
          ? "m-0 h-full"
          : "mx-6 my-6 rounded-[var(--radius-panel)] border bg-card p-3 shadow-[var(--shadow-raised)]",
      )}
    >
      <form
        onSubmit={handleCreateFile}
        className="mb-3 rounded-[1.2rem] border border-[var(--border-subtle)] bg-card/80 p-2.5 shadow-[var(--shadow-control)]"
      >
        <label
          htmlFor="new-vault-file"
          className="mb-2 block text-xs font-medium text-foreground"
        >
          Create a note
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="new-vault-file"
            type="text"
            value={newFilePath}
            onChange={(event) => setNewFilePath(event.target.value)}
            placeholder="Folder/note-name"
            className="h-9 min-w-0 flex-1 rounded-full text-xs shadow-none"
          />
          <Button
            type="submit"
            disabled={isCreating}
            aria-label={isCreating ? "Creating file" : "Create file"}
            size="icon"
            className="h-9 w-9 rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {createError && (
          <p className="mt-2 text-xs text-destructive">{createError}</p>
        )}
      </form>

      {tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-[var(--border-soft)] bg-[var(--wash-sand)] px-6 py-12 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[30%] bg-primary text-primary-foreground shadow-[var(--shadow-mark)]">
            <Library className="h-5 w-5" />
          </div>
          <p className="font-display text-lg tracking-[-0.03em] text-[var(--text-strong)]">The vault is waiting</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a note, or begin in conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {tree.map((node) => (
            <TreeItem key={node.path} node={node} activePath={activePath} />
          ))}
        </div>
      )}
    </div>
  );
}
