"use client";

import useSWR from "swr";

export type RecentNote = {
  path: string;
  title: string;
  type: string | null;
  tags: string[];
  excerpt: string;
  wordCount: number;
  updatedAt: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Hook listing the most recently touched notes in the vault */
export function useRecentNotes(limit = 8) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/vault/recent?limit=${limit}`,
    fetcher,
    { refreshInterval: 10000 },
  );

  return {
    notes: (data?.notes as RecentNote[]) || [],
    isLoading,
    error,
    refresh: mutate,
  };
}
