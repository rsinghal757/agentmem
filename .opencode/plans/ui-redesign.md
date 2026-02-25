# UI Redesign Plan: Mobile-First, Sleek Light Mode

## Design Philosophy
- **Mobile-first**: Every decision optimized for a phone viewport
- **Light mode only**: Clean white background, no dark mode
- **Pantone-ish green accent**: Sophisticated muted green (`#6B8F71`) for active states, buttons, accents
- **No functionality changes**: Only reskinning CSS/Tailwind classes and restructuring layout (Header -> Bottom Tabs)

## Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FFFFFF` | Body, cards |
| Surface | `#F7F7F7` | Subtle card backgrounds |
| Border | `#E5E5E5` | Dividers, card borders |
| Text primary | `#1A1A1A` | Headings, body text |
| Text secondary | `#6B6B6B` | Subtext, timestamps |
| Text muted | `#999999` | Placeholders, disabled |
| Green accent | `#6B8F71` | Active tab, send button, links, tags |
| Green light | `#E8F0E9` | Active tab bg, hover states |
| Green dark | `#4A6B4F` | Button hover |
| Success | `#6B8F71` | Tool call success |
| Error | `#D94F4F` | Failure states |

## Files to Modify (15 files, form-only changes)

### 1. `src/app/globals.css`
- Remove `color-scheme: dark`
- Replace dark gradient background with plain `#FFFFFF`
- Add safe-area CSS custom properties for bottom tab bar

### 2. `src/app/layout.tsx`
- Remove `className="dark"` from `<html>`
- Body: `bg-white text-neutral-900` (was dark)
- Remove heavy card border/shadow wrapper — content goes edge-to-edge on mobile
- Restructure: content area (flex-1) + new BottomTabs at bottom
- Replace `<Header />` import with `<BottomTabs />`

### 3. `src/components/layout/Header.tsx` -> Refactored to bottom tab bar
- Move navigation from top to **fixed bottom tab bar**
- Remove logo/brand entirely (saves vertical space on mobile)
- Tab bar: `h-16`, white bg, `border-t border-gray-200`, safe-area bottom padding
- 3 equal tabs: icon (24px) + label (10px) stacked vertically
- Active: green icon + green text + green dot indicator
- Inactive: gray-400 icon + text
- Fix active-state bug (Vault and Graph both active on `/vault/graph`)

### 4. `src/app/page.tsx` (Chat)
- Remove `<Sidebar />` — doesn't work on mobile
- Full-width `<ChatInterface />`

### 5. `src/components/layout/Sidebar.tsx`
- Keep file but won't be rendered (or can be removed later)

### 6. `src/components/chat/ChatInterface.tsx`
- Remove dark gradients and violet shadows
- Empty state: white bg, subtle gray border
- Suggestion pills: `bg-gray-50 border-gray-200` -> hover: green tint
- Input: `bg-gray-50 border-gray-200 rounded-2xl`, focus ring green
- Send button: `bg-[#6B8F71] text-white rounded-xl` -> hover: `bg-[#4A6B4F]`
- Add bottom padding to account for bottom tab bar
- Loading spinner: green color

### 7. `src/components/chat/Message.tsx`
- User bubble: `bg-[#6B8F71] text-white rounded-2xl` (no border)
- Assistant bubble: `bg-gray-100 text-neutral-900 rounded-2xl` (no border)
- Assistant avatar: `bg-[#6B8F71]` with white letter
- User avatar: `bg-gray-200` with dark letter

### 8. `src/components/chat/ToolCallBadge.tsx`
- `bg-gray-50 border-gray-200 text-gray-700`
- Green/red success/error indicators

### 9. `src/components/chat/VaultActivityFeed.tsx`
- White bg, gray borders, gray text
- File icon: green instead of violet

### 10. `src/app/vault/page.tsx`
- Mobile: stack vertically (full-width file tree, no side-by-side)
- Remove fixed w-72 sidebar pattern
- Light theme colors

### 11. `src/components/vault/FileTree.tsx`
- White/gray bg, dark text
- File icons: green
- `hover:bg-gray-50`

### 12. `src/app/vault/graph/page.tsx`
- Light background passthrough

### 13. `src/components/vault/GraphView.tsx`
- SVG bg: `#FFFFFF` (was `#0a0a0a`)
- Link stroke: `#D1D5DB` (was `#374151`)
- Node stroke: `#FFFFFF` (was `#1f2937`)
- Label fill: `#6B6B6B` (was `#9ca3af`)
- Legend: white bg, gray border
- Keep TYPE_COLORS (they pop on white)

### 14. `src/components/vault/NoteViewer.tsx`
- Cards: `bg-white border-gray-200`
- Links: `text-[#6B8F71]` (was violet)
- Tags: `bg-green-50 text-green-700`
- Remove `prose-invert`

### 15. `src/app/vault/[...path]/page.tsx`
- `bg-white` (was `bg-neutral-950`)

## Implementation Order
1. globals.css (foundation)
2. layout.tsx (structure)
3. Header.tsx -> BottomTabs (navigation)
4. page.tsx home (remove sidebar)
5. ChatInterface.tsx (light chat)
6. Message.tsx (light messages)
7. ToolCallBadge.tsx (light badges)
8. VaultActivityFeed.tsx (light feed)
9. Vault page + FileTree (light + mobile)
10. GraphView (light graph)
11. NoteViewer + note page (light notes)
12. Final typecheck + lint

## Key Mobile UX Decisions
- **Bottom tabs**: thumb-reachable on phones
- **No sidebar** on chat: full-width content
- **Safe area padding**: respect notch/home indicator
- **Touch targets**: min 44px for interactive elements
- **Edge-to-edge content**: minimal wasted border/padding space
- **Vault page**: vertical stack, not horizontal split
