# Changelog

## 0.4.0 — 2026-10-08

### Added

- **ParticleWave**: a WebGL ribbon of thousands of glowing particles that curves (`smile` · `arch` · `flat`), twists and ripples, anchored below an element (`anchor`) or placed with `origin`; particles part around the pointer and a press sends a ripple. `colors` take any CSS color including theme variables; `scale`, `thickness`, `twist`, `speed`, `density`, `glow`, `backdrop`.
- **Fireflies**: drifting, blinking specks, one swarm per color at its own depth, curious about the pointer, with parallax.
- **ParticleImage**: an image (or text) built from thousands of particles with relief that turns gently towards the pointer like a sculpture; particles by the cursor drift aside, a press sends a ripple, and they gather from a cloud when first shown.
- **HalftoneImage**: an image (or text) as a halftone grid of dots sized by its tones; dots around the pointer take the accent color and grow.
- **PixelTrail**: an image that breaks into vivid pixel blocks along the pointer's path (glowing through a heat ramp as they fade), or a pixel trail on its own.
- **LightBeams**: soft beams of light drifting slowly, no pointer needed (shader at half resolution).
- **DustMotes**: dust drifting through a lamp beam that turns towards the pointer; the pointer stirs the dust.
- All effects pause off screen and in hidden tabs, cap at 60 fps and drop to 30 fps (and lose the glow) on slow devices, use fewer particles on narrow screens, show a still frame with reduced motion (also when the setting changes live), switch between additive and normal blending from the background behind them (`blend="auto"`) and follow theme changes. New playground page "Particle Effects".

## 0.3.1 — 2026-10-06

### Added

- **Agent skill** shipped in the package (`skills/momi-ui/`): setup, conventions, pitfalls, type-checked example screens and a component reference generated from the source. `npx momi-ui link-skill` links it into a project for Claude Code, Codex, Copilot and Cursor; it always matches the installed version.
- **useShortcut(shortcut, callback, options)**: shortcuts matched exactly as written, including single keys such as `N` or `?`, ignored while typing in a field (unless they use Ctrl/⌘/Alt), on handled keys and on key repeat; `enabled`, `whileTyping`, `repeat`, `preventDefault`.
- **ToggleGroup** inside a `FormField` takes the field's label, description, error and disabled state, like `RadioGroup`.

### Fixed

- Calendar and date pickers: weekday headers were cut to two letters, so Vietnamese showed "Th" for six days (and Arabic, Hebrew, Thai broke the same way). Headers now use the locale's narrow names when they tell the days apart ("T2"…"CN"), otherwise two letters as before.
- EventCalendar week and day views fit narrow containers: day headers stack, the hour column and its labels slim down, events keep less space on the right. Month headers use the same short weekday names when narrow.
- EventCalendar agenda: long titles are cut with "…" instead of pushing the row out; in a narrow calendar the time sits on its own line. Rows follow the calendar's width, not the window's.
- Combobox (multiple): the search clears after picking an option, so the next search starts afresh.

## 0.3.0 — 2026-10-05

### Added

- **PortalProvider**: one place to set where overlays mount (`container`, a shadow root works too) and what they must stay inside (`collisionBoundary`, `collisionPadding`) — for UIs embedded in part of a page. Every overlay follows it: Popover, DropdownMenu and ContextMenu (and submenus), Select, HoverCard, Tooltip, Combobox, DatePicker, ColorPicker, Dialog, AlertDialog, Drawer, Lightbox, CommandDialog and the Kanban / SortableList drag previews. Components take `container` / `collisionBoundary` / `collisionPadding` props that win over the provider; nested providers override only what they set. New playground page "Embedded in a container".
- **suspendTransitions()** / **withoutTransitions(fn)** and the `momi-instant` class: switch colors instantly when the theme changes outside `ThemeProvider`.
- **Kanban** `columnWidth="fill"` (columns share the width) with `minColumnWidth`.
- **Drawer** `closeOnInteractOutside` for non-modal drawers (`<Drawer modal={false}>`: no overlay, no focus trap) and a `container` prop.
- **EventCalendar**: month, week, day and agenda views of events. Drag to move, drag an edge to resize, or move with the keyboard (with screen-reader announcements); `canChange` and per-event `editable` rules; click or drag over empty time to create (`onSelectRange`); timed events dropped on the all-day lane become all-day and back; overlapping events share columns; "+N more" when a day is full; `onRangeChange` for loading; `renderEvent`, `toolbarActions`, `renderToolbar`; any locale with 12/24-hour times, `weekStartsOn`, working hours (`dayStartHour` / `dayEndHour`).
- **DateTimePicker** and **DateTimePickerPanel**: date plus optional time (`{ date, time }`, `time: null` = all day), app-defined presets, free-typed times, suggested times, an all-day toggle and locale-aware 12/24-hour display.
- **DatePickerPanel** and **DateRangePickerPanel** (the calendar body without a trigger) and `presets` on `DatePicker` / `DateRangePicker`.
- **parseTime(text, locale?)** reads "830", "8h30", "20.00", "8 pm", "12am", "8:30 CH" — and whatever **formatTime(time, locale?)** shows in that locale (day periods before or after the time, native digits) — into "HH:mm".
- **Combobox**: `onCreate` adds options that aren't in the list (diacritics-insensitive exact match, async-safe, selected right away); `renderOption` and `renderChip` customize rows and chips; Backspace in an empty search removes the last selected value (ignoring key auto-repeat). Values picked while an async `onCreate` is pending are kept.

