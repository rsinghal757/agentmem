"use client";

import { ArrowRight, BookOpen, GitBranch, MessageCircleHeart } from "lucide-react";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import type { ComponentProps } from "react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/button";

const rituals = [
  {
    wash: "var(--wash-sand)",
    icon: MessageCircleHeart,
    title: "Speak it through",
    body: "Ask, argue, and draft in conversation. The assistant stays close to what you have already written.",
  },
  {
    wash: "var(--wash-sage)",
    icon: BookOpen,
    title: "Keep it as a note",
    body: "Worthwhile thoughts become portable markdown in a vault you can read, edit, and take elsewhere.",
  },
  {
    wash: "var(--wash-lilac)",
    icon: GitBranch,
    title: "See it connect",
    body: "Wikilinks gather into a quiet graph, so projects, people, and ideas can find one another.",
  },
];

type LandingPageProps = {
  auth?: "live" | "static";
};

export function LandingPage({ auth = "live" }: LandingPageProps) {
  return (
    <div className="relative h-full min-h-0 overflow-y-auto overscroll-y-contain">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] overflow-hidden">
        <div className="absolute -left-24 top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-[22rem] w-[22rem] rounded-full bg-[color-mix(in_oklab,var(--wash-blush)_80%,transparent)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <BrandLockup markSize={40} showTagline={false} />
          <div className="flex items-center gap-2">
            <AuthButton action="sign-in" variant="ghost" size="sm" className="hidden sm:inline-flex" auth={auth}>
              Sign in
            </AuthButton>
            <AuthButton action="sign-up" size="sm" className="rounded-full px-4" auth={auth}>
              Begin
            </AuthButton>
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-3xl text-center sm:mt-14">
          <p className="eyebrow">A writing studio</p>
          <h1 className="display-title mx-auto mt-4 max-w-[18ch] text-[2.7rem] leading-[1.04] text-[var(--text-strong)] sm:text-6xl">
            Where a thought can become a library.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground sm:text-lg">
            GizzNote is a calm place to think in conversation and keep what matters as notes you own.
            The assistant reads your vault, tends it with care, and leaves every idea in markdown.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <AuthButton action="sign-up" size="lg" className="rounded-full px-6" auth={auth}>
              Start your vault
              <ArrowRight className="h-4 w-4" />
            </AuthButton>
            <AuthButton action="sign-in" variant="outline" size="lg" className="rounded-full px-6" auth={auth}>
              Sign in
            </AuthButton>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-4xl sm:mt-14">
          <div className="paper-vignette overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] p-3 sm:p-4">
            <div className="rounded-[1.55rem] bg-[var(--surface-panel)] px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-xl tracking-[-0.03em] text-[var(--text-strong)]">
                  Untitled
                </p>
                <span className="brand-pill">Ready</span>
              </div>
              <p className="mt-6 max-w-xl text-left text-[15px] leading-relaxed text-muted-foreground">
                Ask a question, develop an argument, or synthesize a week of notes. GizzNote stays
                with the writing instead of hiding memory in a black box.
              </p>
              <div className="mt-8 rounded-[1.6rem] border border-[var(--border-subtle)] bg-card px-5 py-4 shadow-[var(--shadow-composer)]">
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[15px] text-muted-foreground">
                    Ask GizzNote anything…
                  </p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:mt-12 sm:grid-cols-3">
          {rituals.map(({ wash, icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-[1.55rem] border border-[var(--border-subtle)] px-5 py-6 text-left shadow-[var(--shadow-control)]"
              style={{ background: wash }}
            >
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
              <h2 className="display-title mt-5 text-[1.55rem] leading-tight text-[var(--text-strong)]">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>

        <footer className="mt-16 text-center">
          <p className="font-display text-sm italic text-muted-foreground">
            Made for people who keep notes, and want them kept well.
          </p>
        </footer>
      </div>
    </div>
  );
}

function AuthButton({
  action,
  auth = "live",
  children,
  ...buttonProps
}: ComponentProps<typeof Button> & { action: "sign-in" | "sign-up"; auth?: "live" | "static" }) {
  if (auth === "static") {
    return <Button {...buttonProps}>{children}</Button>;
  }

  return (
    <>
      <ClerkLoaded>
        {action === "sign-up" ? (
          <SignUpButton>
            <Button {...buttonProps}>{children}</Button>
          </SignUpButton>
        ) : (
          <SignInButton>
            <Button {...buttonProps}>{children}</Button>
          </SignInButton>
        )}
      </ClerkLoaded>
      <ClerkLoading>
        <Button {...buttonProps}>{children}</Button>
      </ClerkLoading>
    </>
  );
}
