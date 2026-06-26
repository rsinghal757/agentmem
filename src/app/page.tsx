"use client";

import { ArrowRight, Brain, ShieldCheck, Sparkles } from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Home() {
  return (
    <>
      <ClerkLoading>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <div className="h-full">
            <ChatInterface />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="relative flex h-full items-center justify-center overflow-y-auto px-6 py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,color-mix(in_oklab,var(--brand)_12%,transparent),transparent_30%),radial-gradient(circle_at_85%_80%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent_32%)]" />
            <div className="relative w-full max-w-3xl rounded-3xl border bg-[var(--surface-panel)] p-8 shadow-[var(--shadow-panel)] backdrop-blur-md md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E2DA] bg-[var(--brand-softer)] px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--brand)]">
              <Brain className="h-3.5 w-3.5" />
              0xMem
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-strong)] md:text-4xl">
              Research + writing memory workspace
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)] md:text-base">
              Turn conversations into a growing knowledge vault. Chat, save notes, and
              connect ideas in your personal graph.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <SignUpButton>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)]">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] hover:bg-[var(--brand-softer)]">
                  Sign in
                </button>
              </SignInButton>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3.5">
                <Sparkles className="h-4 w-4 text-[var(--brand)]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  AI Assistant
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Focused research and writing support.</p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3.5">
                <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  Personal Vault
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Your notes stay organized as markdown files.</p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-3.5">
                <Brain className="h-4 w-4 text-[var(--brand)]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  Knowledge Graph
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Discover links across your ideas and projects.</p>
              </div>
            </div>
            </div>
          </div>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
