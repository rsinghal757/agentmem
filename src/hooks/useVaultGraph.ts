"use client";

import useSWR from "swr";
import type { VaultGraph } from "@/types/vault";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Hook to fetch the vault graph data */
export function useVaultGraph() {
  const { data, error, isLoading, mutate } = useSWR<VaultGraph>(
    "/api/vault/graph",
    fetcher,
    { refreshInterval: 10000 },
  );

  return {
    nodes: data?.nodes || [],
    edges: data?.edges || [],
    isLoading,
    error,
    refresh: mutate,
  };
}
