# momi-ui

Thư viện component React theo phong cách **Modern Minimal**, xây trên **Tailwind CSS v4** và **Radix UI**:
nhiều khoảng trắng, typography rõ ràng, một màu accent, bo góc vừa phải, bóng đổ nhẹ, hỗ trợ dark mode.

> Trạng thái: **v0.1.0 — đủ 4 phase**: component nền tảng, tương tác & overlay, DataTable, block landing page và các input nâng cao. Xem [Lộ trình](#lộ-trình) và [CHANGELOG](CHANGELOG.md).

## Chạy playground

```bash
npm install
npm run dev        # http://localhost:5173 — App test toàn bộ component
```

Playground (`playground/App.tsx`) có sidebar theo nhóm, tìm kiếm <kbd>⌘</kbd> <kbd>K</kbd>, chuyển light/dark/system, đổi màu accent và radius trực tiếp, xem source của từng demo, và một trang **landing page hoàn chỉnh** (`#/landing-page`) ghép từ các block.

## Scripts

| Lệnh                              | Mô tả                                          |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Chạy playground                                |
| `npm run build`                   | Build thư viện ra `dist/` (JS + `.d.ts` + CSS) |
| `npm run build:playground`        | Build playground tĩnh ra `playground-dist/`    |
| `npm test`                        | Unit test (Vitest + Testing Library)           |
| `npm run typecheck`               | Kiểm tra TypeScript                            |
| `npm run lint` / `npm run format` | ESLint / Prettier (tự sắp xếp class Tailwind)  |
| `npm run check`                   | typecheck + lint + format check + test (CI)    |

## Cách dùng trong dự án khác

```bash
npm install momi-ui
```

**Dự án đã dùng Tailwind CSS v4** (khuyên dùng) — thêm vào file CSS chính:

```css
@import 'tailwindcss';
@import 'momi-ui/tailwind.css'; /* tokens + @source trỏ vào bundle của momi-ui */
```

**Dự án không dùng Tailwind** — import file CSS đã biên dịch sẵn:

```ts
import 'momi-ui/styles.css'
```

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ThemeProvider,
  Toaster,
  TooltipProvider,
  toast,
} from 'momi-ui'

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Card>
          <CardHeader>
            <CardTitle>Hello momi</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.success('Welcome!')}>Get started</Button>
          </CardContent>
        </Card>
        <Toaster /> {/* mount một lần để dùng toast() ở bất kỳ đâu */}
      </TooltipProvider>
    </ThemeProvider>
  )
}
```

`TooltipProvider` là tùy chọn (giúp các tooltip cạnh nhau mở tức thì); `Toaster` chỉ cần khi dùng `toast()`.

## Theming

Toàn bộ màu sắc là CSS variables (tương thích cách đặt tên của shadcn/ui). Ghi đè trên `:root` / `.dark`:

```css
:root {
  --primary: oklch(0.546 0.245 262.881);
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.546 0.245 262.881);
  --radius: 0.75rem;
}
```

Tokens: `background, foreground, card, popover, primary, secondary, muted, accent, destructive, success, warning, info, border, input, ring` (+ `-foreground`) và `--radius` (sinh ra `rounded-sm … rounded-2xl`).
Dark mode bật bằng class `.dark` hoặc `data-theme="dark"` trên một phần tử cha (thường là `<html>`; `ThemeProvider` tự làm việc này).

Animation (overlay, accordion, toast…) dùng chung một bộ keyframes trong `theme.css`, tự rút gần như về 0 khi người dùng bật _prefers-reduced-motion_.

## Component

| Nhóm         | Component                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Theme        | `ThemeProvider`, `useTheme`                                                                                                                                                                                                                |
| Layout       | `Container`, `Stack`, `HStack`, `VStack`, `Grid`, `Section`, `Separator`, `AspectRatio`                                                                                                                                                    |
| Typography   | `Heading`, `Text`, `Link`, `Code`, `Kbd`, `Blockquote`                                                                                                                                                                                     |
| Buttons      | `Button`, `IconButton`, `ButtonGroup`                                                                                                                                                                                                      |
| Forms        | `FormField`, `Label`, `Input`, `InputGroup`, `InputAddon`, `Textarea`, `Select`, `NativeSelect`, `Checkbox`, `RadioGroup`, `RadioGroupItem`, `Switch`                                                                                      |
| Advanced     | `Slider` (range, marks), `Combobox` (single/multiple, tìm không dấu), `Calendar`, `DatePicker`, `DateRangePicker` (mọi locale), `InputOTP`, `FileUpload` (validate, preview, progress), `Command` / `CommandDialog` + `useCommandShortcut` |
| Data display | `Card` (+ `Header/Title/Description/Action/Content/Footer`), `Table` (row/col span, bordered, sticky header/footer), `DataTable`, `Badge`, `Avatar`, `AvatarGroup`                                                                         |
| Navigation   | `Tabs` (segmented · underline · pills, ngang/dọc), `Breadcrumb`, `Pagination` (+ `getPaginationRange`)                                                                                                                                     |
| Disclosure   | `Accordion` (default · bordered · separated, chevron/plus), `Collapsible`                                                                                                                                                                  |
| Overlay      | `Dialog`, `AlertDialog`, `Drawer` (4 cạnh), `Popover`, `Tooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`                                                                                                                               |
| Feedback     | `Alert`, `Toast` (`toast()` + `<Toaster />`, có promise/action/swipe, nút "Clear all" khi có từ 2 toast), `Progress`, `Skeleton`, `SkeletonText`, `Spinner`                                                                                |

### DataTable

Truyền `columns` + `data`, phần còn lại có sẵn:

| Tính năng                     | Cách bật                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------- |
| Sort cột (asc → desc → tắt)   | `sortable: true` trên cột; `sort` / `defaultSort` / `onSortChange`               |
| Kéo đổi độ rộng cột           | `resizableColumns`; `columnWidths` / `onColumnWidthsChange` (phím ← → cũng được) |
| Cố định cột trái / phải       | `pin: 'left' \| 'right'` trên cột hoặc nhóm cột                                  |
| Header / footer cố định       | `maxHeight` + `stickyHeader` / `stickyFooter` (mặc định bật); `footer` trên cột  |
| Cố định row trên / dưới       | `pinnedRows={{ top: [id], bottom: [id] }}`                                       |
| Col-span header               | Nhóm cột: `{ id, header, columns: [...] }`                                       |
| Row-span / col-span ô dữ liệu | `span: (row, index) => ({ rowSpan, colSpan, hidden })`                           |
| Expand row                    | `renderExpanded`, `getRowCanExpand`, `expanded` / `onExpandedChange`             |
| Kéo thả đổi vị trí row        | `onRowReorder={({ rows }) => setData(rows)}` (phím ↑ ↓ trên tay nắm, Esc để hủy) |
| Virtual scrolling             | `virtualize` + `maxHeight` (bỏ qua row-span khi bật)                             |

```tsx
const columns: DataTableColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, pin: 'left', width: 220 },
  { id: 'email', header: 'Email', accessor: 'email', width: 260 },
  { id: 'salary', header: 'Salary', accessor: 'salary', align: 'end', sortable: true,
    footer: (rows) => rows.reduce((s, r) => s + r.salary, 0) },
]

