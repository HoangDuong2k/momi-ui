import type * as React from 'react'
import { cn } from '../lib/cn'
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from '../lib/icons'
import { toneSoftBordered, toneText, type Tone } from '../lib/tones'
import { IconButton } from './icon-button'

const defaultIcons: Record<Tone, React.ComponentType<React.ComponentProps<'svg'>>> = {
  neutral: InfoIcon,
  primary: InfoIcon,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleAlertIcon,
}

export interface AlertProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** @default 'neutral' */
  tone?: Tone
  /** `outline`: neutral card with a colored icon · `soft`: tinted background. @default 'outline' */
  variant?: 'outline' | 'soft'
  title?: React.ReactNode
  /** Custom icon, or `false` to hide it. Defaults to an icon matching the tone. */
  icon?: React.ReactNode | false
  /** Content aligned to the end (e.g. a button). */
  action?: React.ReactNode
  /** Shows a close button that calls this handler. */
  onClose?: () => void
}

/** A static callout for important, contextual messages. */
export function Alert({
  tone = 'neutral',
  variant = 'outline',
  title,
  icon,
  action,
  onClose,
  className,
  children,
  role = 'alert',
  ...props
}: AlertProps) {
  const DefaultIcon = defaultIcons[tone]
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role={role}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm',
        variant === 'outline' ? 'bg-card text-card-foreground' : toneSoftBordered[tone],
        className,
      )}
      {...props}
    >
      {icon !== false && (
        <span
          className={cn(
            'mt-0.5 flex shrink-0 [&_svg]:size-4',
            variant === 'outline' && tone !== 'neutral' && toneText[tone],
          )}
        >
          {icon ?? <DefaultIcon />}
        </span>
      )}
      <div className="grid min-w-0 flex-1 gap-1">
        {title && <div className="leading-5 font-medium">{title}</div>}
        {children && (
          <div
            className={cn(
              'text-[0.8125rem] leading-relaxed',
              variant === 'outline' ? 'text-muted-foreground' : 'text-current/85',
            )}
          >
            {children}
          </div>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2 self-center">{action}</div>}
      {onClose && (
        <IconButton
          aria-label="Dismiss"
          size="sm"
          tone={variant === 'soft' && tone === 'danger' ? 'danger' : 'neutral'}
          onClick={onClose}
          className="-me-2 -mt-1 size-7 shrink-0 text-current/60 hover:text-current"
        >
          <XIcon />
        </IconButton>
      )}
    </div>
  )
}
