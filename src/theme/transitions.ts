/** Class (defined in theme.css) that turns off every CSS transition inside the element. */
export const INSTANT_CLASS = 'momi-instant'

let suspended = 0
// Whether the class was on <html> before we added it (the app's own) — then it stays.
let ownedByApp = false

/**
 * Turn off CSS transitions on the whole page until the returned function is called — e.g. right
 * before switching color tokens yourself, so colors change in the same frame instead of fading.
 * The returned `restore` re-enables them after the next frame (once styles have been recomputed).
 * Calls can overlap; transitions come back when the last one is restored.
 */
export function suspendTransitions(): () => void {
  if (typeof document === 'undefined') return () => {}
  const root = document.documentElement
  if (suspended === 0) ownedByApp = root.classList.contains(INSTANT_CLASS)
  suspended++
  root.classList.add(INSTANT_CLASS)
  let restored = false
  return () => {
    if (restored) return
    restored = true
    // Flush style recalculation with transitions still off, then turn them back on.
    void window.getComputedStyle(root).opacity
    requestAnimationFrame(() => {
      suspended--
      if (suspended === 0 && !ownedByApp) root.classList.remove(INSTANT_CLASS)
    })
  }
}

/** Run `change` (e.g. a theme switch) with CSS transitions off, then turn them back on. */
export function withoutTransitions(change: () => void): void {
  const restore = suspendTransitions()
  try {
    change()
  } finally {
    restore()
  }
}
