import { Menu, Monitor, Moon, Sun, X } from 'lucide-react'
import { Badge, cn, IconButton, NativeSelect, useTheme, type Theme } from '../../src'
import { useCustomizer } from '../lib/customizer-context'
import { accents, radii } from '../lib/customizer-presets'
import { demos, groups, upcoming } from '../registry'

const themeOrder: Theme[] = ['light', 'dark', 'system']
const themeIcon = { light: Sun, dark: Moon, system: Monitor }

export function Header({ navOpen, onToggleNav }: { navOpen: boolean; onToggleNav: () => void }) {
  const { theme, setTheme } = useTheme()
  const { accent, setAccent, radius, setRadius } = useCustomizer()
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
          v0.1.0
        </Badge>

        <div className="ms-auto flex items-center gap-2">
          <div
            className="hidden items-center gap-1.5 lg:flex"
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
            wrapperClassName="hidden w-28 sm:block"
          >
            {radii.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </NativeSelect>
          <IconButton
            variant="outline"
            size="sm"
            aria-label={`Theme: ${theme}. Switch to ${nextTheme}`}
            title={`Theme: ${theme}`}
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
                      {d.title}
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

        {upcoming.map((u) => (
          <div key={u.group}>
            <p className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
              {u.group}
              <Badge size="sm" shape="rounded">
                soon
              </Badge>
            </p>
            <ul className="space-y-0.5">
              {u.items.map((item) => (
                <li key={item} className="px-2 py-1 text-sm text-muted-foreground/50">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
