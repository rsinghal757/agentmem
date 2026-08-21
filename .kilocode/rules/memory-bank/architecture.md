# System Patterns: GizzNote

## Current Architecture

- The App Router owns the signed-out landing page, authenticated chat workspace, vault routes, and route handlers.
- `ToolLoopAgent` is created per authenticated user. `prepareCall` injects `_core.md`; the agent searches and updates all other context through explicit vault tools.
- PostgreSQL is the source of truth for markdown notes, chat threads, and message parts. Drizzle migrations and a runtime bootstrap fallback keep deployed schemas compatible.
- Chat history persistence is separate from model streaming: UI message parts are streamed through AI SDK and upserted through `/api/chat/history`.
- Brand primitives live in `src/components/brand` (mark, lockup, workspace identity). Active controls use the shadcn-style primitives in `src/components/ui`; product composition lives in `chat`, `vault`, `landing`, and `layout` component folders.
- The knowledge graph is derived from parsed markdown frontmatter and wikilinks, then rendered client-side with D3.

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + metadata + display font
│   ├── page.tsx            # Auth-gated home
│   ├── globals.css         # Brand tokens + Tailwind
│   └── icon.svg            # Folio mark favicon
├── components/
│   ├── brand/              # BrandMark, BrandLockup, WorkspaceIdentity
│   ├── landing/            # Signed-out editorial landing
│   ├── ui/                 # Shared primitives
│   ├── chat/               # Chat workspace
│   ├── vault/              # Notes, files, graph
│   └── layout/             # Sidebars and navigation
├── lib/                    # Agent, auth, vault, chat helpers
└── db/                     # Drizzle schema + client
```

## Key Design Patterns

### 1. App Router Pattern

Uses Next.js App Router with file-based routing.

### 2. Component Organization Pattern

```
src/components/
├── brand/             # Identity primitives
├── landing/           # Marketing / signed-out studio
├── ui/                # Reusable UI components
├── layout/            # Sidebars and navigation
├── chat/              # Chat workspace
└── vault/             # Notes, files, graph
```

### 3. Server Components by Default

All components are Server Components unless marked with `"use client"`.

### 4. Brand token pattern

Visual identity is encoded as CSS custom properties in `src/app/globals.css` (`--wash-*`, `--radius-panel`, `--font-display`) and reused across landing and product chrome.
