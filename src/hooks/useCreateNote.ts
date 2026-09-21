"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useVaultFiles } from "@/hooks/useVaultFiles";

/** Create a markdown note from a path and open it. */
export function useCreateNote() {
  const router = useRouter();
  const { refresh } = useVaultFiles("", true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(rawPath: string) {
    if (isCreating) return false;

    const trimmed = rawPath.trim();
    if (!trimmed) {
      setError("Give the note a name first.");
      return false;
    }

    const path = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
    const title = path.split("/").pop()?.replace(/\.md$/, "") || "Untitled";

    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/vault/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content: `# ${title}\n\n` }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Could not create that note.");
      }

      const data = await response.json();
      await refresh();
      router.push(`/vault/${data.path}`);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create that note.");
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  return { create, isCreating, error, clearError: () => setError(null) };
}
