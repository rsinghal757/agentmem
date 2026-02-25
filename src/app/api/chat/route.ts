import { createAgentUIStreamResponse } from "ai";
import { createAgent } from "@/lib/agent/agent";
import { addMemories } from "@/lib/memory/mem0";
import { getUserId } from "@/lib/utils";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const userId = getUserId();
  const agent = createAgent(userId);

  // Extract the last user message for post-response memory save
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
      // Find the last assistant message text
      const lastAssistant = [...finalMessages]
        .reverse()
        .find((m) => m.role === "assistant");
      const assistantText = lastAssistant?.parts
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
