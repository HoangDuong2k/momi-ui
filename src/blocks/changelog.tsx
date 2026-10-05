import * as React from 'react'
import { useLocale, useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import type { Tone } from '../lib/tones'
import { Badge } from '../components/badge'

export type ChangelogChangeType = 'new' | 'improved' | 'fixed'

export interface ChangelogChange {
  type: ChangelogChangeType
  content: React.ReactNode
}

export interface ChangelogRelease {
  version: string
  /** A `Date` or an ISO day such as `2026-10-05`. */
  date?: Date | string
  title?: React.ReactNode
  /** Free-form notes, images… shown above `changes`. */
  content?: React.ReactNode
  changes?: ChangelogChange[]
  /** Anchor id for links like `#v0.2.0`. @default `v` + version */
  id?: string
}

export interface ChangelogProps extends React.ComponentProps<'div'> {
  /** Newest first. */
  releases: ChangelogRelease[]
  /** BCP 47 locale for dates. Defaults to `LocaleProvider`'s. */
  locale?: string
  /** @default { dateStyle: 'long' } */
  dateFormat?: Intl.DateTimeFormatOptions
  /** Override built-in text for this instance. */
  labels?: Partial<MomiMessages['changelog']>
}

const changeTone: Record<ChangelogChangeType, Tone> = {
  new: 'success',
  improved: 'info',
  fixed: 'warning',
}

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'long' }

export function changelogAnchor(release: Pick<ChangelogRelease, 'id' | 'version'>) {
  if (release.id) return release.id
  return release.version.startsWith('v') ? release.version : `v${release.version}`
}

/** `YYYY-MM-DD` is read as a local day (not UTC midnight, which can shift the date). */
function toDate(value: Date | string) {
  if (value instanceof Date) return value
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(value)
}

function isoDay(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Release notes, newest first, each with a version anchor (`#v0.2.0`) for deep links. */
export function Changelog({
  releases,
  locale: localeProp,
  dateFormat = DEFAULT_DATE_FORMAT,
  labels,
  className,
  ...props
}: ChangelogProps) {
  const context = useLocale()
  const locale = localeProp ?? context.locale
  const t = useMessages('changelog', labels)
  const format = React.useMemo(
    () => new Intl.DateTimeFormat(locale, dateFormat),
    [locale, dateFormat],
  )

  // Client-rendered pages miss the browser's own jump to `#v0.2.0`: do it once mounted.
  React.useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id || !releases.some((r) => changelogAnchor(r) === id)) return
    document.getElementById(id)?.scrollIntoView()
    // Only on mount: later hash changes are handled by the browser.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div data-slot="changelog" className={cn('grid', className)} {...props}>
      {releases.map((release, i) => {
        const id = changelogAnchor(release)
        const date = release.date ? toDate(release.date) : null
        const isLast = i === releases.length - 1
        return (
          <article
            key={id}
            id={id}
            data-slot="changelog-release"
            className="grid scroll-mt-24 gap-x-10 gap-y-3 md:grid-cols-[10rem_1fr]"
          >
            <div className="md:pt-0.5">
              <div className="flex items-baseline gap-3 md:sticky md:top-24 md:flex-col md:gap-1">
                <h3 className="text-base font-semibold tracking-tight">
                  <a
                    href={`#${id}`}
                    aria-label={t.permalink(release.version)}
                    className="group/anchor inline-flex items-baseline gap-1.5 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    {release.version}
                    <span
                      aria-hidden
                      className="text-muted-foreground/0 transition-colors group-hover/anchor:text-muted-foreground group-focus-visible/anchor:text-muted-foreground"
                    >
                      #
                    </span>
                  </a>
                </h3>
                {date && (
                  <time dateTime={isoDay(date)} className="text-sm text-muted-foreground">
                    {format.format(date)}
                  </time>
                )}
              </div>
            </div>

            <div
              className={cn(
                'relative border-s ps-6 sm:ps-8',
                isLast ? 'pb-2' : 'pb-14',
                'before:absolute before:-start-[5px] before:top-1.5 before:size-[9px] before:rounded-full before:border-2 before:border-background before:bg-foreground/70',
                i === 0 && 'before:bg-primary',
              )}
            >
              {release.title && (
                <p className="mb-3 text-lg leading-snug font-semibold tracking-tight text-pretty">
                  {release.title}
                </p>
              )}
              {release.content && (
                <div className="mb-4 grid gap-3 text-sm leading-relaxed text-muted-foreground">
                  {release.content}
                </div>
              )}
              {release.changes && release.changes.length > 0 && (
                <ul className="grid gap-2.5">
                  {release.changes.map((change, c) => (
                    <li key={c} className="flex items-start gap-3 text-sm leading-relaxed">
                      <Badge
                        size="sm"
                        shape="rounded"
                        tone={changeTone[change.type]}
                        className="mt-0.5 w-20 shrink-0 justify-center"
                      >
                        {t[change.type]}
                      </Badge>
                      <span className="min-w-0">{change.content}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
