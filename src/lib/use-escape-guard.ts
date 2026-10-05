import * as React from 'react'

/**
 * While `active`, stop Escape from also dismissing the Radix layer around us (Dialog, Popover…):
 * those listen on `document` in the capture phase — before React — and skip default-prevented
 * events. Returns a check for whether an event was guarded, so our own handler still reacts to it.
 */
export function useEscapeGuard(active: boolean) {
  const guarded = React.useRef<Event | null>(null)
  React.useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      guarded.current = event
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [active])
  return React.useCallback((event: Event) => guarded.current === event, [])
}
