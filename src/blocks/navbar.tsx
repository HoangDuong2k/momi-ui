import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { MenuIcon, XIcon } from '../lib/icons'
import { Container, type ContainerProps } from '../components/layout'

export interface NavbarLink {
  label: React.ReactNode
  href: string
  active?: boolean
  external?: boolean
}

export interface NavbarProps extends Omit<React.ComponentProps<'header'>, 'children'> {
  /** Logo / product name, usually a link to the home page. */
  brand: React.ReactNode
  links?: NavbarLink[]
  /** Right-side content: buttons, theme toggle… (also shown in the mobile menu). */
  actions?: React.ReactNode
  /**
   * `blur` translucent + blurred · `solid` opaque · `transparent` see-through until the page scrolls.
   * @default 'blur'
   */
  variant?: 'blur' | 'solid' | 'transparent'
  /** Stick to the top of the viewport. @default true */
  sticky?: boolean
  /** @default 'xl' */
  containerSize?: ContainerProps['size']
  /** Label for the mobile menu button. @default messages.navbar.menu ('Menu') */
  menuLabel?: string
}

/** Responsive site header with a collapsible mobile menu. */
export function Navbar({
  brand,
  links = [],
  actions,
  variant = 'blur',
  sticky = true,
  containerSize = 'xl',
  menuLabel,
  className,
  ...props
}: NavbarProps) {
  const t = useMessages('navbar')
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const menuId = React.useId()

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    const frame = requestAnimationFrame(onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const solid = variant === 'solid' || (variant === 'transparent' && (scrolled || open))
  const blurred = variant === 'blur'

  return (
    <header
      data-slot="navbar"
      data-scrolled={scrolled || undefined}
      className={cn(
        'z-40 w-full border-b transition-[background-color,border-color,box-shadow] duration-200',
        sticky && 'sticky top-0',
        blurred && 'border-border/60 bg-background/75 backdrop-blur-lg backdrop-saturate-150',
        solid && 'border-border bg-background',
        variant === 'transparent' && !solid && 'border-transparent bg-transparent',
        scrolled && variant !== 'transparent' && 'shadow-[0_1px_12px_-6px_rgb(0_0_0/0.12)]',
        className,
      )}
      {...props}
    >
      <Container size={containerSize} className="flex h-16 items-center gap-6">
        <div className="flex shrink-0 items-center">{brand}</div>
        {links.length > 0 && (
          <nav aria-label={t.nav} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    aria-current={link.active ? 'page' : undefined}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors outline-none',
                      'hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
                      link.active && 'font-medium text-foreground',
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ms-auto hidden items-center gap-2 md:flex">{actions}</div>
        <button
          type="button"
          aria-label={menuLabel ?? t.menu}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
          className="ms-auto inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 md:hidden"
        >
          {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </Container>

      {open && (
        <div id={menuId} className="animate-fade-in border-t bg-background md:hidden">
          <Container size={containerSize} className="grid gap-1 py-4">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={link.active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-2.5 text-base text-muted-foreground transition-colors outline-none',
                  'hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40',
                  link.active && 'font-medium text-foreground',
                )}
              >
                {link.label}
              </a>
            ))}
            {actions && (
              <div className="mt-3 flex flex-col gap-2 border-t pt-4 *:w-full">{actions}</div>
            )}
          </Container>
        </div>
      )}
    </header>
  )
}
