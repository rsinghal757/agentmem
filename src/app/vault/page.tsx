import Link from "next/link";
import { FileText, GitBranch, Sparkles } from "lucide-react";

export default function VaultPage() {
  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="workspace-header">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Vault</div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-strong)] sm:text-2xl">Vault Explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse markdown notes from the filesystem panel or <Link href="/vault/graph" className="font-medium text-primary hover:text-[var(--brand-hover)]">view graph</Link>.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="max-w-xl rounded-[1.35rem] border border-[var(--border-soft)] bg-[var(--surface-raised)] p-6 text-center shadow-[var(--shadow-raised)] sm:p-8">
          <div className="brand-pill mx-auto"><FileText className="h-3.5 w-3.5" />Vault ready</div>
          <p className="mt-4 text-xl font-semibold tracking-tight text-[var(--text-strong)]">Select a note to start curating memory.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use the sidebar to open files, create structured notes, or move into the graph when you want to understand how ideas connect.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--brand-softer)] p-3 text-left">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">Capture research</p>
              <p className="mt-1 text-xs text-muted-foreground">Turn chat outputs into durable markdown.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--brand-softer)] p-3 text-left">
              <GitBranch className="h-4 w-4 text-primary" />
              <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">Map connections</p>
              <p className="mt-1 text-xs text-muted-foreground">Open the graph to see linked ideas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
