import { Avatar as AvatarPrimitive } from 'radix-ui'
import * as React from 'react'
import { useMessages } from '../i18n/locale-provider'
import { cn } from '../lib/cn'
import { UserIcon } from '../lib/icons'

const avatarSizes = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
} as const

const statusSizes = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
  xl: 'size-3.5',
} as const

const statusColors = {
  online: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-destructive',
  offline: 'bg-muted-foreground/60',
} as const

export type AvatarSize = keyof typeof avatarSizes
export type AvatarStatus = keyof typeof statusColors

export interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  /** Used for the alt text and to build initials when the image is missing. */
  name?: string
  /** Custom fallback content (overrides initials). */
  fallback?: React.ReactNode
  /** @default 'md' */
  size?: AvatarSize
  /** @default 'circle' */
  shape?: 'circle' | 'square'
  status?: AvatarStatus
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function Avatar({
  src,
  alt,
  name,
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  className,
  children,
  ...props
}: AvatarProps) {
  const t = useMessages('avatar')
  const label = alt ?? name
  const avatar = (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted align-middle font-medium text-muted-foreground select-none',
        shape === 'circle' ? 'rounded-full' : 'rounded-[25%]',
        avatarSizes[size],
        !status && className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {src && (
            <AvatarPrimitive.Image
              src={src}
              alt={label ?? ''}
              className="aspect-square size-full object-cover"
            />
          )}
          <AvatarPrimitive.Fallback
            delayMs={src ? 400 : undefined}
            role={label ? 'img' : undefined}
            aria-label={label}
            className="flex size-full items-center justify-center"
          >
            {fallback ?? (name ? getInitials(name) : <UserIcon className="size-[55%]" />)}
          </AvatarPrimitive.Fallback>
        </>
      )}
    </AvatarPrimitive.Root>
  )

  if (!status) return avatar

  return (
    <span data-slot="avatar-wrapper" className={cn('relative inline-flex shrink-0', className)}>
      {avatar}
      <span
        role="status"
        aria-label={t[status]}
        className={cn(
          'absolute end-0 bottom-0 rounded-full ring-2 ring-background',
          statusSizes[size],
          statusColors[status],
        )}
      />
    </span>
  )
}

const groupSpacing: Record<AvatarSize, string> = {
  xs: '-space-x-1.5',
  sm: '-space-x-2',
  md: '-space-x-2.5',
  lg: '-space-x-3',
  xl: '-space-x-4',
}

export interface AvatarGroupProps extends React.ComponentProps<'div'> {
  /** Max avatars to show; the rest collapse into a `+N` avatar. */
  max?: number
  /** Applied to children that don't set their own size. @default 'md' */
  size?: AvatarSize
}

export function AvatarGroup({ max, size = 'md', className, children, ...props }: AvatarGroupProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement<AvatarProps>)
  const visible = max !== undefined ? items.slice(0, max) : items
  const hidden = items.length - visible.length
  const t = useMessages('avatar')

  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'flex items-center rtl:space-x-reverse',
        groupSpacing[size],
        '*:ring-2 *:ring-background',
        className,
      )}
      {...props}
    >
      {visible.map((child) => React.cloneElement(child, { size: child.props.size ?? size }))}
      {hidden > 0 && <Avatar size={size} aria-label={t.more(hidden)} fallback={`+${hidden}`} />}
    </div>
  )
}
