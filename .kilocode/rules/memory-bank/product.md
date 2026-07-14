# Product Context: 0xMem

## Why It Exists

Chat is good for developing ideas; markdown is good for keeping them. Most AI tools separate the conversation from the user's durable knowledge. 0xMem makes them one continuous system: the assistant works directly with a transparent vault the user can read, edit, link, and take elsewhere.

## Problems It Solves

1. **Ephemeral conversations**: useful conclusions become durable notes.
2. **Scattered research**: vault search and synthesis bring relevant context into the current question.
3. **Disconnected notes**: wikilinks and the graph expose relationships across projects and concepts.
4. **Opaque AI memory**: long-term context lives in user-visible markdown, not an external memory service.
5. **Tool switching**: chat, curation, editing, and graph exploration share one workspace.

## Primary User Flow

1. Sign in and start or reopen a conversation.
2. Ask a question, request synthesis, or develop a draft.
3. The agent searches/reads relevant vault material and answers.
4. When worthwhile, the agent updates atomic notes, `_core.md`, daily notes, and wikilinks.
5. The user opens the Vault to inspect or edit markdown.
6. The user opens Graph to discover and navigate connections.

## Experience Goals

- **Calm and editorial**: dense knowledge work without dashboard noise.
- **Transparent**: tool activity and note changes are visible.
- **Owned**: markdown remains the canonical knowledge format.
- **Fast to navigate**: chat threads, files, and graph share consistent responsive navigation.
- **Precise**: shadcn primitives and semantic tokens keep interactions and states consistent.

## Product Surfaces

- **Chat**: thread history, streaming answers, reasoning disclosures, vault tool activity, composer.
- **Vault**: file creation, hierarchical browsing, note metadata, visual/markdown editing, wikilink navigation.
- **Graph**: force-directed visualization derived from note links and metadata.
- **Landing**: concise signed-out explanation and Clerk sign-in/sign-up entry points.

## Integration Points

- PostgreSQL + Drizzle for chat and vault persistence
- Clerk for authentication and user scoping
- OpenRouter through AI SDK for the agent model
- shadcn-style primitives + Tailwind CSS 4 tokens for UI composition
