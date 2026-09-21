# GizzNote design system

The workspace is a place to read and write, so the design gets out of the way:
warm paper neutrals, one accent, shallow shadows, and generous measure. Tokens
live in `src/app/globals.css` — `:root` for light, `[data-theme="dark"]` for
dark — and are exposed to Tailwind through `@theme inline`.

Dark mode keys off a `data-theme` attribute on `<html>` rather than a class, set
by `ThemeScript` before first paint so the page never flashes the wrong theme.
`ThemeToggle` flips the attribute and stores the choice in `localStorage`.

## Palette

The page is never pure white. The workspace sits on cream and only the document
card is `#ffffff`, so the note the writer is working on is always the brightest
object on screen. Surfaces step down from `--card` through `--canvas`,
`--surface-rail` and `--surface-sunken`.

Text runs through four weights of the same warm brown rather than opacity:
`--text-strong` for headings, `--text` for body, `--text-muted` for secondary
chrome, `--text-faint` for the quietest metadata.

One accent, a low-chroma azure (`--azure`), carries links, focus rings, the
active rail item and the primary button. `--brand-tint` and `--brand-wash` are
its two backgrounds, used for the active navigation state and the user's own
chat bubbles.

## Typography

| Role | Family | Used for |
| --- | --- | --- |
| Sans | Inter (`--font-sans`) | All UI chrome: rails, toolbars, metadata |
| Serif | Source Serif 4 (`--font-serif`) | Note bodies and document headings |
| Mono | Source Code Pro (`--font-mono`) | Paths, code, frontmatter values |

Fonts load through `next/font/google` in the root layout, which self-hosts them
and avoids a render-blocking stylesheet. Note bodies are capped at `--measure`
(46rem) so lines stay in a readable range regardless of viewport width.

## Geometry and elevation

Four radii, scaled to the size of the thing they round: `--radius-control` (6px)
for buttons and inputs, `--radius-card` (12px), `--radius-panel` (16px) and
`--radius-frame` (22px) for the document card. The `sq-*` utility classes apply
them.

Shadows are deliberately shallow and tinted with the warm neutral rather than
pure black, so elevation reads as paper lifting rather than a drop shadow.
`--shadow-control` is nearly invisible by design; `--shadow-hero` is reserved
for the landing page's product frame.

## Shell metrics

The three-pane layout is driven by `--topbar-height`, `--rail-width` and
`--dock-width`, exposed to Tailwind as `spacing-topbar`, `spacing-rail` and
`spacing-dock`. Both side panes collapse to off-canvas overlays on narrow
viewports; `WorkspaceShell` owns that state so it survives navigation between
the Desk, a note and the graph.

## Accessibility

- Focus is a 2px `--ring` outline with a 2px offset, applied through the
  `focus-ring` utility and by Typeset for prose links.
- Text pairings target 4.5:1. The azure accent is deliberately low-chroma and
  dark enough (`--azure-deep`) to carry link text on light surfaces.
- The graph's node fills are the only place colour alone conveys type, so every
  node also carries its title as a label and a `<title>` tooltip.
- Reduced-motion preferences remove transitions and repeated animation.
