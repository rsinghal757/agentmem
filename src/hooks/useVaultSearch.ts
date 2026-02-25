"use client";

import useSWR from "swr";
import type { VaultSearchResult } from "@/types/vault";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Hook to search the vault */
export function useVaultSearch(
  query: string,
  mode: "fulltext" | "semantic" = "fulltext",
  limit: number = 5,
) {
  const params = new URLSearchParams({
    q: query,
    mode,
    limit: String(limit),
  });

  const { data, error, isLoading } = useSWR(
    query ? `/api/vault/search?${params}` : null,
    fetcher,
    { dedupingInterval: 500 },
  );

  return {
    results: (data?.results as VaultSearchResult[]) || [],
    count: data?.count || 0,
    isLoading,
    error,
  };
}
