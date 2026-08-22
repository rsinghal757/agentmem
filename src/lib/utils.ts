import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const DEFAULT_THREAD_ID = "default";

/** Merge Tailwind CSS classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve thread id from query/body with a deterministic fallback */
export function getThreadId(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_THREAD_ID;
}

export function scopeThreadId(userId: string, threadId?: string | null): string {
  const resolved = getThreadId(threadId);
  return resolved === DEFAULT_THREAD_ID ? `${userId}:${DEFAULT_THREAD_ID}` : resolved;
}

/** Get the current date in YYYY-MM-DD format */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get the current ISO timestamp */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/** Compact relative time for thread lists and metadata */
export function formatRelativeTime(value?: string | Date | null): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const deltaMs = Date.now() - date.getTime();
  const minutes = Math.round(deltaMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function displayThreadTitle(title?: string | null): string {
  if (!title || title === "New chat") return "Untitled";
  return title;
}
