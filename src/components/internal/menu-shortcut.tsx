import type * as React from 'react'
import { useMessages } from '../../i18n/locale-provider'
import { cn } from '../../lib/cn'
import { formatShortcut, usePlatform, type Shortcut } from '../../lib/shortcut'
import { menuShortcutClass } from './overlay-styles'

export interface MenuShortcutProps extends React.ComponentProps<'span'> {
  /**
   * A shortcut formatted for the user's platform instead of `children`:
   * `keys="mod+shift+s"` shows "⇧⌘S" on Apple devices and "Ctrl+Shift+S" elsewhere.
   */
  keys?: Shortcut | string[]
}

/** Shortcut hint at the end of a menu item (DropdownMenu and ContextMenu). */
export function MenuShortcut({
  keys,
  className,
  children,
  slot,
  ...props
}: MenuShortcutProps & { slot: string }) {
  const platform = usePlatform()
  const names = useMessages('shortcut')
  const shortcut = Array.isArray(keys) ? keys.join('+') : keys
  return (
    <span data-slot={slot} className={cn(menuShortcutClass, className)} {...props}>
      {shortcut ? (
        <>
          <span aria-hidden>{formatShortcut(shortcut, { platform })}</span>
          <span className="sr-only">
            {formatShortcut(shortcut, { platform, spoken: true, names })}
          </span>
        </>
      ) : (
        children
      )}
    </span>
  )
}
