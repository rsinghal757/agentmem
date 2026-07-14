import { ToolLoopAgent, stepCountIs } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { createVaultTools } from "../vault/tools";
import { buildVaultSystemPrompt } from "./system-prompt";

const MAX_STEPS = parseInt(process.env.MAX_VAULT_STEPS || "15", 10);
const MODEL_NAME = process.env.OPENAI_MODEL || "minimax/minimax-m2.5";

/** Create a vault-aware agent scoped to one authenticated user. */
export function createAgent(userId: string) {
  const model = openrouter(MODEL_NAME);

  return new ToolLoopAgent({
    id: "vault-agent",
    model,
    tools: createVaultTools(userId),
    stopWhen: stepCountIs(MAX_STEPS),
    prepareCall: async (options) => ({
      ...options,
      model,
      instructions: await buildVaultSystemPrompt(userId),
    }),
  });
}