### Changed

- Dialog, Drawer and the toast stack are sized against their containing block (`%`) instead of the window height (`dvh`); without a containing block the result is the same.
- Drag previews (Kanban, SortableList) subtract the offset of their portal container, so they stay under the pointer inside a transformed or contained element.
- Combobox, DatePicker and ColorPicker popups are never taller than the space available; their content scrolls.
- Left/right drawers stretch with `inset-y-0` only (no `h-full`), so offsetting an edge with `style` (e.g. `top: 48`) keeps the bottom in place.
- **Command** (and so Combobox and CommandDialog) highlights the best match until the user moves — an exact match on the label, then labels starting with the search, then the rest — so the highlighted row and Enter always agree. Previously the first listed match was highlighted.
- Drag previews re-measure their origin when anything scrolls mid-drag and account for a scaled container.
- `suspendTransitions` leaves a `momi-instant` class that the app put on `<html>` itself.
- `ThemeProvider` suspends transitions with the `momi-instant` class instead of injecting a `<style>` element (works under a strict CSP).

## 0.2.1 — 2026-10-05

### Fixed

- **DropdownMenu**: pressing the trigger again while the menu is still animating closed (e.g. right after picking an item) now reopens it. A press on the menu's own trigger is no longer treated as an outside press by the closing content.
- **Toast**: Escape no longer gets stuck on notifications. Toasts used to be Radix dismissable layers, so a toast shown while a dialog, popover or menu was open took Escape away from it. Toasts are now plain items in the Radix viewport (still a layer _branch_, so pressing a toast doesn't dismiss the dialog behind it); Escape closes a toast only when focus is inside it.
- **Toast**: the "Clear all" button works over an open modal dialog without closing it, and toasts use the full width of the stack (up to 352px instead of shrinking to their text).

## 0.2.0 — 2026-10-05

### Added

- **Distribution**: install from another project with `file:../momi-ui` (`npm run dev:lib` rebuilds `dist/` on every change) or from a git tag (`prepare` builds on install when `dist/` is missing). README explains how to keep legacy CSS in a cascade layer.
- **Kanban**: columns + cards with drag and drop (mouse, touch press-and-hold, keyboard), screen-reader announcements, `canMove` workflow rules, soft WIP limits, collapsible columns, add-card button, column actions, auto-scroll and a read-only mode. `moveKanbanItem()` helper.
- **SortableList** + `SortableHandle`: drag-to-reorder with mouse, touch, handle or keyboard, drop line, auto-scroll and announcements — on the drag engine now shared with Kanban. Same API shape as Kanban: `value` / `defaultValue` / `onValueChange`, `onReorder({ item, itemId, from, to })`, `getItemId`, `getItemLabel`.
- **Internationalization**: `LocaleProvider` (`locale` for dates/numbers, partial `messages` merged over the parent), built-in `en` and `vi` packs, `useMessages`, `useLocale`, `mergeMessages` and the `MomiMessages` type; `labels` prop on components with built-in text; `closeLabel` on DialogContent, DrawerContent and Alert.
- **Density**: `size="xs"` (24px) on Button, IconButton, Input, Select, NativeSelect, Combobox, DatePicker, Tabs, Badge, Switch, Checkbox, Slider; `DensityProvider density="compact"` sets the default size of controls inside it.
- **ColorPicker** (field or swatch trigger) and **ColorPickerPanel**: saturation/brightness area, hue and opacity sliders, hex/rgba input, swatches, EyeDropper when supported; outputs `#rrggbb` or `rgba(r,g,b,a)`.
- **NumberField**: drag to change on the label or the unfocused field (Shift ×10, Alt ×0.1, Esc cancels), arrow keys, Enter/Esc, `unit`, `precision`, `format`/`parse`, `resetValue`, locale-aware display, accepts "0,5" and "0.5". Also `parseDecimal`.
- Drag controls (Slider, NumberField, ColorPicker) report `onValueChange` while dragging and `onValueCommit` once per change — one undo step per drag.
- **Slider**: `resetValue` (double-click), `origin` (fill from a value, e.g. 0 on −1…1), `onValueCommit`, `xs` size.
- **Resizable** panels (wrapping react-resizable-panels v4): pixel/percent limits, collapsible strips with `onCollapse`/`onExpand`, arrow keys, double-click reset, `autoSaveId` / `onLayout` persistence.
- **ScrollArea** with themed auto-hiding scrollbars, plus the `momi-scrollbar` CSS class for plain overflow elements.
- **Toolbar** (buttons, toggles, groups, separators, links; one Tab stop, arrow-key navigation) and **ToggleGroup** (single/multiple, ghost/outline/segmented, density-aware; single groups always keep one item on unless `allowDeselect`).
- `DropdownMenu` `position` prop to open a menu at any viewport point (right-click menus on canvases and timelines).
- **Platform shortcuts**: `formatShortcut` ("⇧⌘S" on Apple devices, "Ctrl+Shift+S" elsewhere, per-platform alternatives), `matchesShortcut`, `usePlatform`; `Kbd keys`, `Tooltip shortcut`, `keys` on `DropdownMenuShortcut` / `ContextMenuShortcut`; `useCommandShortcut` accepts `'mod+shift+p'`.
- **Desktop theming**: `ThemeProvider forcedTheme`, optional `--surface-sunken`, `--surface-raised`, `--border-strong` tokens, and a documented warm-dark brand theme example.
- **Landing**: `AppWindowFrame` (macOS / Windows / minimal chrome, tilt, glow), `VideoPlayer` (lazy, autoplays muted in view, respects reduced motion), `Lightbox` (images/videos, arrows, swipe, captions), `Changelog` block (`#version` anchors), `ThemeScript` / `getThemeScript()` against the dark-mode flash, README guide for Astro and Next.js.
- Playground: pages for every new component, Density & sizes, Internationalization, an EN / VI switch and a "Studio" brand theme (`?brand=studio`).

### Changed

- `Reveal` (used by Hero, features, bento, steps, testimonials, team, CTA) keeps content visible without JavaScript; it only hides content for the animation once running in the browser, and skips content the server already showed on screen.
- Fields, menus, popovers, toasts and dialogs read the optional surface tokens; without them they look the same as before.
- Every built-in string now comes from the active messages; English output is unchanged except Avatar status labels, now capitalized ("Online").
- Calendar, DatePicker, DataTable and NumberTicker format with the `LocaleProvider` locale when no `locale` prop is set.
- Toaster: a custom `clearAllLabel` is no longer followed by the English word "notifications" in its accessible name.
- Pagination `labels` accepts every pagination message; `previous` / `next` still label the arrow buttons unless `previousPage` / `nextPage` are set.

## 0.1.0 — first release

### Foundations

- Design tokens (OKLCH colors, single `--radius`), light/dark/system theming with `ThemeProvider`.
- Tailwind CSS v4 entry (`momi-ui/tailwind.css`) and a precompiled stylesheet (`momi-ui/styles.css`).
- Shared motion keyframes that collapse to near-zero with `prefers-reduced-motion`.

### Components

- **Layout**: Container, Stack/HStack/VStack, Grid (responsive props), Section, Separator, AspectRatio.
- **Typography**: Heading, Text, Link, Code, Kbd, Blockquote.
- **Buttons**: Button, IconButton, ButtonGroup.
- **Forms**: FormField, Label, Input, InputGroup, Textarea, Select, NativeSelect, Checkbox, RadioGroup, Switch, Slider, Combobox, Calendar, DatePicker, DateRangePicker, InputOTP, FileUpload.
- **Data display**: Card, Table, DataTable, Badge, Avatar, AvatarGroup.
- **Navigation**: Tabs, Breadcrumb, Pagination.
- **Disclosure**: Accordion, Collapsible.
- **Overlay**: Dialog, AlertDialog, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Command / CommandDialog.
- **Feedback**: Alert, Toast (`toast()` + `Toaster`), Progress, Skeleton, Spinner.

### DataTable

Sorting, resizable and pinned columns, pinned rows, sticky header/footer, grouped headers, cell spans, expandable rows, drag-to-reorder (pointer + keyboard) and virtual scrolling.

### Landing blocks

AnnouncementBar, Navbar, Hero, HeroBadge, BackgroundPattern, BrowserFrame, LogoCloud, Marquee, SectionHeader, FeatureGrid, FeatureSplit, BentoGrid, Stats, NumberTicker, Steps, Testimonials, PricingTable, PricingComparison, Faq, Cta, NewsletterForm, TeamGrid, Footer, Reveal.
