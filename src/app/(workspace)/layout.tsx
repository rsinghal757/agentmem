"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from "@clerk/nextjs";
import { Landing } from "@/components/workspace/Landing";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

/**
 * Holds the workspace chrome for every signed-in route, so the notes rail and
 * the agent dock survive navigation between the desk, a note, and the graph.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-faint)]">
          Opening your desk…
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <WorkspaceShell>{children}</WorkspaceShell>
        </SignedIn>
        <SignedOut>
          <Landing />
        </SignedOut>
      </ClerkLoaded>
    </>
  );
}
