# Active Context: Obsidian Memory Agent

## Current State

**Project Status**: ✅ Core architecture implemented — Phases 1-5 complete

The project has been transformed from a minimal Next.js starter into a full Obsidian Memory Agent — a ChatGPT-style chat interface that autonomously builds and maintains an Obsidian-compatible markdown knowledge vault.

## Recently Completed


- [x] Styled reasoning parts with a distinct dashed purple treatment and "Reasoning" label so they are visually differentiated from normal text bubbles in chat messages (src/components/chat/Message.tsx)

- [x] Fixed chat history consistency for message UUID updates by snapshotting persisted message signatures, upserting message payloads on conflict, treating `parts` as hydration source-of-truth, and suppressing empty text bubbles while preserving tool parts; added regression coverage for multi-pass tool message updates (src/components/chat/ChatInterface.tsx, src/lib/chat/history-mapping.ts, src/app/api/chat/history/route.ts, src/components/chat/Message.tsx, src/lib/chat/history-mapping.test.ts)

- [x] Fixed thread reload hydration to preserve all persisted message segments (including assistant tool-call parts) by removing user/assistant-only persistence guards and centralizing history mapping/persistence logic with regression tests (src/components/chat/ChatInterface.tsx, src/lib/chat/history-mapping.ts, src/lib/chat/history-mapping.test.ts)

- [x] Persisted full AI SDK message parts (including tool call UI parts) in chat history and restored them on reload so tool badges like "Wrote note" remain visible after returning to a thread (src/components/chat/ChatInterface.tsx, src/app/api/chat/history/route.ts, src/db/schema.ts, src/db/index.ts, src/db/migrations/0002_tool_parts_persistence.sql)

- [x] Made chat history mobile-collapsible: converted thread list into a slide-in sidepanel on small screens with overlay dismissal, dedicated History trigger, and auto-close on thread selection/new thread (src/components/chat/ChatInterface.tsx)

- [x] Added resilient DB schema bootstrap fallback in `getDb()` so tables/indexes are created automatically when Drizzle file-based migrations cannot run in deployed/serverless environments; includes threaded history backfill defaults and vault uniqueness index (src/db/index.ts)

- [x] Fixed async DB typing in chat history/threads API routes by awaiting `getDb()` and updating `ensureThread` to use awaited DB type; resolves Next.js/TypeScript build failure on `db.insert/select/update/delete` calls (src/app/api/chat/history/route.ts, src/app/api/chat/threads/route.ts)
- [x] Implemented end-to-end threaded chat persistence: unified user/thread context, idempotent message UUID history writes, new thread listing API, and chat sidebar thread switching with thread-scoped clear actions (src/app/api/chat/route.ts, src/app/api/chat/history/route.ts, src/app/api/chat/threads/route.ts, src/components/chat/ChatInterface.tsx, src/db/schema.ts)
- [x] Canonicalized vault note paths and write semantics: added `(user_id, path)` uniqueness, atomic upsert writes, `.md` path normalization shared across storage/tools/files API to ensure explorer/search/graph visibility (src/lib/vault/paths.ts, src/lib/vault/storage.ts, src/lib/vault/tools.ts, src/app/api/vault/files/route.ts, src/db/schema.ts)
- [x] Added migration/backfill for threaded chat + message UUIDs and vault path normalization/deduplication with new uniqueness indexes (src/db/migrations/0001_threaded_history_and_vault_upsert.sql)
- [x] Added chat history persistence with PostgreSQL database (src/app/api/chat/history/route.ts, src/db/schema.ts)
- [x] Added .env.example with required environment variables (DATABASE_URL, OPENAI_API_KEY, MEM0_API_KEY)
- [x] Switched from SQLite to PostgreSQL with Railway (drizzle-orm + postgres-js)
- [x] Replaced filesystem-based LocalVaultStorage with database-backed DatabaseVaultStorage (src/lib/vault/storage.ts)
- [x] Hardened `vault_write` tool error handling to return structured `{ success: false, error }` payloads on storage failures instead of throwing (src/lib/vault/tools.ts)
- [x] Updated `ToolCallBadge` to show failure labels (e.g., "Write failed") when tool result indicates `success: false` (src/components/chat/ToolCallBadge.tsx)
- [x] Redesigned the full UI visual language to a restrained premium style using a strict off-white/green palette, refined spacing, subtle borders/shadows, and calmer typography without changing behavior (chat, vault explorer, note viewer, graph, and bottom navigation)
- [x] Installed all dependencies: AI SDK 6, @ai-sdk/openai, @ai-sdk/react, mem0ai, d3, gray-matter, zod, swr, lucide-react, clsx, tailwind-merge
- [x] Created TypeScript types for vault and agent (src/types/)
- [x] Implemented vault storage abstraction with LocalVaultStorage (src/lib/vault/storage.ts)
- [x] Implemented markdown utilities: frontmatter parsing, wikilink extraction, word counting (src/lib/vault/markdown.ts)
- [x] Implemented vault graph builder from wikilinks (src/lib/vault/graph.ts)
- [x] Implemented full-text vault search (src/lib/vault/search.ts)
- [x] Implemented all 6 vault tools: vault_read, vault_write, vault_search, vault_list, vault_link, vault_delete (src/lib/vault/tools.ts)
- [x] Integrated Mem0 for semantic short-term memory (src/lib/memory/mem0.ts)
- [x] Built memory injection system for system prompt enrichment (src/lib/memory/injection.ts)
- [x] Created ToolLoopAgent factory with prepareCall memory injection (src/lib/agent/agent.ts)
- [x] Created API route: /api/chat with createAgentUIStreamResponse (src/app/api/chat/route.ts)
- [x] Created API routes: /api/vault/files, /api/vault/search, /api/vault/graph, /api/memory
- [x] Built chat UI: ChatInterface with useChat, Message with tool call rendering, ToolCallBadge
- [x] Built vault UI: FileTree, NoteViewer with wikilink resolution, GraphView with D3 force simulation
- [x] Built layout: Header with navigation, collapsible Sidebar with VaultActivityFeed
- [x] Created all pages: home (chat), /vault (explorer), /vault/[...path] (note viewer), /vault/graph (D3 graph)
- [x] Created hooks: useVaultFiles, useVaultGraph, useVaultSearch
- [x] TypeScript strict mode: zero errors
- [x] ESLint: zero errors, zero warnings
- [x] Committed and pushed

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Chat page with sidebar | ✅ Ready |
| `src/app/layout.tsx` | Root layout with Header | ✅ Ready |
| `src/app/vault/` | Vault explorer, note viewer, graph | ✅ Ready |
| `src/app/api/chat/` | ToolLoopAgent streaming endpoint | ✅ Ready |
| `src/app/api/vault/` | Vault CRUD + search + graph APIs | ✅ Ready |
| `src/app/api/memory/` | Mem0 memory retrieval | ✅ Ready |
| `src/components/chat/` | ChatInterface, Message, ToolCallBadge, VaultActivityFeed | ✅ Ready |
| `src/components/vault/` | FileTree, NoteViewer, GraphView | ✅ Ready |
| `src/components/layout/` | Header, Sidebar | ✅ Ready |
| `src/lib/vault/` | Storage, tools, markdown, graph, search | ✅ Ready |
| `src/lib/memory/` | Mem0 client, memory injection | ✅ Ready |
| `src/lib/agent/` | ToolLoopAgent factory | ✅ Ready |
| `src/hooks/` | useVaultFiles, useVaultGraph, useVaultSearch | ✅ Ready |
| `src/types/` | TypeScript types for vault and agent | ✅ Ready |

