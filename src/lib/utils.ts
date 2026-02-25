import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get the current user ID (placeholder for auth) */
export function getUserId(): string {
  return process.env.DEFAULT_USER_ID || "local-dev-user";
}

/** Get the current date in YYYY-MM-DD format */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get the current ISO timestamp */
export function getTimestamp(): string {
  return new Date().toISOString();
}
