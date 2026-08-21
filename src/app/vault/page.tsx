import Link from "next/link";
import { FileText, GitBranch, Sparkles } from "lucide-react";

export default function VaultPage() {
  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">Library</p>
          <h1 className="display-title mt-1 text-[1.7rem] text-[var(--text-strong)] sm:text-[2rem]">Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse markdown notes from the library panel or{" "}
            <Link href="/vault/graph" className="font-medium text-primary hover:text-[var(--brand-hover)]">
              view the graph
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-2xl">
          <div className="brand-pill">
            <FileText className="h-3.5 w-3.5" />
            Markdown vault
          </div>
          <h2 className="display-title mt-5 max-w-lg text-[2rem] leading-[1.12] text-[var(--text-strong)] sm:text-[2.35rem]">
            Your ideas, in files you own.
          </h2>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Select a note from the sidebar, create a new one, or open the graph to see how your research connects.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-[1.4rem] border border-[var(--border-subtle)] p-4 shadow-[var(--shadow-control)]"
              style={{ background: "var(--wash-sand)" }}
            >
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.6} />
              <p className="display-title mt-3 text-[1.25rem] text-[var(--text-strong)]">Capture research</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Turn chat into durable markdown you can keep.</p>
            </div>
            <div
              className="rounded-[1.4rem] border border-[var(--border-subtle)] p-4 shadow-[var(--shadow-control)]"
              style={{ background: "var(--wash-lilac)" }}
            >
              <GitBranch className="h-4 w-4 text-primary" strokeWidth={1.6} />
              <p className="display-title mt-3 text-[1.25rem] text-[var(--text-strong)]">Map connections</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Open the graph to see linked ideas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
