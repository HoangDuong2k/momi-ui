# momi-ui — working on the library

momi-ui is a **general-purpose** React 19 component library (Tailwind CSS v4 + Radix). Several apps use it, and requests often come from one of them. Build only what helps apps in general, with generic names, defaults, docs and demos; leave app-specific layouts, labels and workarounds to the app, and say so when you skip something. App planning docs don't belong in this repo.

## Commands

Tests need Node ≥ 22.12 (`.nvmrc` pins 24; `nvm use` first).

- `npm run check` — run before committing: typecheck (including the skill's examples), lint, prettier, `skill:check`, tests.
- `npm run dev` — playground at http://localhost:5173 (one page per component, EN/VI and theme switches).
- `npm run build` — library to `dist/` (`MOMI_FORCE_BUILD=1` makes `prepare` rebuild too); `npm run build:playground`.
- `npm run skill:refs` — regenerate `skills/momi-ui/references/components.md` after any public API change.

## Conventions

The README's "Quy ước API" section is the contract; in short:

- `value` / `defaultValue` / `onValueChange` (+ `onValueCommit` for drag controls), `open` / `onOpenChange`, `size` (`xs`–`lg`, via `useDefaultSize` / `DensityProvider`), `variant`, `tone`, `asChild`, `className` merged last with `cn`.
- Every root element has `data-slot`. Overlays take `container` / `collisionBoundary` / `collisionPadding` and respect `PortalProvider`.
- Built-in text goes through i18n: add the strings to `src/i18n/messages.ts`, `en.ts` and `vi.ts`, read them with `useMessages(group, labels)`, and offer a `labels` prop. Dates, times and numbers use the `locale` from `useLocale()`.
- Tailwind classes must be literal strings (no `` `bg-${tone}` ``); use lookup maps or CSS variables.
- Keyboard, screen-reader announcements, touch, RTL and dark mode are part of "done" for interactive components.

## Adding or changing a component

1. `src/components/<name>.tsx`, exported from `src/index.ts` (types too).
2. Tests in `src/components/__tests__/` (Vitest + Testing Library, jsdom: mock `getBoundingClientRect` for layout).
3. A playground page: `playground/demos/<name>.tsx`, registered in `playground/registry.ts`.
4. README (Vietnamese) and an entry under the next version in `CHANGELOG.md`.
5. The agent skill in `skills/momi-ui/`: `npm run skill:refs`; update `SKILL.md` if a convention, setup step or pitfall changed; keep `examples/*.tsx` compiling (they import `momi-ui`, mapped to `src/` by `tsconfig.skill.json`).

## Releasing

Follow the README's "Phát hành" section: regenerate the skill reference, `npm run check`, bump the version, move CHANGELOG's entries under the new version, commit, tag `vX.Y.Z`, and ask before pushing.
