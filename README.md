# momi-ui

Thư viện component React theo phong cách **Modern Minimal**, xây trên **Tailwind CSS v4** và **Radix UI**:
nhiều khoảng trắng, typography rõ ràng, một màu accent, bo góc vừa phải, bóng đổ nhẹ, hỗ trợ dark mode.

> Trạng thái: **v0.1.0 — Phase 0 + 1** (setup + component nền tảng). Xem [Lộ trình](#lộ-trình).

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
import { Button, Card, CardContent, CardHeader, CardTitle, ThemeProvider } from 'momi-ui'

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Card>
        <CardHeader>
          <CardTitle>Hello momi</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Get started</Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  )
}
```

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

## Component (Phase 1)

| Nhóm         | Component                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme        | `ThemeProvider`, `useTheme`                                                                                                                 |
| Layout       | `Container`, `Stack`, `HStack`, `VStack`, `Grid`, `Section`, `Separator`, `AspectRatio`                                                     |
| Typography   | `Heading`, `Text`, `Link`, `Code`, `Kbd`, `Blockquote`                                                                                      |
| Buttons      | `Button`, `IconButton`, `ButtonGroup`                                                                                                       |
| Forms        | `FormField`, `Label`, `Input`, `InputGroup`, `InputAddon`, `Textarea`, `NativeSelect`, `Checkbox`, `RadioGroup`, `RadioGroupItem`, `Switch` |
| Data display | `Card` (+ `Header/Title/Description/Action/Content/Footer`), `Badge`, `Avatar`, `AvatarGroup`                                               |
| Feedback     | `Spinner`                                                                                                                                   |

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
- [ ] **Phase 2** — Tương tác & overlay: Dialog, AlertDialog, Drawer, Popover, Tooltip, DropdownMenu, Tabs, Accordion, Toast, Alert, Progress, Skeleton, Table, Pagination, Breadcrumb
- [ ] **Phase 3** — Landing page: Navbar, Hero, LogoCloud, Features/Bento, Stats, Testimonials, Pricing, FAQ, CTA, Newsletter, Footer, Marquee, Reveal + trang Landing Demo
- [ ] **Phase 4** — Nâng cao: Combobox, Command, DatePicker, Slider, OTP, FileUpload; tài liệu & publish npm
