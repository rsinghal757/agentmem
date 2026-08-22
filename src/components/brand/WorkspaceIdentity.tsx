"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/button";

export function WorkspaceIdentity() {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 px-1 pt-1">
      <BrandLockup markSize={38} compact />
      <div className="mt-0.5 shrink-0">
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-full ring-1 ring-border/80",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}
