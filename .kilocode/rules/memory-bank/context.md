# Active Context: Obsidian Memory Agent

## Current State

**Project Status**: ✅ Core architecture implemented — Phases 1-5 complete

The project has been transformed from a minimal Next.js starter into a full Obsidian Memory Agent — a ChatGPT-style chat interface that autonomously builds and maintains an Obsidian-compatible markdown knowledge vault.

## Recently Completed

- [x] Applied a sleek visual refresh across chat, vault explorer, note viewer, graph, header, and sidebar with reusable Tailwind card/border/spacing patterns (form-only styling changes, no behavior changes).
- [x] Improved local vault storage to auto-resolve a writable base path and fall back to `/tmp/.vault` for Vercel/serverless read-only filesystems, preventing add-note write failures in production. (src/lib/vault/storage.ts)

- [x] Hardened `vault_write` tool error handling to return structured `{ success: false, error }` payloads on storage failures instead of throwing (src/lib/vault/tools.ts)
- [x] Updated `ToolCallBadge` to show failure labels (e.g., "Write failed") when tool result indicates `success: false` (src/components/chat/ToolCallBadge.tsx)
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
- **Dual-track memory**: Mem0 for semantic short-term + vault filesystem for structured long-term
- **6 vault tools**: read, write, search, list, link, delete — all with zod/v4 schemas
- **D3 force graph**: Interactive visualization of vault wikilink connections
- **Local dev**: Vault stored in `.vault/` directory (gitignored)

## To Run

1. Copy `.env.local.example` to `.env.local`
2. Add `OPENAI_API_KEY` and optionally `MEM0_API_KEY`
3. `bun install && bun dev`

## Pending Improvements

- [ ] Add Neon Postgres + Drizzle for production persistence
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
| 2026-02-25 | Added writable vault path fallback (`/tmp/.vault`) for Vercel/serverless environments so `vault_write` can persist notes instead of failing on read-only filesystem. |
| 2026-02-25 | UI polish pass: upgraded shell/header/chat/vault/graph styling with modern card surfaces, gradients, and refined spacing while keeping all functionality unchanged. |
