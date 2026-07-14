"use client";

import { ArrowRight, FileText, GitBranch, Orbit, Sparkles } from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
          <div className="h-full w-full">
            <ChatInterface />
          </div>
        </SignedIn>

        <SignedOut>
          <div className="relative flex h-full items-center justify-center overflow-y-auto px-5 py-8 sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,color-mix(in_oklab,var(--brand)_9%,transparent),transparent_26rem),radial-gradient(circle_at_92%_85%,color-mix(in_oklab,var(--brand)_7%,transparent),transparent_30rem)]" />
            <Card className="relative w-full max-w-5xl overflow-hidden border-border/80 bg-card/95 shadow-[var(--shadow-panel)]">
              <CardContent className="grid p-0 md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-7 sm:p-10 md:p-12">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-primary text-primary-foreground shadow-[var(--shadow-control)]">
                      <Orbit className="h-[1.1rem] w-[1.1rem]" />
                    </div>
                    <span className="text-sm font-semibold tracking-[-0.025em]">0xMem</span>
                  </div>

                  <div className="mt-10 eyebrow">Your thinking workspace</div>
                  <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-[var(--text-strong)] sm:text-5xl">
                    Let your notes become a mind you can talk to.
                  </h1>
                  <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                    Research, write, and connect ideas with an AI that works directly from your markdown vault.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2.5">
                    <SignUpButton>
                      <Button size="lg">
                        Start building your vault
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </SignUpButton>
                    <SignInButton>
                      <Button variant="outline" size="lg">Sign in</Button>
                    </SignInButton>
                  </div>
                </div>

                <div className="border-t bg-[var(--brand-softer)] p-6 md:border-l md:border-t-0 md:p-8">
                  <div className="eyebrow">One continuous system</div>
                  <div className="mt-4 space-y-3">
                    {[
                      [Sparkles, "Think in conversation", "Explore questions and turn rough ideas into durable notes."],
                      [FileText, "Own the source", "Everything important lives as portable markdown in your vault."],
                      [GitBranch, "See the connections", "Wikilinks become a navigable graph of your thinking."],
                    ].map(([Icon, title, description]) => {
                      const FeatureIcon = Icon as typeof Sparkles;
                      return (
                        <div key={title as string} className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-[var(--shadow-control)]">
                          <FeatureIcon className="h-4 w-4 text-primary" />
                          <p className="mt-3 text-sm font-semibold text-foreground">{title as string}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description as string}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
