# Zapier design system

Source: https://luongnv.com/sleek-ui/designs/zapier.json (version 1.0.0).

The Tailwind 4/shadcn semantic palette is defined in `src/app/globals.css` on
`:root` and `.dark`. Existing workspace surface aliases resolve to those tokens.
Dark is the source's default; the landing page and both workspace sidebars expose
a keyboard-accessible theme toggle. A saved choice is restored before rendering.

Inter and JetBrains Mono load through Google Fonts links in the shared root
layout, with local sans/monospace fallbacks; Georgia supplies the serif family.
Controls use the 6px default radius, cards the 8px large radius and source shadow.
Card sections retain shadcn's 24px padding, with existing compact layout overrides.

## Accessibility adaptations

- Keep the original orange primary fill, but use near-black foreground text
  instead of white to meet the source's 4.5:1 text contrast target.
- Use a darker orange `primary-text` token for links/icons on light surfaces.
  Filled controls continue using `primary` and `primary-foreground`.
- Darken light-mode muted text and adjust destructive fills for readable labels;
  use a separate light red `destructive-text` token for dark-mode error text.
- Inverted chat Markdown inherits the primary foreground, including muted copy.
- Replace white-only surfaces, green surface aliases, and graph label colors with
  semantic variables that respond to theme changes.
- Keyboard focus uses a 2px currentColor outline with 2px offset. Orange-filled
  controls add an orange halo so their dark outline remains visible on dark pages.
- Disable repeated CSS animation and effectively remove transitions when reduced
  motion is requested. The source defines no `tokens.motion` or `libraries`, so
  no animation packages or invented easing/keyframe mappings were added.

## Verification

TypeScript and ESLint pass. Next.js production compilation passes, but a full
production build requires the deployment's Clerk publishable key for prerendering.

All 30 semantic foreground/background combinations tested across light and dark
pass 4.5:1 WCAG contrast (minimum 4.76:1). The orange button pairing is 6.09:1.
The actual stylesheet also compiles through Tailwind/PostCSS in isolation.
Browser visual checks could not run: Playwright's Chromium download timed out.
Authenticated chat/vault flows and visual mobile/theme-toggle checks still need
verification in a configured preview before merging.
