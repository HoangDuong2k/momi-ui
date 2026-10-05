# momi-ui

Thư viện component React theo phong cách **Modern Minimal**, xây trên **Tailwind CSS v4** và **Radix UI**:
nhiều khoảng trắng, typography rõ ràng, một màu accent, bo góc vừa phải, bóng đổ nhẹ, hỗ trợ dark mode.

> Trạng thái: **v0.2.0**: ngoài component nền tảng, overlay, DataTable, landing blocks và input nâng cao, đã có Kanban, đa ngôn ngữ, mật độ nhỏ gọn và bộ component cho app desktop. Xem [Lộ trình](#lộ-trình) và [CHANGELOG](CHANGELOG.md).

## Chạy playground

```bash
nvm use            # Node 24 theo .nvmrc (test cần Node 22.12+; build chỉ cần 20.19+)
npm install
npm run dev        # http://localhost:5173 — App test toàn bộ component
```

Playground (`playground/App.tsx`) có sidebar theo nhóm, tìm kiếm <kbd>⌘</kbd> <kbd>K</kbd>, chuyển light/dark/system, đổi màu accent và radius trực tiếp, xem source của từng demo, và một trang **landing page hoàn chỉnh** (`#/landing-page`) ghép từ các block.

## Scripts

| Lệnh                              | Mô tả                                                   |
| --------------------------------- | ------------------------------------------------------- |
| `npm run dev`                     | Chạy playground                                         |
| `npm run build`                   | Build thư viện ra `dist/` (JS + `.d.ts` + CSS)          |
| `npm run dev:lib`                 | Build lại `dist/` mỗi khi sửa `src/` (dùng với `file:`) |
| `npm run build:playground`        | Build playground tĩnh ra `playground-dist/`             |
| `npm test`                        | Unit test (Vitest + Testing Library)                    |
| `npm run typecheck`               | Kiểm tra TypeScript                                     |
| `npm run lint` / `npm run format` | ESLint / Prettier (tự sắp xếp class Tailwind)           |
| `npm run check`                   | typecheck + lint + format check + test (CI)             |

## Cách dùng trong dự án khác

momi-ui chưa có trên npm. Có hai cách cài:

**Khi phát triển trên cùng máy** — khai báo đường dẫn tới repo và để momi-ui tự build lại khi sửa:

```jsonc
// package.json của app (hai repo cùng nằm trong ~/Personal Projects)
"dependencies": { "momi-ui": "file:../momi-ui" }
```

```bash
cd ../momi-ui && npm run dev:lib   # vite build --watch + tsc --watch + build CSS khi sửa src/
```

`file:` dùng thẳng thư mục `dist/` (qua symlink), nên app thấy thay đổi sau mỗi lần build tự chạy. Đặt `resolve: { dedupe: ['react', 'react-dom'] }` trong config Vite của app để không có hai bản React.

**Khi app merge lên main / chạy CI** — cài từ git, ghim theo tag:

```jsonc
"dependencies": { "momi-ui": "github:HoangDuong2k/momi-ui#v0.2.0" }
```

Repo không chứa `dist/`, nên script `prepare` tự build khi cài từ git (cần Node ≥ 20.19 hoặc ≥ 22.12). Khi `dist/` đã có (cài `file:` với `dev:lib`), `prepare` bỏ qua để `npm install` của app không build lại mỗi lần; đặt `MOMI_FORCE_BUILD=1` nếu muốn build lại. Mỗi đợt app merge cần một tag mới của momi-ui.

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

### Dùng chung với CSS có sẵn

Class của momi-ui nằm trong các layer của Tailwind (`theme`, `base`, `components`, `utilities`). CSS cũ **không nằm trong layer nào** luôn thắng mọi layer, nên một quy tắc chung như `button { … }` sẽ đè lên class của momi-ui. Cách xử lý: khai báo thứ tự layer và gói CSS cũ vào một layer riêng đặt **sau `base`, trước `components`**:

```css
@layer theme, base, legacy, components, utilities;
@import 'tailwindcss';
@import 'momi-ui/tailwind.css';
@import './legacy.css' layer(legacy); /* CSS cũ của app */
```

CSS cũ vẫn thắng preflight (reset của Tailwind) nên các màn hình cũ giữ nguyên, nhưng thua class của momi-ui nên component mới hiện đúng. Dòng `@layer …` phải đứng **trước** `@import 'tailwindcss'`. Đã thử với Vite 7 + Tailwind v4 và electron-vite 5 + Electron 44.

### Dùng với Astro / Next.js

**Astro** (React islands): component React render thành HTML tĩnh; chỉ phần cần tương tác mới chạy JavaScript qua `client:*`.

```astro
---
import '../styles/global.css' // @import 'tailwindcss'; @import 'momi-ui/tailwind.css';
import { Hero, getThemeScript } from 'momi-ui'
import { SiteNavbar, SiteFaq } from '../components/Islands' // Navbar, Faq bọc LocaleProvider
---
<html>
  <head><script is:inline set:html={getThemeScript()} /></head>
  <body>
    <SiteNavbar client:load />
    <Hero title="…" />                 <!-- tĩnh, không cần JavaScript -->
    <SiteFaq client:visible />
  </body>
</html>
```

Mỗi island là một React root riêng: provider (`LocaleProvider`, `ThemeProvider`, `TooltipProvider`) không truyền qua island, nên bọc chúng bên trong component island. Khi render phía server, đặt `locale` cho `LocaleProvider` (ví dụ `vi-VN`) để ngày giờ và số trên server giống hệt trên trình duyệt; không đặt thì mỗi bên dùng locale của máy mình và có thể lệch khi hydrate.

**Next.js** (App Router, `output: 'export'` để xuất trang tĩnh): bundle đã có `'use client'`, nên import trực tiếp vào server component được. Đặt `<ThemeScript />` trong `<head>` và thêm `suppressHydrationWarning` vào `<html>` (script đổi class trước khi React chạy).

**Cần JavaScript trên trình duyệt** (Astro: thêm `client:*`): `Navbar` (menu mobile), `Faq` / `Accordion`, `Tabs`, `PricingTable` / `BillingToggle`, `NumberTicker`, `Reveal`, `Marquee` (tạm dừng khi hover chạy bằng CSS), `VideoPlayer`, `Lightbox`, `NewsletterForm`, mọi overlay (`Dialog`, `Popover`, `DropdownMenu`, `Toast`…) và mọi control nhập liệu. **Chạy tĩnh được**: `Hero`, `SectionHeader`, `FeatureGrid` / `FeatureSplit`, `BentoGrid`, `LogoCloud`, `Stats` (không kèm `NumberTicker`), `Steps`, `TestimonialGrid`, `TeamGrid`, `Cta`, `Footer`, `AppWindowFrame`, `BrowserFrame`, `Changelog`, `Card`, `Badge`, `Table`.

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

**Token bề mặt (tùy chọn)** cho giao diện kiểu app desktop. Không đặt thì component dùng token cũ:

| Token              | Dùng cho                              | Mặc định                                |
| ------------------ | ------------------------------------- | --------------------------------------- |
| `--surface-sunken` | Ô nhập, checkbox, vùng lõm (timeline) | `--background` (dark: nền `--input` mờ) |
| `--surface-raised` | Menu, popover, toast, dialog, drawer  | `--popover` (dialog: `--background`)    |
| `--border-strong`  | Viền của các bề mặt nổi               | `--border`                              |

**Theme thương hiệu** — momi-ui không bắt buộc trông giống shadcn. Ví dụ theme tối, tông ấm của một app dựng video (playground: chọn "Studio" trên header):

```css
:root {
  --radius: 0.375rem;
  --font-sans: 'Hanken Grotesk Variable', system-ui, sans-serif;
  --background: #131211;
  --foreground: #ece9e4;
  --card: #191816;
  --popover: #211f1d;
  --muted: #211f1d;
  --muted-foreground: #8e897f;
  --accent: #2b2926;
  --secondary: #2b2926;
  --primary: #e3a04a;
  --primary-foreground: #1c1407;
  --border: #2a2825;
  --input: #3b3834;
  --ring: #e3a04a;
  --surface-sunken: #0f0e0d;
  --surface-raised: #211f1d;
  --border-strong: #3b3834;
}
```

Đặt trên `:root` (không phải một phần tử con) để cả menu, popover và toast vẽ qua portal cũng đổi theo.

**`ThemeProvider`**: `forcedTheme="dark"` cho app chỉ có nền tối (bỏ qua cài đặt hệ thống, không đọc/ghi localStorage). **`ThemeScript`** (hoặc `getThemeScript()` cho Astro) đặt trong `<head>` để trang render sẵn không nháy nền sáng ở chế độ tối; truyền cùng `storageKey` / `defaultTheme` / `attribute` với `ThemeProvider`.

Animation (overlay, accordion, toast…) dùng chung một bộ keyframes trong `theme.css`, tự rút gần như về 0 khi người dùng bật _prefers-reduced-motion_.

## Đa ngôn ngữ

Mọi chữ có sẵn trong component (nhãn nút, placeholder, thông báo lỗi, chữ cho trình đọc màn hình) lấy từ một bộ message. Mặc định là tiếng Anh; momi-ui kèm sẵn bộ tiếng Việt `vi`:

```tsx
import { LocaleProvider, vi } from 'momi-ui'

export function Root() {
  return (
    <LocaleProvider locale="vi-VN" messages={vi}>
      <App />
    </LocaleProvider>
  )
}
```

- `locale` (BCP 47) dùng để định dạng ngày và số trong `Calendar`, `DatePicker`, `DataTable`, `NumberTicker`. Không đặt thì theo trình duyệt.
- `messages` được gộp lên provider cha, nên chỉ cần truyền chỗ muốn đổi: `messages={{ kanban: { addCard: 'Việc mới' } }}`. Lồng provider để đổi chữ cho một phần app.
- Đổi cho riêng một component: prop `labels`, ví dụ `<Pagination labels={{ next: 'Tiếp' }} />`. Prop cụ thể như `placeholder`, `emptyText` vẫn ưu tiên cao nhất.
- Thêm ngôn ngữ mới: khai báo một object kiểu `MomiMessages`, TypeScript sẽ báo thiếu chuỗi nào. Chuỗi có tham số (số lượng, tên file…) là hàm, để mỗi ngôn ngữ tự sắp xếp câu.
- Dùng trong component của bạn: `useMessages('common').close`, `useLocale().locale`.
- App có nút VI / EN: chỉ cần đổi `locale` và `messages` của provider.

## Mật độ và cỡ xs

Các control có thêm `size="xs"` (cao 24px, chữ 12px, icon 14px): `Button`, `IconButton`, `Input`, `Select`, `NativeSelect`, `Combobox`, `DatePicker`, `Tabs`, `Slider`, `NumberField`, `ColorPicker`, `ToggleGroup`; `Badge`, `Switch`, `Checkbox` có bản nhỏ tương ứng. Với bảng thuộc tính dày đặc, bọc cả vùng trong `DensityProvider`:

```tsx
<DensityProvider density="compact">
  <PropertiesPanel /> {/* control bên trong mặc định cỡ xs; prop size riêng vẫn ưu tiên */}
</DensityProvider>
```

`DensityProvider` chỉ đổi cỡ mặc định của control, không đổi khoảng cách của Card, Dialog, Menu.

## Điều khiển kéo và hoàn tác

`Slider`, `NumberField`, `ColorPicker` gọi `onValueChange` liên tục khi kéo và `onValueCommit` đúng một lần khi thả (hoặc Enter, chọn màu gợi ý…) — mỗi lần kéo là một bước hoàn tác (Ctrl+Z). `Slider` có thêm `resetValue` (nhấp đúp để về giá trị này) và `origin` (tô từ `origin`, ví dụ thanh −1…1 tô từ 0). `NumberField` kéo ngang trên nhãn hoặc trên ô chưa focus (Shift ×10, Alt ×0,1), nhận cả "0,5" lẫn "0.5", có `unit`, `format` / `parse` (lưu 0..1, hiện 0..100 %), nhấp đúp nhãn về `resetValue`. `ColorPicker` nhận `#rgb`, `#rrggbb`, `rgb()`, `rgba()`, trả về `#rrggbb` hoặc `rgba(r,g,b,a)` khi độ đục dưới 100%; `ColorPickerPanel` dùng khi muốn tự làm nút mở hoặc để bảng chọn màu luôn mở.

## Phím tắt theo hệ điều hành

```tsx
formatShortcut('mod+shift+s')                         // "⇧⌘S" trên Mac, "Ctrl+Shift+S" nơi khác
formatShortcut({ mac: 'mod+shift+z', default: 'mod+y' }) // làm lại: "⇧⌘Z" / "Ctrl+Y"
formatShortcut({ mac: 'ctrl+mod+f', default: 'f11' })    // toàn màn hình: "⌃⌘F" / "F11"

<Kbd keys={['mod', 'S']} />                            // hiện đúng theo máy, có nhãn cho trình đọc màn hình
useCommandShortcut(save, 'mod+s')                      // bắt phím tắt theo cùng cách viết
const platform = usePlatform()                         // 'mac' | 'windows' | 'linux' | …; an toàn khi SSR
```

`mod` là ⌘ trên thiết bị Apple và Ctrl ở nơi khác; `ctrl` luôn là phím Control. `DropdownMenuShortcut`, `ContextMenuShortcut` và `Tooltip` (`shortcut`) nhận cùng cách viết. Chuyển từ `keyLabel` của app: đổi `Ctrl+` trong chuỗi thành `mod+`, còn "Ctrl+Y" và "F11" dùng dạng `{ mac, default }` như trên.

## Component

| Nhóm         | Component                                                                                                                                                                                                                                                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme        | `ThemeProvider` (+ `forcedTheme`), `useTheme`, `ThemeScript` / `getThemeScript`, `DensityProvider`, `LocaleProvider`                                                                                                                                                                                                                                                         |
| Layout       | `Container`, `Stack`, `HStack`, `VStack`, `Grid`, `Section`, `Separator`, `AspectRatio`, `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle` (kéo hoặc phím mũi tên, nhấp đúp về mặc định, thu gọn thành dải, nhớ bố cục), `ScrollArea` (thanh cuộn mảnh theo theme, hiện khi rê chuột)                                                                             |
| Typography   | `Heading`, `Text`, `Link`, `Code`, `Kbd` (`keys` theo hệ điều hành), `Blockquote`                                                                                                                                                                                                                                                                                            |
| Buttons      | `Button`, `IconButton`, `ButtonGroup`, `Toolbar` (+ `ToolbarButton`, `ToolbarToggle`, `ToolbarGroup`, `ToolbarSeparator`, `ToolbarLink`), `ToggleGroup` (single luôn có đúng một nút bật · multiple; ghost · outline · segmented)                                                                                                                                            |
| Forms        | `FormField`, `Label`, `Input`, `InputGroup`, `InputAddon`, `Textarea`, `Select`, `NativeSelect`, `Checkbox`, `RadioGroup`, `RadioGroupItem`, `Switch`, `NumberField` (kéo để đổi số, Shift ×10 / Alt ×0,1, đơn vị, `format` / `parse`, nhận cả "0,5" lẫn "0.5")                                                                                                              |
| Advanced     | `Slider` (range, marks, `resetValue`, `origin`), `Combobox` (single/multiple, tìm không dấu), `Calendar`, `DatePicker`, `DateRangePicker` (mọi locale), `InputOTP`, `FileUpload` (validate, preview, progress), `ColorPicker` / `ColorPickerPanel` (vùng bão hòa/độ sáng, sắc màu, độ đục, hex/rgba, màu gợi ý, hút màu), `Command` / `CommandDialog` + `useCommandShortcut` |
| Data display | `Card` (+ `Header/Title/Description/Action/Content/Footer`), `Table` (row/col span, bordered, sticky header/footer), `DataTable`, `Kanban`, `SortableList` (+ `SortableHandle`), `Badge`, `Avatar`, `AvatarGroup`                                                                                                                                                            |
| Navigation   | `Tabs` (segmented · underline · pills, ngang/dọc), `Breadcrumb`, `Pagination` (+ `getPaginationRange`)                                                                                                                                                                                                                                                                       |
| Disclosure   | `Accordion` (default · bordered · separated, chevron/plus), `Collapsible`                                                                                                                                                                                                                                                                                                    |
| Overlay      | `Dialog`, `AlertDialog`, `Drawer` (4 cạnh), `Popover`, `Tooltip` (`shortcut`), `HoverCard`, `DropdownMenu` (mở tại tọa độ bất kỳ qua `position`), `ContextMenu`, `Lightbox` (ảnh/video toàn màn hình, mũi tên, vuốt, chú thích)                                                                                                                                              |
| Feedback     | `Alert`, `Toast` (`toast()` + `<Toaster />`, có promise/action/swipe, nút "Clear all" khi có từ 2 toast), `Progress`, `Skeleton`, `SkeletonText`, `Spinner`                                                                                                                                                                                                                  |
| Tiện ích     | `formatShortcut`, `matchesShortcut`, `usePlatform`, `parseColor` / `formatColor`, `moveKanbanItem`, `cn`                                                                                                                                                                                                                                                                     |

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

### Kanban

Truyền `columns` + `value` (thẻ theo từng cột) + `renderCard`; kéo thả, bàn phím và trình đọc màn hình có sẵn:

| Tính năng                    | Cách bật                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Kéo thả giữa / trong các cột | Chuột, cảm ứng (nhấn giữ) hoặc bàn phím: Space nhấc, mũi tên di chuyển, Space thả, Esc hủy |
| Lưu thay đổi                 | `onValueChange(board)` cho cả bảng, `onCardMove({ item, from, to })` cho từng lần chuyển   |
| Quy tắc chuyển cột           | `canMove={({ from, to }) => boolean}` — cột không cho thả sẽ báo đỏ, bàn phím tự bỏ qua    |
| Giới hạn WIP                 | `limit` trên cột: hiện `3/5`, chuyển màu cảnh báo khi vượt                                 |
| Thu gọn cột                  | `collapsible`; `collapsed` / `defaultCollapsed` / `onCollapsedChange`                      |
| Thêm thẻ, menu cột, mở thẻ   | `onAddCard(columnId)`, `renderColumnActions(column)`, `onCardClick(item)` (cả phím Enter)  |
| Chỉ xem                      | `disabled`                                                                                 |
| Tự cuộn khi kéo tới mép      | Có sẵn (ngang cho bảng, dọc cho cột khi đặt `maxHeight`)                                   |

```tsx
const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To do', tone: 'info' },
  { id: 'doing', title: 'In progress', tone: 'warning', limit: 3 },
  { id: 'done', title: 'Done', tone: 'success' },
]

<Kanban
  columns={columns}
  value={board} // { todo: Task[], doing: Task[], done: Task[] }
  onValueChange={setBoard}
  getItemLabel={(task) => task.title} // dùng trong thông báo cho trình đọc màn hình
  renderCard={(task) => <TaskCard task={task} />}
/>
```

Mỗi thẻ cần `id` ổn định (hoặc truyền `getItemId`). `moveKanbanItem(board, from, to)` là hàm thuần để tự áp dụng một lần chuyển, ví dụ khi nhận sự kiện realtime.

### SortableList

```tsx
<SortableList
  value={songs}
  onValueChange={setSongs} // cả danh sách sau khi thả (hoặc dùng defaultValue nếu không cần giữ ở ngoài)
  onReorder={({ item, from, to }) => saveOrder(item, to)} // từng lần chuyển, tiện để lưu lên server
  getItemLabel={(song) => song.title} // cho thông báo của trình đọc màn hình
  renderItem={(song) => <SongRow song={song} />}
/>
```

Cùng cách đặt tên với `Kanban` (`value` / `defaultValue` / `onValueChange`, `getItemId`, `getItemLabel`; `onReorder` tương ứng `onCardMove`).

Kéo cả hàng (cảm ứng: nhấn giữ) hoặc chỉ tay nắm (`handle` + đặt `<SortableHandle />` trong `renderItem`; cảm ứng kéo ngay). Hàng đang kéo mờ đi, bản sao nổi theo con trỏ, vạch màu chỉ chỗ thả, tự cuộn khi tới mép vùng cuộn. Bàn phím: Space nhấc, mũi tên (Home/End) di chuyển, Space thả, Esc hủy. Có `orientation="horizontal"`, `variant="card" | "plain"`, `disabled`; nút và link trong hàng vẫn bấm được. Dùng chung bộ kéo thả với Kanban.

### Menu mở tại vị trí bất kỳ

```tsx
const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

<canvas onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }) }} />
<DropdownMenu open={menu !== null} onOpenChange={(open) => !open && setMenu(null)} position={menu}>
  <DropdownMenuContent>
    <DropdownMenuItem>Tách clip <DropdownMenuShortcut keys="mod+b" /></DropdownMenuItem>
    <DropdownMenuItem variant="danger">Xóa</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Không cần `DropdownMenuTrigger`. Menu mở sang phải con trỏ như menu chuột phải của hệ điều hành, tự lật hoặc dịch vào trong khi gần mép; Esc hoặc bấm ra ngoài thì đóng, focus trả về chỗ cũ. Ở chế độ này menu mặc định không modal, nên chuột phải chỗ khác mở lại ngay.

### Resizable và ScrollArea

`ResizablePanelGroup` bọc `react-resizable-panels` v4: **số là pixel, chuỗi là phần trăm** (`minSize={220}`, `defaultSize="30%"`, `collapsedSize={34}`). `autoSaveId` lưu bố cục vào localStorage (mỗi panel cần `id`), hoặc dùng `onLayout` để app tự lưu rồi trả lại qua `defaultLayout`. Có `onCollapse` / `onExpand`; children có thể là hàm `({ collapsed }) => …` để vẽ dải thu gọn.

`ScrollArea` có `size="sm" | "md"` (6px / 8px). Với phần tử `overflow: auto` không bọc được (ví dụ timeline tự đặt `scrollLeft`), thêm class **`momi-scrollbar`**: thanh cuộn theo màu theme, hiện khi rê chuột hoặc focus; thêm `momi-scrollbar-visible` để luôn hiện.

### Toolbar và ToggleGroup

`Toolbar` chỉ chiếm một điểm dừng Tab; phím mũi tên đi qua các nút, nhóm nút và link bên trong. `ToolbarButton`, `ToolbarToggle`, `ToggleGroupItem` nhận `icon` + `label` (+ `shortcut`) cho nút chỉ có icon, tự kèm tooltip kiểu "Lưu project ⌘S". `ToggleGroup type="single"` luôn giữ đúng một nút bật (trừ khi đặt `allowDeselect`). Toolbar mặc định cỡ `sm`, thành `xs` trong `DensityProvider density="compact"`.

### Landing blocks

Ghép bằng `Section` + `Container` + block. Block dùng chung token với component nên trang marketing luôn khớp với sản phẩm.

| Block                                                                    | Ghi chú                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `AnnouncementBar`, `Navbar`                                              | Navbar có menu mobile, biến thể `blur` · `solid` · `transparent`                                                   |
| `Hero`, `HeroBadge`, `BrowserFrame`                                      | Layout `centered` / `split`, nền `grid` · `dots` · `glow` · `gradient`                                             |
| `LogoCloud`, `Marquee`                                                   | Lưới hoặc chạy vô tận, dừng khi hover / reduced motion                                                             |
| `SectionHeader`, `FeatureGrid`, `FeatureSplit`, `BentoGrid`, `BentoCard` | Tính năng dạng lưới, xen kẽ ảnh, bento                                                                             |
| `Stats`, `NumberTicker`, `Steps`                                         | Số đếm lên khi cuộn tới, các bước "how it works"                                                                   |
| `TestimonialGrid`, `TestimonialCard`, `FeaturedTestimonial`              | Masonry, trích dẫn nổi bật                                                                                         |
| `PricingTable`, `PricingCard`, `BillingToggle`, `PricingComparison`      | Bảng giá theo tháng/năm, ma trận so sánh                                                                           |
| `Faq`, `Cta`, `NewsletterForm`, `TeamGrid`, `Footer`                     | CTA `primary` tự đảo màu nút bên trong                                                                             |
| `BackgroundPattern`, `Reveal`, `useInView`                               | Hiệu ứng nền, hiện dần khi cuộn (nội dung vẫn hiện khi không có JavaScript)                                        |
| `AppWindowFrame`                                                         | Khung cửa sổ app desktop `macos` · `windows` · `minimal`, có `tilt` (nghiêng 3D, thẳng lại khi rê chuột) và `glow` |
| `VideoPlayer`                                                            | Chỉ tải khi sắp cuộn tới, tự phát không tiếng khi thấy, dừng khi khuất; giảm chuyển động thì chờ bấm phát          |
| `Changelog`                                                              | Danh sách phiên bản mới nhất ở trên, nhãn Mới / Cải thiện / Sửa lỗi, link neo `#v0.2.0`                            |

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

- `variant` cho kiểu hiển thị (`solid · soft · outline · ghost · link`), `tone` cho màu ngữ nghĩa (`primary · neutral · danger`, Badge có thêm `success · warning · info`), `size` (`xs · sm · md · lg`; mặc định theo `DensityProvider`).
- Điều khiển nhận cả `value` + `onValueChange` (có kiểm soát) lẫn `defaultValue`; điều khiển kéo báo thêm `onValueCommit` một lần khi thả.
- `asChild` để render component con (ví dụ `<Button asChild><Link to="/" /></Button>`).
- `className` luôn được merge sau cùng (qua `tailwind-merge`) nên có thể ghi đè bất kỳ style nào.
- Prop responsive nhận object theo breakpoint: `<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={6} />`.
- Control đặt trong `FormField` tự nhận `id`, `aria-describedby`, `aria-invalid`, `required`, `disabled`.
- Mỗi phần tử gốc có `data-slot="…"` để tiện style và test.
- Component có chữ sẵn nhận `labels` để đổi chữ cho riêng nó; đổi cho cả app dùng `LocaleProvider` (xem [Đa ngôn ngữ](#đa-ngôn-ngữ)).

## Cấu trúc

```
src/
  components/      # mỗi component một file; data-table/ là thư mục riêng; __tests__/ chứa unit test
  blocks/          # block cho landing page (+ __tests__/)
  lib/             # cn(), tones, responsive, date, color, shortcut, pointer drag, icons nội bộ
  styles/          # theme.css (tokens + base), standalone.css (entry cho styles.css)
  theme/           # ThemeProvider
  i18n/            # LocaleProvider, bộ message en / vi
  index.ts         # public API
playground/        # App cho `npm run dev` (demos/, registry.ts, components/)
scripts/           # build-css.mjs, dev-lib.mjs (build khi sửa), prepare.mjs (build khi cài từ git)
```

**Thêm component mới:** tạo `src/components/<ten>.tsx` → export trong `src/index.ts` → thêm demo `playground/demos/<ten>.tsx` và khai báo trong `playground/registry.ts` → viết test trong `src/components/__tests__/`.

> Class Tailwind phải được viết **nguyên văn** trong code (không ghép chuỗi kiểu `` `bg-${tone}` ``) để Tailwind quét được. Giá trị động dùng CSS variable (xem `src/lib/responsive.ts`).

## Lộ trình

- [x] **Phase 0** — Setup: Vite 8 library mode, TypeScript, Tailwind v4, tokens, dark mode, playground, test, lint
- [x] **Phase 1** — Nền tảng: layout, typography, buttons, forms, card, badge, avatar, spinner
- [x] **Phase 2** — Tương tác & overlay: Dialog, AlertDialog, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Select, Tabs, Accordion, Collapsible, Toast, Alert, Progress, Skeleton, Table, Pagination, Breadcrumb
- [x] **Phase 3** — Landing page: Navbar, Hero, LogoCloud, Features/Bento, Stats, Steps, Testimonials, Pricing, FAQ, CTA, Newsletter, Team, Footer, Marquee, Reveal + trang landing hoàn chỉnh
- [x] **Phase 4** — Nâng cao: Combobox, Command, Calendar/DatePicker, Slider, OTP, FileUpload; trang Installation, CI, LICENSE, CHANGELOG, sẵn sàng publish
- [x] **Phase 5** — Kanban, đa ngôn ngữ; cho app desktop: cài từ `file:` / git tag, cỡ xs + `DensityProvider`, ColorPicker, NumberField, Slider `resetValue` / `origin`, Resizable, SortableList, ScrollArea, menu mở tại tọa độ, Toolbar / ToggleGroup, phím tắt theo hệ điều hành, theme desktop (`forcedTheme`, token bề mặt); cho landing: AppWindowFrame, VideoPlayer, Lightbox, ThemeScript, Changelog, hướng dẫn Astro / Next.js
- [ ] **Sau này** — kéo nhiều hàng cùng lúc trong SortableList, pointer lock cho NumberField, so sánh trước / sau (ComparisonSlider), phát hành lên npm

## Phát hành

Mỗi đợt app cần bản mới: chạy `npm run check`, cập nhật CHANGELOG, đánh tag rồi push (`git tag v0.2.0 && git push --tags`). App cài theo tag, `prepare` tự build khi cài.

Khi đưa lên npm:

```bash
npm login
npm publish        # prepublishOnly tự chạy check + build
```

`npm pack --dry-run` để xem trước các file sẽ được publish (chỉ `dist/`, `README.md`, `LICENSE`, `CHANGELOG.md`, `package.json`).
