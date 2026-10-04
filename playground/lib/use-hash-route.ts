import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getRoute = () => window.location.hash.replace(/^#\/?/, '')

/** Current `#/route` without the prefix. */
export function useHashRoute() {
  return useSyncExternalStore(subscribe, getRoute, () => '')
}
