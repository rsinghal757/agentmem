"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Hook to list vault files */
export function useVaultFiles(directory: string = "", recursive: boolean = true) {
  const params = new URLSearchParams({
    path: directory,
    recursive: String(recursive),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/vault/files?${params}`,
    fetcher,
    { refreshInterval: 5000 },
  );

  return {
    files: (data?.files as string[]) || [],
    count: data?.count || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}

/** Hook to read a specific vault file */
export function useVaultFile(path: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    path ? `/api/vault/files` : null,
    path
      ? () =>
          fetch("/api/vault/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path }),
          }).then((r) => r.json())
      : null,
  );

  return {
    content: data?.content as string | undefined,
    frontmatter: data?.frontmatter,
    wikilinks: (data?.wikilinks as string[]) || [],
    wordCount: data?.wordCount || 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
