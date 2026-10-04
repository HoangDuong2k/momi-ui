# momi-ui

Thư viện component React theo phong cách **Modern Minimal**, xây trên **Tailwind CSS v4** và **Radix UI**:
nhiều khoảng trắng, typography rõ ràng, một màu accent, bo góc vừa phải, bóng đổ nhẹ, hỗ trợ dark mode.

> Trạng thái: **Phase 0 → 2** (setup, component nền tảng, component tương tác & overlay). Xem [Lộ trình](#lộ-trình).

## Chạy playground

```bash
npm install
npm run dev        # http://localhost:5173 — App test toàn bộ component
```

Playground (`playground/App.tsx`) có sidebar theo nhóm, chuyển light/dark/system, đổi màu accent và radius trực tiếp, xem source của từng demo.

## Scripts

| Lệnh                              | Mô tả                                          |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Chạy playground                                |
| `npm run build`                   | Build thư viện ra `dist/` (JS + `.d.ts` + CSS) |
| `npm run build:playground`        | Build playground tĩnh ra `playground-dist/`    |
| `npm test`                        | Unit test (Vitest + Testing Library)           |
| `npm run typecheck`               | Kiểm tra TypeScript                            |
| `npm run lint` / `npm run format` | ESLint / Prettier (tự sắp xếp class Tailwind)  |

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

| Nhóm         | Component                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Theme        | `ThemeProvider`, `useTheme`                                                                                                                                        |
| Layout       | `Container`, `Stack`, `HStack`, `VStack`, `Grid`, `Section`, `Separator`, `AspectRatio`                                                                            |
| Typography   | `Heading`, `Text`, `Link`, `Code`, `Kbd`, `Blockquote`                                                                                                             |
| Buttons      | `Button`, `IconButton`, `ButtonGroup`                                                                                                                              |
| Forms        | `FormField`, `Label`, `Input`, `InputGroup`, `InputAddon`, `Textarea`, `Select`, `NativeSelect`, `Checkbox`, `RadioGroup`, `RadioGroupItem`, `Switch`              |
| Data display | `Card` (+ `Header/Title/Description/Action/Content/Footer`), `Table` (row/col span, bordered, sticky header/footer), `DataTable`, `Badge`, `Avatar`, `AvatarGroup` |
| Navigation   | `Tabs` (segmented · underline · pills, ngang/dọc), `Breadcrumb`, `Pagination` (+ `getPaginationRange`)                                                             |
| Disclosure   | `Accordion` (default · bordered · separated, chevron/plus), `Collapsible`                                                                                          |
| Overlay      | `Dialog`, `AlertDialog`, `Drawer` (4 cạnh), `Popover`, `Tooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`                                                       |
| Feedback     | `Alert`, `Toast` (`toast()` + `<Toaster />`, có promise/action/swipe, nút "Clear all" khi có từ 2 toast), `Progress`, `Skeleton`, `SkeletonText`, `Spinner`        |

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
  components/      # mỗi component một file; __tests__/ chứa unit test
  lib/             # cn(), tones, responsive helpers, icons nội bộ
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
- [ ] **Phase 3** — Landing page: Navbar, Hero, LogoCloud, Features/Bento, Stats, Testimonials, Pricing, FAQ, CTA, Newsletter, Footer, Marquee, Reveal + trang Landing Demo
- [ ] **Phase 4** — Nâng cao: Combobox, Command, DatePicker, Slider, OTP, FileUpload; tài liệu & publish npm
