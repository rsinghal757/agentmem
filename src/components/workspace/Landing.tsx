"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  ArrowUp,
  Bold,
  FileText,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Search,
  Share2,
  SquareCode,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { BrandMark } from "@/components/workspace/BrandMark";
import { ThemeToggle } from "@/components/workspace/ThemeToggle";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "The note is the screen",
    body: "Your document sits in the middle at a readable measure, set in a serif built for long passages. The file tree and the agent are narrow fixed docks either side — they never grow into your writing.",
  },
  {
    title: "Format without leaving the page",
    body: "A two-row ribbon gives you headings, emphasis, lists, quotes, code and rules. Switch between the visual surface and raw markdown at any point; both write the same file.",
  },
  {
    title: "An agent that edits files, not a chatbot",
    body: "Ask a question and the agent reads, searches, links and rewrites notes in your vault. Every action it takes is listed as a line of provenance you can follow back to a path.",
  },
  {
    title: "Wikilinks become a map",
    body: "Double-bracket anything. GizzNote resolves the link, keeps a backlink list on each note, and draws the whole vault as a graph you can walk.",
  },
];

function MockChrome() {
  return (
    <div className="sq-frame mx-auto w-full max-w-[1000px] border border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--card),transparent_14%)] p-3 shadow-[var(--shadow-hero)]">
      <div className="sq-panel aspect-[1208/620] w-full overflow-hidden">
        <div className="flex h-full gap-2.5">
          {/* Notes rail */}
          <div className="sq-card hidden w-[17%] shrink-0 flex-col overflow-hidden bg-card sm:flex">
            <div className="flex items-center gap-1 border-b border-border px-2 py-2">
              <Search className="h-2.5 w-2.5 text-[var(--text-faint)]" strokeWidth={2} />
              <span className="text-[7px] text-[var(--text-faint)]">Find a note</span>
            </div>
            <div className="space-y-[3px] p-1.5">
              {[
                ["_daily", true],
                ["2026-03-18", false],
                ["bmv", true],
                ["bose-marletto", false],
                ["one-page-version", false],
                ["concepts", true],
                ["entanglement", false],
                ["decoherence", false],
              ].map(([label, isFolder], index) => (
                <div
                  key={`${label}`}
                  className={`flex items-center gap-1 rounded-[3px] px-1 py-[3px] text-[7px] ${
                    index === 4
                      ? "bg-[var(--brand-tint)] text-[var(--brand-deep)]"
                      : "text-[var(--text-faint)]"
                  }`}
                  style={{ paddingLeft: isFolder ? 4 : 10 }}
                >
                  {!isFolder ? (
                    <FileText className="h-2 w-2 shrink-0" strokeWidth={2} />
                  ) : null}
                  <span className={isFolder ? "uppercase tracking-[0.1em]" : ""}>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1 pt-1.5 text-[7px] text-[var(--text-faint)]">
                <Share2 className="h-2 w-2" strokeWidth={2} />
                Connections
              </div>
            </div>
          </div>

          {/* Document */}
          <div className="sq-card flex min-w-0 flex-1 flex-col overflow-hidden bg-card">
            <div className="flex h-[38px] shrink-0 flex-col justify-between border-b border-border px-2 py-1.5">
              <div className="flex items-center gap-[3px] text-[var(--text-faint)]">
                {[Undo2, Redo2, Bold, Italic, Strikethrough, Heading2].map((Icon, index) => (
                  <Icon key={index} className="h-2.5 w-2.5" strokeWidth={2} />
                ))}
              </div>
              <div className="flex items-center gap-[3px] text-[var(--text-faint)]">
                {[List, ListOrdered, Quote, SquareCode, Minus].map((Icon, index) => (
                  <Icon key={index} className="h-2.5 w-2.5" strokeWidth={2} />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-[var(--canvas)] px-3 py-3">
              <div className="sq-card mx-auto h-full w-full max-w-[74%] border border-border bg-[var(--paper)] px-5 py-5">
                <p className="font-serif text-[13px] leading-tight tracking-[-0.02em] text-[var(--text-strong)]">
                  Bose–Marletto–Vedral
                </p>
                <div className="mt-2 border-t border-border pt-2">
                  <div className="h-[3px] w-[92%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-[5px] h-[3px] w-[97%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-[5px] h-[3px] w-[64%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-3 h-[5px] w-[34%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-[7px] h-[3px] w-[89%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-[5px] h-[3px] w-[95%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-[5px] h-[3px] w-[47%] rounded-full bg-[var(--surface-active)]" />
                  <div className="mt-[5px] h-[3px] w-[72%] rounded-full bg-[var(--brand-tint)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Agent dock */}
          <div className="sq-card hidden w-[27%] shrink-0 flex-col overflow-hidden bg-card md:flex">
            <div className="border-b border-border px-2 py-2">
              <div className="text-[8px] font-semibold text-[var(--text-strong)]">Agent</div>
              <div className="mt-[3px] text-[7px] text-[var(--text-faint)]">
                Reviewing the BMV note
              </div>
            </div>

            <div className="flex-1 space-y-2 p-2">
              <div className="sq-control ml-auto w-[76%] border border-[color-mix(in_oklab,var(--brand),transparent_82%)] bg-[var(--brand-wash)] px-1.5 py-1">
                <div className="h-[3px] w-[88%] rounded-full bg-[color-mix(in_oklab,var(--brand),transparent_55%)]" />
                <div className="mt-1 h-[3px] w-[56%] rounded-full bg-[color-mix(in_oklab,var(--brand),transparent_55%)]" />
              </div>
              <div className="space-y-[5px] border-l border-border pl-1.5 text-[6.5px] text-[var(--text-faint)]">
                <div>Read bmv/bose-marletto.md</div>
                <div>Searched “witness”</div>
                <div>Wrote concepts/entanglement.md</div>
              </div>
              <div className="pt-0.5">
                <div className="h-[3px] w-[94%] rounded-full bg-[var(--surface-active)]" />
                <div className="mt-1 h-[3px] w-[86%] rounded-full bg-[var(--surface-active)]" />
                <div className="mt-1 h-[3px] w-[58%] rounded-full bg-[var(--surface-active)]" />
              </div>
            </div>

            <div className="p-1.5">
              <div className="sq-control border border-border p-1.5">
                <div className="text-[7px] text-[var(--text-faint)]">
                  Ask about your notes, or start a draft
                </div>
                <div className="mt-2 flex items-center">
                  <div className="sq-control border border-border px-1 py-[2px] text-[6px] text-[var(--text-faint)]">
                    bose-marletto
                  </div>
                  <div className="ml-auto flex h-3 w-3 items-center justify-center rounded-full bg-[var(--brand)] opacity-55">
                    <ArrowUp className="h-2 w-2 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--paper)]">
      <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center gap-3 border-b border-border bg-[var(--card)]/90 px-4 backdrop-blur-md sm:px-8">
        <span className="inline-flex items-center gap-2">
          <BrandMark className="h-6 w-6" />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--text-strong)]">
            GizzNote
          </span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <SignInButton>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button size="sm">Start writing</Button>
          </SignUpButton>
        </div>
      </header>

      <section
        className="px-5 pt-16 sm:px-10 sm:pt-20"
        style={{
          background:
            "linear-gradient(var(--canvas), var(--canvas)) bottom / 101% 36% no-repeat, var(--paper)",
        }}
      >
        <div className="mx-auto max-w-[940px] text-center">
          <h1 className="mx-auto max-w-[17ch] text-balance text-[clamp(40px,6vw,72px)] font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--text-strong)]">
            Write, think, and keep the file
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-pretty text-[clamp(16px,1.8vw,21px)] font-light leading-[1.5] text-[var(--text-muted)]">
            GizzNote is a markdown notebook where the note stays at the centre of the screen
            and an agent works in the margin.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <SignUpButton>
              <Button size="lg">Start writing free</Button>
            </SignUpButton>
            <SignInButton>
              <Button variant="outline" size="lg">
                Open your vault
              </Button>
            </SignInButton>
          </div>

          <p className="mt-4 text-[12.5px] text-[var(--text-faint)]">
            Plain markdown · wikilinks · your files, exportable at any time
          </p>
        </div>

        <div className="mt-12 pb-1 sm:mt-16">
          <MockChrome />
        </div>
      </section>

      <section className="bg-[var(--canvas)] px-5 pb-20 pt-16 sm:px-10">
        <div className="mx-auto max-w-[940px]">
          <h2 className="max-w-[20ch] text-balance text-[clamp(26px,3.4vw,40px)] font-medium leading-[1.1] tracking-[-0.025em] text-[var(--text-strong)]">
            Built for the long middle of a piece of writing
          </h2>

          <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <h3 className="text-[19px] font-medium leading-snug tracking-[-0.02em] text-[var(--text-strong)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] font-light leading-[1.6] text-[var(--text-muted)]">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-[var(--paper)] px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-balance text-[clamp(24px,3vw,34px)] font-medium leading-[1.12] tracking-[-0.025em] text-[var(--text-strong)]">
            Your vault is a folder of markdown. Nothing else.
          </h2>
          <p className="mx-auto mt-3 max-w-[48ch] text-[15px] font-light leading-[1.6] text-[var(--text-muted)]">
            No proprietary blocks, no database you can&rsquo;t read. If you leave, you take
            plain text with you.
          </p>
          <div className="mt-7 flex justify-center">
            <SignUpButton>
              <Button size="lg">Start writing free</Button>
            </SignUpButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-[var(--canvas)] px-5 py-8 sm:px-10">
        <div className="mx-auto flex max-w-[940px] flex-wrap items-center gap-3 text-[12.5px] text-[var(--text-faint)]">
          <BrandMark className="h-5 w-5" />
          <span className="font-medium text-[var(--text-muted)]">GizzNote</span>
          <span className="ml-auto">A desk for thinking in markdown</span>
        </div>
      </footer>
    </div>
  );
}
