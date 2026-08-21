"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  return (
    <>
      <ClerkLoading>
        <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <div className="h-10 w-10 animate-pulse rounded-[30%] bg-primary/90" />
          <p className="font-display italic">Opening the studio…</p>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <div className="h-full w-full">
            <ChatInterface />
          </div>
        </SignedIn>

        <SignedOut>
          <LandingPage />
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
