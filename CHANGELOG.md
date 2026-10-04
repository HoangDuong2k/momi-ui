# Changelog

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
