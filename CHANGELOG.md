# Changelog

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
