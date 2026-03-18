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
        <div className="flex h-full items-center justify-center text-sm text-[#62706A]">
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(11,107,58,0.08),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(11,107,58,0.08),transparent_32%)]" />
            <div className="relative w-full max-w-3xl rounded-3xl border border-[#DCE5DF] bg-white/90 p-8 shadow-[0_35px_80px_-48px_rgba(26,54,42,0.7)] backdrop-blur-md md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E2DA] bg-[#F3F8F4] px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[#0B6B3A]">
              <Brain className="h-3.5 w-3.5" />
              0xMem
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#171B1A] md:text-4xl">
              Research + writing memory workspace
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#5B6B64] md:text-base">
              Turn conversations into a growing knowledge vault. Chat, save notes, and
              connect ideas in your personal graph.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <SignUpButton>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#0B6B3A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0F7A43]">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-xl border border-[#DCE5DF] bg-white px-4 py-2.5 text-sm font-medium text-[#171B1A] hover:bg-[#F5F7F5]">
                  Sign in
                </button>
              </SignInButton>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#E4EBE6] bg-[#FBFDFC] p-3.5">
                <Sparkles className="h-4 w-4 text-[#0B6B3A]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[#64756E]">
                  AI Assistant
                </p>
                <p className="mt-1 text-sm text-[#52605A]">Focused research and writing support.</p>
              </div>
              <div className="rounded-xl border border-[#E4EBE6] bg-[#FBFDFC] p-3.5">
                <ShieldCheck className="h-4 w-4 text-[#0B6B3A]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[#64756E]">
                  Personal Vault
                </p>
                <p className="mt-1 text-sm text-[#52605A]">Your notes stay organized as markdown files.</p>
              </div>
              <div className="rounded-xl border border-[#E4EBE6] bg-[#FBFDFC] p-3.5">
                <Brain className="h-4 w-4 text-[#0B6B3A]" />
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[#64756E]">
                  Knowledge Graph
                </p>
                <p className="mt-1 text-sm text-[#52605A]">Discover links across your ideas and projects.</p>
              </div>
            </div>
            </div>
          </div>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