<DataTable data={users} columns={columns} maxHeight={480} resizableColumns virtualize />
```

`getRowId` mặc định lấy `row.id` (nếu có), nên đặt id ổn định khi dùng expand / pin / reorder.

### Landing blocks

Ghép bằng `Section` + `Container` + block. Block dùng chung token với component nên trang marketing luôn khớp với sản phẩm.

| Block                                                                    | Ghi chú                                                                |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `AnnouncementBar`, `Navbar`                                              | Navbar có menu mobile, biến thể `blur` · `solid` · `transparent`       |
| `Hero`, `HeroBadge`, `BrowserFrame`                                      | Layout `centered` / `split`, nền `grid` · `dots` · `glow` · `gradient` |
| `LogoCloud`, `Marquee`                                                   | Lưới hoặc chạy vô tận, dừng khi hover / reduced motion                 |
| `SectionHeader`, `FeatureGrid`, `FeatureSplit`, `BentoGrid`, `BentoCard` | Tính năng dạng lưới, xen kẽ ảnh, bento                                 |
| `Stats`, `NumberTicker`, `Steps`                                         | Số đếm lên khi cuộn tới, các bước "how it works"                       |
| `TestimonialGrid`, `TestimonialCard`, `FeaturedTestimonial`              | Masonry, trích dẫn nổi bật                                             |
| `PricingTable`, `PricingCard`, `BillingToggle`, `PricingComparison`      | Bảng giá theo tháng/năm, ma trận so sánh                               |
| `Faq`, `Cta`, `NewsletterForm`, `TeamGrid`, `Footer`                     | CTA `primary` tự đảo màu nút bên trong                                 |
| `BackgroundPattern`, `Reveal`, `useInView`                               | Hiệu ứng nền, hiện dần khi cuộn                                        |

```tsx
<Hero
  eyebrow={<HeroBadge label="New" href="/changelog">Landing blocks are here</HeroBadge>}
  title="Build calm interfaces, faster."
  description="Modern Minimal components for React."
  actions={<Button size="lg">Get started</Button>}
  media={<BrowserFrame url="app.momi.dev"><img src="/screenshot.png" alt="" /></BrowserFrame>}
