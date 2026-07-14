import Link from "next/link";
import { FileText, GitBranch, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VaultPage() {
  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="workspace-header">
        <div>
          <div className="eyebrow">Vault</div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-strong)] sm:text-2xl">Vault Explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse markdown notes from the filesystem panel or <Link href="/vault/graph" className="font-medium text-primary hover:text-[var(--brand-hover)]">view graph</Link>.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <Card className="w-full max-w-2xl border-border/80 bg-card/95 shadow-[var(--shadow-panel)]">
          <CardContent className="p-6 sm:p-8">
          <div className="brand-pill"><FileText className="h-3.5 w-3.5" />Markdown vault</div>
          <p className="mt-4 max-w-lg text-2xl font-semibold tracking-[-0.035em] text-[var(--text-strong)]">Your ideas, in files you own.</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">Select a note from the sidebar, create a new one, or open the graph to see how your research connects.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 text-left">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">Capture research</p>
              <p className="mt-1 text-xs text-muted-foreground">Turn chat outputs into durable markdown.</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 text-left">
              <GitBranch className="h-4 w-4 text-primary" />
              <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">Map connections</p>
              <p className="mt-1 text-xs text-muted-foreground">Open the graph to see linked ideas.</p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
