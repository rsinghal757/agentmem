import { ToolLoopAgent, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { createVaultTools } from "../vault/tools";
import { buildSystemPromptWithMemory } from "../memory/injection";
import type { ModelMessage } from "ai";

const MAX_STEPS = parseInt(process.env.MAX_VAULT_STEPS || "15", 10);

/**
 * Create a ToolLoopAgent for a specific user.
 * The agent has access to vault tools and memory injection.
 */
export function createAgent(userId: string) {
  const tools = createVaultTools(userId);
  const model = openai("gpt-4o");

  return new ToolLoopAgent({
    id: "obsidian-memory-agent",
    model,
    tools,
    stopWhen: stepCountIs(MAX_STEPS),

    prepareCall: async ({ messages }) => {
      // Extract the last user message for memory retrieval
      const lastUserMessage = getLastUserMessage(messages);

      // Build enriched system prompt with memory context
      const instructions = await buildSystemPromptWithMemory({
        userId,
        lastUserMessage,
      });

      return { model, instructions };
    },
  });
}

/** Extract the last user message text from the message array */
function getLastUserMessage(
  messages: readonly ModelMessage[] | undefined,
): string {
  if (!messages) return "";

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        return msg.content;
      }
      if (Array.isArray(msg.content)) {
        const textPart = msg.content.find(
          (p) => "type" in p && p.type === "text",
        );
        if (textPart && "text" in textPart) {
          return textPart.text;
        }
      }
    }
  }

  return "";
}
