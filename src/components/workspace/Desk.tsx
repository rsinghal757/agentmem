"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CalendarDays, Loader2, PenLine, Share2 } from "lucide-react";
import { useRecentNotes } from "@/hooks/useRecentNotes";
import { Skeleton } from "@/components/ui/skeleton";
import { getTodayDate } from "@/lib/utils";

function relativeTime(value: string | null) {
  if (!value) return "just now";

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "just now";

  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function Desk() {
  const router = useRouter();
  const { notes, isLoading, refresh } = useRecentNotes(9);
  const [isOpeningJournal, setIsOpeningJournal] = useState(false);

  const today = getTodayDate();
  const journalPath = `_daily/${today}.md`;
  const readableDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  async function openTodaysJournal() {
    if (isOpeningJournal) return;
    setIsOpeningJournal(true);

    try {
      const existing = await fetch("/api/vault/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: journalPath }),
      });

      if (!existing.ok) {
        await fetch("/api/vault/files", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: journalPath,
            content: `---\ntitle: ${today}\ntype: daily\ntags: []\n---\n\n# ${readableDate}\n\n`,
          }),
        });
        await refresh();
      }

      router.push(`/vault/${journalPath}`);
    } finally {
      setIsOpeningJournal(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[var(--measure)] px-6 py-12 sm:px-10 sm:py-16">
        <p className="eyebrow">{readableDate}</p>
        <h1 className="mt-3 font-serif text-[clamp(30px,4.2vw,44px)] font-normal leading-[1.1] tracking-[-0.025em] text-[var(--text-strong)]">
          What are you thinking about?
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--text-muted)]">
          Everything here is a markdown file you own. Write in the middle of the screen; the
          agent works beside you and leaves its edits in the same files.
        </p>

        <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={openTodaysJournal}
            className="sq-card group flex flex-col items-start border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] outline-none transition-colors hover:border-[color-mix(in_oklab,var(--brand),transparent_55%)]"
          >
            {isOpeningJournal ? (
              <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />
            ) : (
              <CalendarDays className="h-4 w-4 text-[var(--brand)]" strokeWidth={1.5} />
            )}
            <span className="mt-3 text-[14px] font-medium text-[var(--text-strong)]">
              Today&rsquo;s journal
            </span>
            <span className="mt-1 text-[12.5px] leading-snug text-[var(--text-muted)]">
              Opens <span className="font-mono">{journalPath}</span>, creating it if today is
              new.
            </span>
          </button>

          <Link
            href="/vault/graph"
            className="sq-card group flex flex-col items-start border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] outline-none transition-colors hover:border-[color-mix(in_oklab,var(--brand),transparent_55%)]"
          >
            <Share2 className="h-4 w-4 text-[var(--brand)]" strokeWidth={1.5} />
            <span className="mt-3 text-[14px] font-medium text-[var(--text-strong)]">
              Connections
            </span>
            <span className="mt-1 text-[12.5px] leading-snug text-[var(--text-muted)]">
              See which notes your wikilinks actually tie together.
            </span>
          </Link>

          <div className="sq-card flex flex-col items-start border border-border bg-[var(--surface-sunken)] p-4 text-left">
            <PenLine className="h-4 w-4 text-[var(--text-faint)]" strokeWidth={1.5} />
            <span className="mt-3 text-[14px] font-medium text-[var(--text-strong)]">
              New note
            </span>
            <span className="mt-1 text-[12.5px] leading-snug text-[var(--text-muted)]">
              Use <span className="font-mono">+</span> in the notes rail. Slashes make folders.
            </span>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
            <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--text-strong)]">
              Where you left off
            </h2>
            <span className="text-[11px] text-[var(--text-faint)]">Most recently edited</span>
          </div>

          {isLoading ? (
            <div className="space-y-4 pt-4">
              {[0, 1, 2].map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton className="h-4 w-[38%]" />
                  <Skeleton className="h-3 w-[72%]" />
                </div>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <p className="pt-6 text-[14px] leading-relaxed text-[var(--text-muted)]">
              Your vault is empty. Create a note from the rail, or ask the agent to draft the
              first one for you.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notes.map((note) => {
                const folder = note.path.includes("/")
                  ? note.path.slice(0, note.path.lastIndexOf("/"))
                  : null;

                return (
                  <li key={note.path}>
                    <Link
                      href={`/vault/${note.path}`}
                      className="group flex items-start gap-4 py-3.5 outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-serif text-[17px] leading-snug text-[var(--text-strong)] group-hover:text-[var(--brand-deep)]">
                            {note.title}
                          </span>
                          {folder ? (
                            <span className="shrink-0 font-mono text-[11px] text-[var(--text-faint)]">
                              {folder}
                            </span>
                          ) : null}
                        </span>
                        {note.excerpt ? (
                          <span className="mt-1 block truncate text-[13px] text-[var(--text-muted)]">
                            {note.excerpt}
                          </span>
                        ) : null}
                      </span>

                      <span className="mt-1 flex shrink-0 items-center gap-2 text-[11px] tabular-nums text-[var(--text-faint)]">
                        {relativeTime(note.updatedAt)}
                        <ArrowRight
                          className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                          strokeWidth={1.5}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
