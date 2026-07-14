import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";
import { createAgent } from "@/lib/agent/agent";
import { requireUserId } from "@/lib/auth";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return createAgentUIStreamResponse({
    agent: createAgent(userId),
    uiMessages: messages,
  });
}
