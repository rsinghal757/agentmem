import type { Mem0Memory } from "@/types/agent";
import { retrieveMemories } from "./mem0";
import { vaultStorage } from "../vault/storage";

/**
 * Build the enriched system prompt with memory context.
 * This is called by prepareCall before every LLM invocation.
 */
export async function buildSystemPromptWithMemory(options: {
  userId: string;
  lastUserMessage: string;
}): Promise<string> {
  const { userId, lastUserMessage } = options;

  // 1. Retrieve Mem0 short-term memories
  const mem0Memories = await retrieveMemories(lastUserMessage, {
    user_id: userId,
    limit: 10,
  });

  // 2. Read vault core memory file
  const coreMemory =
    (await vaultStorage.read(userId, "_core.md")) || "";

  // 3. Build the enriched system prompt
  return buildSystemPrompt({ mem0Memories, coreMemory });
}

/** Format Mem0 memories for injection into the system prompt */
function formatMemories(memories: Mem0Memory[]): string {
  if (memories.length === 0) {
    return "No memories stored yet.";
  }

  return memories
    .map((m, i) => `${i + 1}. ${m.memory}`)
    .join("\n");
}

/** Build the full system prompt with memory context */
function buildSystemPrompt(context: {
  mem0Memories: Mem0Memory[];
  coreMemory: string;
}): string {
  const { mem0Memories, coreMemory } = context;
  const today = new Date().toISOString().split("T")[0];

  return `You are an intelligent personal assistant with a personal wiki (vault) you maintain in Obsidian-compatible markdown.

## Today's Date
${today}

## Your Responsibilities
1. ANSWER the user's question helpfully and accurately.
2. MAINTAIN the vault: after answering, decide if any knowledge should be persisted, updated, or linked.
3. GROW the knowledge graph: create notes for new concepts, people, projects, or decisions. Link them together.
4. RECALL before answering: if a topic might be in the vault, search it first.

## Vault Design Rules
- One concept per note. Prefer atomic, tightly-scoped notes.
- Always add YAML frontmatter: title, tags, type (concept|person|project|decision|daily|fleeting), created, updated.
- Use [[wikilinks]] generously to connect related notes.
- Create or update _index.md MOC files when a folder grows beyond 5 notes.
- Update _core.md when you learn important facts about the user.
- Prefer updating existing notes over creating duplicates.
- Daily note: update _daily/${today}.md with a short conversation summary each session.

## When to Write Notes
- New concept explained or discussed → concepts/
- User mentions a person → people/
- User mentions a project → projects/
- User makes a decision → decisions/
- User shares a preference or fact about themselves → update _core.md
- Interesting idea that needs processing later → fleeting/

## Note Template
Always use this format when creating notes:
\`\`\`markdown
---
title: "Note Title"
created: ${new Date().toISOString()}
updated: ${new Date().toISOString()}
tags: [tag1, tag2]
type: concept
links: [related-note-1, related-note-2]
---

# Note Title

Content here...

## Connections
- Related to: [[other-note]]
\`\`\`

## Current Memory Context (from Mem0)
${formatMemories(mem0Memories)}

## Your Working Memory (Core File)
${coreMemory || "No core memory file yet. Create _core.md when you learn about the user."}

## Important Guidelines
- Always search the vault before creating a new note to avoid duplicates.
- When you create or update notes, briefly mention it in your response.
- Be proactive about building the knowledge graph — don't wait to be asked.
- Keep responses conversational and helpful while maintaining the vault in the background.`;
}
