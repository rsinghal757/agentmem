# Project Brief: 0xMem

## Purpose

0xMem is a personal research and writing workspace where an AI assistant can converse with the user while reading, creating, editing, and connecting an Obsidian-compatible markdown vault.

## Target Users

- Researchers and writers who want dialogue and durable notes in one workflow
- Builders maintaining a personal knowledge graph in portable markdown
- Users who want AI assistance grounded in a knowledge base they own

## Core Use Case

The user asks a question or develops an idea in chat. The agent searches relevant vault notes, answers with context, and deliberately maintains useful knowledge as atomic markdown notes and wikilinks. The user can inspect and edit every note or explore connections in the graph.

## Key Requirements

### Must Have

- Streaming, threaded AI chat with persisted message history
- User-owned markdown vault with create, read, update, search, list, link, and delete tools
- Vault-aware agent context without an external memory service
- File explorer, WYSIWYG/markdown note editor, and interactive knowledge graph
- Clerk-authenticated, per-user data isolation
- Responsive, polished UI built from the shared shadcn-style component layer
- PostgreSQL persistence and deployable Next.js production build

### Nice to Have

- Semantic retrieval over the vault
- Rate limiting and usage controls
- Export/import workflows for external markdown vaults

## Success Metrics

- The user can move from conversation to durable, linked knowledge without changing tools
- Notes remain readable and portable outside 0xMem
- TypeScript, ESLint, regression tests, and production build remain green

## Constraints

- The markdown vault is the sole source of long-term memory
- Avoid hidden third-party fact extraction or memory stores
- Framework: Next.js 16, React 19, Tailwind CSS 4, AI SDK 6
- Package manager/runtime: Bun in deployment