/>
<Section>
  <Container>
    <SectionHeader eyebrow="Pricing" title="Simple pricing" />
    <PricingTable plans={plans} yearlyBadge="−20%" />
  </Container>
</Section>
```

### Quy ước API

- `variant` cho kiểu hiển thị (`solid · soft · outline · ghost · link`), `tone` cho màu ngữ nghĩa (`primary · neutral · danger`, Badge có thêm `success · warning · info`), `size` (`sm · md · lg`).
- `asChild` để render component con (ví dụ `<Button asChild><Link to="/" /></Button>`).
- `className` luôn được merge sau cùng (qua `tailwind-merge`) nên có thể ghi đè bất kỳ style nào.
- Prop responsive nhận object theo breakpoint: `<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={6} />`.
- Control đặt trong `FormField` tự nhận `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`.
- Mỗi phần tử gốc có `data-slot="…"` để tiện style và test.

## Cấu trúc

```
src/
  components/      # mỗi component một file; data-table/ là thư mục riêng; __tests__/ chứa unit test
  blocks/          # block cho landing page (+ __tests__/)
  lib/             # cn(), tones, responsive, date, icons nội bộ
  styles/          # theme.css (tokens + base), standalone.css (entry cho styles.css)
  theme/           # ThemeProvider
  index.ts         # public API
playground/        # App cho `npm run dev` (demos/, registry.ts, components/)
scripts/           # build-css.mjs
```

**Thêm component mới:** tạo `src/components/<ten>.tsx` → export trong `src/index.ts` → thêm demo `playground/demos/<ten>.tsx` và khai báo trong `playground/registry.ts` → viết test trong `src/components/__tests__/`.

> Class Tailwind phải được viết **nguyên văn** trong code (không ghép chuỗi kiểu `` `bg-${tone}` ``) để Tailwind quét được. Giá trị động dùng CSS variable (xem `src/lib/responsive.ts`).

## Lộ trình

- [x] **Phase 0** — Setup: Vite 8 library mode, TypeScript, Tailwind v4, tokens, dark mode, playground, test, lint
- [x] **Phase 1** — Nền tảng: layout, typography, buttons, forms, card, badge, avatar, spinner
- [x] **Phase 2** — Tương tác & overlay: Dialog, AlertDialog, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Select, Tabs, Accordion, Collapsible, Toast, Alert, Progress, Skeleton, Table, Pagination, Breadcrumb
- [x] **Phase 3** — Landing page: Navbar, Hero, LogoCloud, Features/Bento, Stats, Steps, Testimonials, Pricing, FAQ, CTA, Newsletter, Team, Footer, Marquee, Reveal + trang landing hoàn chỉnh
- [x] **Phase 4** — Nâng cao: Combobox, Command, Calendar/DatePicker, Slider, OTP, FileUpload; trang Installation, CI, LICENSE, CHANGELOG, sẵn sàng publish

## Publish lên npm

```bash
npm login
npm publish        # prepublishOnly tự chạy check + build
```

`npm pack --dry-run` để xem trước các file sẽ được publish (chỉ `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, `package.json`).
