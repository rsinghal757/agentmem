import { NextResponse } from "next/server";
import { createAgentUIStreamResponse } from "ai";
import { createAgent } from "@/lib/agent/agent";
import { addMemories } from "@/lib/memory/mem0";
import { requireUserId } from "@/lib/auth";
import { scopeThreadId } from "@/lib/utils";

export async function POST(request: Request) {
  console.log("[Chat API] Received request");
  const { messages, threadId } = await request.json();
  console.log("[Chat API] Messages:", JSON.stringify(messages, null, 2));

  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedThreadId = scopeThreadId(userId, threadId);
  console.log("[Chat API] User ID:", userId, "Thread:", resolvedThreadId);
  const agent = createAgent(userId);

  const lastUserMsg = messages[messages.length - 1];
  const lastUserMessage =
    typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : Array.isArray(lastUserMsg?.content)
        ? lastUserMsg.content
            .filter((p: { type: string }) => p.type === "text")
            .map((p: { text: string }) => p.text)
            .join(" ")
        : "";

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      const lastAssistant = [...finalMessages]
        .reverse()
        .find((m) => m.role === "assistant");
      const assistantText =
        lastAssistant?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => ("text" in p ? p.text : ""))
          .join(" ") || "";

      if (lastUserMessage && assistantText) {
        addMemories(
          [
            { role: "user", content: lastUserMessage },
            { role: "assistant", content: assistantText },
          ],
          { user_id: userId },
        ).catch((err: unknown) => {
          console.error("[Chat] Error saving memories:", err);
        });
      }
    },
  });
}
