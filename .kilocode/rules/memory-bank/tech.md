# Technical Context: Obsidian Memory Agent

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Bun          | Latest  | Package manager & runtime       |
| PostgreSQL   | 16+     | Vault and chat persistence       |
| Drizzle ORM  | 0.45.x  | Database ORM                    |
| shadcn/ui    | New York | Reusable UI primitives          |
| Clerk        | 6.x     | Authentication                  |
| AI SDK       | 6.x     | Agent loop and streaming chat   |

## Database

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Vault notes table schema |
| `src/db/index.ts` | Database client |
| `src/db/migrate.ts` | Migration runner |
| `drizzle.config.ts` | Drizzle configuration |

## Development Environment

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 20+ (for compatibility)

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
```

## Project Configuration

### Next.js Config (`next.config.ts`)

- App Router enabled
- Default settings for flexibility

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext

### Tailwind CSS 4 (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- CSS-first configuration (v4 style)

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

## Key Dependencies

### Production Dependencies

```json
{
  "next": "^16.1.3", // Framework
  "react": "^19.2.3", // UI library
  "react-dom": "^19.2.3", // React DOM
  "ai": "^6.0.99", // ToolLoopAgent + streaming
  "@clerk/nextjs": "^6.24.0", // Authentication
  "drizzle-orm": "^0.45.1", // PostgreSQL ORM
  "d3": "^7.9.0" // Knowledge graph
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## File Structure

```
/
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── bun.lock                # Bun lockfile
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS (Tailwind) config
├── eslint.config.mjs       # ESLint configuration
└── src/
    ├── app/                # Pages, layouts, API routes
    ├── components/ui/      # shadcn-style primitives
    ├── components/chat/    # Streaming chat surface
    ├── components/vault/   # File tree, editor, graph
    ├── db/                 # Drizzle schema + migrations
    └── lib/                # Agent, auth, chat, vault logic
```

## Technical Constraints

### Runtime configuration

- `DATABASE_URL` for PostgreSQL
- `OPENROUTER_API_KEY` for the model provider
- Clerk publishable/secret keys for authenticated use
- The app has no third-party memory service or memory API key

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

### Image Optimization

- Use Next.js `Image` component for optimization
- Place images in `public/` directory

### Bundle Size

- Tree-shaking enabled by default
- Tailwind CSS purges unused styles

### Core Web Vitals

- Server Components reduce client JavaScript
- Streaming and Suspense for better UX

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

- None required for base template
- Add as needed for features
- Use `.env.local` for local development
