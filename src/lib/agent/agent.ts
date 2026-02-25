import { ToolLoopAgent, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { createVaultTools } from "../vault/tools";
import { buildSystemPromptWithMemory } from "../memory/injection";
import type { ModelMessage } from "ai";

const MAX_STEPS = parseInt(process.env.MAX_VAULT_STEPS || "15", 10);

// Use gpt-4o-mini for faster, cheaper responses
const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Create a ToolLoopAgent for a specific user.
 * The agent has access to vault tools and memory injection.
 */
export function createAgent(userId: string) {
  const tools = createVaultTools(userId);
  const model = openai(MODEL_NAME);

  return new ToolLoopAgent({
    id: "obsidian-memory-agent",
    model,
    tools,
    stopWhen: stepCountIs(MAX_STEPS),

    prepareCall: async (options) => {
      console.log("[Agent prepareCall] Called with options:", Object.keys(options));
      console.log("[Agent prepareCall] Has prompt:", 'prompt' in options);
      console.log("[Agent prepareCall] Has messages:", 'messages' in options);
      
      // Extract the last user message from prompt or messages
      const promptOrMessages = 'prompt' in options ? options.prompt : options.messages;
      let lastUserMessage = "";
      
      if (Array.isArray(promptOrMessages)) {
        lastUserMessage = getLastUserMessageFromArray(promptOrMessages);
      } else if (typeof promptOrMessages === 'string') {
        lastUserMessage = promptOrMessages;
      }
      
      console.log("[Agent prepareCall] Last user message:", lastUserMessage);

      // Build enriched system prompt with memory context
      const systemPrompt = await buildSystemPromptWithMemory({
        userId,
        lastUserMessage,
      });
      console.log("[Agent prepareCall] System prompt length:", systemPrompt.length);

      // Return the system prompt as instructions, keeping the original prompt intact
      // AI SDK v6 expects 'instructions' for system prompt
      return { 
        model, 
        instructions: systemPrompt,
      };
    },
  });
}

/** Extract the last user message text from the message array (for AI SDK v6 options) */
function getLastUserMessageFromArray(
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

/** Extract the last user message text from the message array */
function getLastUserMessage(
  messages: readonly ModelMessage[] | undefined,
): string {
  return getLastUserMessageFromArray(messages);
}
