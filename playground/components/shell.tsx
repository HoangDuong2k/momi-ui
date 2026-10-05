import { ArrowUpRight, Menu, Monitor, Moon, Search, Sun, X } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  cn,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  IconButton,
  Kbd,
  NativeSelect,
  useCommandShortcut,
  useTheme,
  type Theme,
} from '../../src'
import { useBrand } from '../lib/brand-context'
import { useCustomizer } from '../lib/customizer-context'
import { accents, radii } from '../lib/customizer-presets'
import { demos, groups } from '../registry'

const themeOrder: Theme[] = ['light', 'dark', 'system']
const themeIcon = { light: Sun, dark: Moon, system: Monitor }

/** ⌘K search over every demo page — built with momi-ui's own CommandDialog. */
function SearchCommand() {
  const [open, setOpen] = useState(false)
  useCommandShortcut(() => setOpen((o) => !o))

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ms-2 hidden h-8 w-56 items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-sm whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 md:flex"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search components…</span>
        <Kbd keys="mod+k" className="ms-auto shrink-0" />
      </button>
      <IconButton
        aria-label="Search components"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search />
      </IconButton>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search components">
        <CommandInput placeholder="Search components and blocks…" />
        <CommandList>
          <CommandEmpty />
          {groups.map((group) => (
            <CommandGroup key={group} heading={group}>
              {demos
                .filter((d) => d.group === group)
                .map((d) => (
                  <CommandItem
                    key={d.id}
                    value={d.title}
                    keywords={[d.id, ...(d.imports ?? [])]}
                    onSelect={() => {
                      setOpen(false)
                      window.location.hash = `#/${d.id}`
                    }}
                  >
                    <span className="truncate">{d.title}</span>
                    <span className="ms-auto truncate text-xs text-muted-foreground">{group}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export function Header({ navOpen, onToggleNav }: { navOpen: boolean; onToggleNav: () => void }) {
  const { theme, setTheme } = useTheme()
  const { accent, setAccent, radius, setRadius, language, setLanguage } = useCustomizer()
  const { brand, setBrand } = useBrand()
  const studio = brand === 'studio'
  const ThemeIcon = themeIcon[theme]
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-3 px-4 sm:px-6">
        <IconButton
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          className="md:hidden"
          onClick={onToggleNav}
        >
          {navOpen ? <X /> : <Menu />}
        </IconButton>

        <a
          href="#/overview"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <span className="flex size-6 items-center justify-center rounded-[7px] bg-primary">
            <span className="size-2 rounded-full bg-primary-foreground" />
          </span>
          <span className="font-semibold tracking-tight">
            momi<span className="text-muted-foreground">/ui</span>
          </span>
        </a>
        <Badge size="sm" variant="outline" shape="rounded" className="hidden sm:inline-flex">
          v{__MOMI_VERSION__}
        </Badge>
        <SearchCommand />

        <div className="ms-auto flex items-center gap-2">
          <NativeSelect
            size="sm"
            aria-label="Brand theme"
            value={brand}
            onChange={(e) => setBrand(e.target.value as 'default' | 'studio')}
            wrapperClassName="hidden w-28 md:block"
          >
            <option value="default">momi</option>
            <option value="studio">Studio</option>
          </NativeSelect>
          <div
            className={cn('hidden items-center gap-1.5 lg:flex', studio && 'lg:hidden')}
            role="group"
            aria-label="Accent color"
          >
            {accents.map((a) => (
              <button
                key={a.id}
                type="button"
                title={a.label}
                aria-label={a.label}
                aria-pressed={accent === a.id}
                onClick={() => setAccent(a.id)}
                className={cn(
                  'size-5 rounded-full ring-offset-2 ring-offset-background transition outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  accent === a.id ? 'ring-2 ring-foreground/50' : 'hover:scale-110',
                )}
                style={{ background: a.swatch }}
              />
            ))}
          </div>
          <NativeSelect
            size="sm"
            aria-label="Radius"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            wrapperClassName={cn('hidden w-28 sm:block', studio && 'sm:hidden')}
          >
            {radii.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </NativeSelect>
          <div
            role="group"
            aria-label="Component language"
            className="flex h-8 items-center rounded-md border p-0.5"
          >
            {(['en', 'vi'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={language === l}
                title={l === 'en' ? 'English' : 'Tiếng Việt'}
                onClick={() => setLanguage(l)}
                className={cn(
                  'h-full rounded-[calc(var(--radius)-4px)] px-2 font-mono text-xs font-medium text-muted-foreground uppercase transition-colors outline-none',
                  'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
                  'aria-pressed:bg-accent aria-pressed:text-foreground',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <IconButton
            variant="outline"
            size="sm"
            aria-label={`Theme: ${theme}. Switch to ${nextTheme}`}
            title={studio ? 'Studio is dark only (forcedTheme)' : `Theme: ${theme}`}
            disabled={studio}
            onClick={() => setTheme(nextTheme)}
          >
            <ThemeIcon />
          </IconButton>
        </div>
      </div>
    </header>
  )
}

export function Sidebar({
  active,
  open,
  onNavigate,
}: {
  active: string
  open: boolean
  onNavigate: () => void
}) {
  return (
    <aside
      className={cn(
        'w-60 shrink-0 overflow-y-auto border-e bg-background px-4 py-8',
        'md:sticky md:top-14 md:block md:h-[calc(100dvh-3.5rem)] md:w-60',
        open ? 'fixed inset-x-0 top-14 bottom-0 z-30 block w-full' : 'hidden',
      )}
    >
      <nav className="space-y-7" aria-label="Components">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">{group}</p>
            <ul className="space-y-0.5">
              {demos
                .filter((d) => d.group === group)
                .map((d) => (
                  <li key={d.id}>
                    <a
                      href={`#/${d.id}`}
                      onClick={onNavigate}
                      aria-current={active === d.id ? 'page' : undefined}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors outline-none',
                        'hover:bg-accent/60 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
                        active === d.id && 'bg-accent font-medium text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {d.title}
                        {d.standalone && <ArrowUpRight className="size-3.5 opacity-60" />}
                      </span>
                      {d.isNew && (
                        <Badge
                          size="sm"
                          tone="primary"
                          shape="rounded"
                          className="h-4 px-1 text-[10px]"
                        >
                          new
                        </Badge>
                      )}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