## Architecture Highlights

- **AI SDK 6**: Uses `ToolLoopAgent` with `prepareCall` for dynamic system prompt injection
- **Dual-track memory**: Mem0 for semantic short-term + vault database for structured long-term
- **Chat history**: PostgreSQL-persisted conversation history with clear chat option
- **6 vault tools**: read, write, search, list, link, delete — all with zod/v4 schemas
- **D3 force graph**: Interactive visualization of vault wikilink connections
- **Local dev**: Vault stored in database (SQLite via @kilocode/app-builder-db)

## To Run

1. Copy `.env.example` to `.env.local`
2. Add `DATABASE_URL` (PostgreSQL), `OPENAI_API_KEY` and optionally `MEM0_API_KEY`
3. `bun install && bun run build && bun start`

## Pending Improvements

- [ ] Add Vercel Blob storage for production vault
- [ ] Add pgvector semantic search
- [ ] Add authentication (Auth.js)
- [ ] Add note editor (manual editing)
- [ ] Add rate limiting
- [ ] Deploy to Vercel

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-25 | Full Obsidian Memory Agent implementation: AI SDK 6 ToolLoopAgent, 6 vault tools, Mem0 memory, chat UI, vault explorer, D3 graph, all API routes. Zero TS errors, zero lint warnings. |

| 2026-02-25 | Improved vault write failure handling: `vault_write` now returns structured error payloads on failure and UI badge now labels failed writes explicitly. |
| 2026-02-25 | Applied comprehensive UI redesign to match a calm, precise, premium aesthetic: updated palette, typography rhythm, spacing, cards, controls, navigation, and graph visual treatment with no functional changes. |
| 2026-03-11 | Fixed build-blocking TypeScript errors in chat API routes by awaiting async `getDb()` in history/threads handlers and correcting `ensureThread` DB type annotation. |
| 2026-03-12 | Added migration fallback schema bootstrap in `src/db/index.ts` to auto-create required tables/indexes/backfills when migration journal execution fails, preventing missing-table issues without manual migrations. |

| 2026-03-12 | Added mobile chat history sidepanel behavior: thread list now collapses into an off-canvas panel with overlay and mobile toggle button. |
| 2026-03-12 | Fixed disappearing tool activity badges after reload by persisting and restoring full message `parts` in chat history storage. |
| 2026-03-12 | Fixed thread reopen regression where tool-call segments disappeared by persisting/hydrating all message roles/types via shared mapping helpers and regression tests. |
| 2026-03-12 | Fixed end-to-end chat history save/load consistency for repeated message UUID updates by using persisted payload signatures + conflict upserts and parts-first hydration/rendering guards. |
| 2026-03-12 | Differentiated reasoning vs normal chat message blocks in `Message` with distinct styling and a dedicated reasoning label. |

