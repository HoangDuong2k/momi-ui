import type * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import type { MomiMessages } from '../i18n/messages'
import { cn } from '../lib/cn'
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from '../lib/icons'
import { useControllableState } from '../lib/use-controllable-state'
import { Button } from './button'

export type PaginationRangeItem = number | 'ellipsis-start' | 'ellipsis-end'

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)

/**
 * Page numbers to display, e.g. `[1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]`.
 * Always returns the same number of slots for a given pageCount so the control doesn't jump.
 */
export function getPaginationRange(
  page: number,
  pageCount: number,
  siblings = 1,
  boundaries = 1,
): PaginationRangeItem[] {
  const total = siblings * 2 + 3 + boundaries * 2
  if (pageCount <= total) return range(1, pageCount)

  const current = Math.min(Math.max(page, 1), pageCount)
  const leftSibling = Math.max(current - siblings, boundaries + 1)
  const rightSibling = Math.min(current + siblings, pageCount - boundaries)
  const showLeftEllipsis = leftSibling > boundaries + 2
  const showRightEllipsis = rightSibling < pageCount - boundaries - 1
  const sideCount = siblings * 2 + boundaries + 2

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, sideCount), 'ellipsis-end', ...range(pageCount - boundaries + 1, pageCount)]
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [
      ...range(1, boundaries),
      'ellipsis-start',
      ...range(pageCount - sideCount + 1, pageCount),
    ]
  }
  return [
    ...range(1, boundaries),
    'ellipsis-start',
    ...range(leftSibling, rightSibling),
    'ellipsis-end',
    ...range(pageCount - boundaries + 1, pageCount),
  ]
}

export interface PaginationProps extends Omit<React.ComponentProps<'nav'>, 'onChange'> {
  pageCount: number
  /** Current page (1-based). Controlled. */
  page?: number
  /** Initial page when uncontrolled. @default 1 */
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Pages shown on each side of the current one. @default 1 */
  siblings?: number
  /** Pages always shown at the start and end. @default 1 */
  boundaries?: number
  /** @default 'md' */
  size?: 'sm' | 'md'
  /** Hide the "Previous"/"Next" text on the arrow buttons. */
  compact?: boolean
  /**
   * Override built-in text for this instance (see `LocaleProvider` for app-wide text).
   * `previous` / `next` also label the arrow buttons unless `previousPage` / `nextPage` are set.
   */
  labels?: Partial<MomiMessages['pagination']>
}

export function Pagination({
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  siblings = 1,
  boundaries = 1,
  size = 'md',
  compact = false,
  labels,
  className,
  ...props
}: PaginationProps) {
  const [current, setPage] = useControllableState({
    value: page,
    defaultValue: defaultPage,
    onChange: onPageChange,
  })
  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), Math.max(pageCount, 1))
    if (clamped !== current) setPage(clamped)
  }
  const square = size === 'sm' ? 'size-8 px-0' : 'size-9 px-0'
  const t = useMessages('pagination', labels)

  return (
    <nav
      data-slot="pagination"
      aria-label={t.nav}
      className={cn('flex justify-center', className)}
      {...props}
    >
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          <Button
            variant="ghost"
            size={size}
            aria-label={labels?.previousPage ?? labels?.previous ?? t.previousPage}
            disabled={current <= 1}
            onClick={() => go(current - 1)}
            leftIcon={<ChevronLeftIcon className="rtl:rotate-180" />}
            className={cn(compact ? square : 'ps-2.5')}
          >
            {!compact && <span className="hidden sm:inline">{t.previous}</span>}
          </Button>
        </li>
        {getPaginationRange(current, pageCount, siblings, boundaries).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <Button
                variant={item === current ? 'outline' : 'ghost'}
                size={size}
                aria-current={item === current ? 'page' : undefined}
                aria-label={t.page(item)}
                onClick={() => go(item)}
                className={cn(square, 'tabular-nums', item === current && 'pointer-events-none')}
              >
                {item}
              </Button>
            </li>
          ) : (
            <li
              key={item}
              aria-hidden
              className={cn('flex items-center justify-center text-muted-foreground', square)}
            >
              <EllipsisIcon className="size-4" />
            </li>
          ),
        )}
        <li>
          <Button
            variant="ghost"
            size={size}
            aria-label={labels?.nextPage ?? labels?.next ?? t.nextPage}
            disabled={current >= pageCount}
            onClick={() => go(current + 1)}
            rightIcon={<ChevronRightIcon className="rtl:rotate-180" />}
            className={cn(compact ? square : 'pe-2.5')}
          >
            {!compact && <span className="hidden sm:inline">{t.next}</span>}
          </Button>
        </li>
      </ul>
    </nav>
  )
}
