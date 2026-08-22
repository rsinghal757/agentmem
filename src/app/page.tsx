"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { AuthBoundary } from "@/components/brand/AuthBoundary";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  return (
    <AuthBoundary>
      <div className="h-full min-h-0">
        <ClerkLoading>
          <LandingPage />
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
      </div>
    </AuthBoundary>
  );
}
