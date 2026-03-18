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
