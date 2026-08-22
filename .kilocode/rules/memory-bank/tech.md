# Technical Context: GizzNote

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
| Fraunces     | Google  | Display / brand serif           |
| Geist        | Google  | UI sans and mono                |

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
- Brand tokens and display font live in `src/app/globals.css`

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

## File Structure

```
/
├── .gitignore
├── package.json
├── bun.lock
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── src/
    ├── app/
    ├── components/brand/
    ├── components/landing/
    ├── components/ui/
    ├── components/chat/
    ├── components/vault/
    ├── components/layout/
    ├── db/
    └── lib/
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

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

- None required for base template
- Add as needed for features
- Use `.env.local` for local development
