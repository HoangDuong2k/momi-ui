import * as React from 'react'
import { en } from '../i18n/en'
import type { MomiMessages } from '../i18n/messages'

type SpokenNames = MomiMessages['shortcut']

export type Platform = 'mac' | 'ios' | 'windows' | 'linux' | 'android' | 'unknown'

/**
 * A shortcut such as `'mod+shift+s'`. `mod` is ⌘ on Apple devices and Ctrl elsewhere; `ctrl` is
 * always the Control key. Pass `{ mac, default }` when the keys differ, e.g. redo
 * `{ mac: 'mod+shift+z', default: 'mod+y' }`.
 */
export type Shortcut = string | { mac?: string; default: string }

export interface ShortcutOptions {
  /** Defaults to the detected platform. */
  platform?: Platform
}

interface ParsedShortcut {
  mod: boolean
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
  key: string
}

const MODIFIER_ALIASES: Record<string, keyof Omit<ParsedShortcut, 'key'>> = {
  mod: 'mod',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  opt: 'alt',
  shift: 'shift',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  super: 'meta',
  win: 'meta',
}

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  del: 'delete',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  spacebar: 'space',
  ' ': 'space',
  plus: '+',
}

const MAC_KEYS: Record<string, string> = {
  enter: '↩',
  backspace: '⌫',
  delete: '⌦',
  escape: '⎋',
  tab: '⇥',
  space: 'Space',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
}

const OTHER_KEYS: Record<string, string> = {
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  escape: 'Esc',
  tab: 'Tab',
  space: 'Space',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  pageup: 'PgUp',
  pagedown: 'PgDn',
  home: 'Home',
  end: 'End',
}

/** Parsed key → its name in the `shortcut` messages. */
const SPOKEN_KEYS: Record<string, keyof SpokenNames> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  enter: 'enter',
  escape: 'escape',
  tab: 'tab',
  space: 'space',
  backspace: 'backspace',
  delete: 'delete',
  home: 'home',
  end: 'end',
  pageup: 'pageUp',
  pagedown: 'pageDown',
}

let cachedPlatform: Platform | undefined

/** Best guess at the user's platform. Returns `unknown` on the server. */
export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown'
  if (cachedPlatform) return cachedPlatform
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const hint = `${nav.userAgentData?.platform ?? ''} ${nav.platform ?? ''} ${nav.userAgent ?? ''}`
  cachedPlatform = /iPhone|iPad|iPod/i.test(hint)
    ? 'ios'
    : // iPadOS reports itself as a Mac with touch support.
      /Mac/i.test(hint) && nav.maxTouchPoints > 1
      ? 'ios'
      : /Mac/i.test(hint)
        ? 'mac'
        : /Android/i.test(hint)
          ? 'android'
          : /Win/i.test(hint)
            ? 'windows'
            : /Linux|X11|CrOS/i.test(hint)
              ? 'linux'
              : 'unknown'
  return cachedPlatform
}

const isApple = (platform: Platform) => platform === 'mac' || platform === 'ios'

function resolve(shortcut: Shortcut, platform: Platform) {
  if (typeof shortcut === 'string') return shortcut
  return isApple(platform) && shortcut.mac ? shortcut.mac : shortcut.default
}

/** Split `'mod+shift+s'` into modifiers and a key. Unknown words are treated as the key. */
export function parseShortcut(shortcut: string): ParsedShortcut {
  const parsed: ParsedShortcut = {
    mod: false,
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    key: '',
  }
  // `mod++` means mod and the plus key.
  const parts = shortcut.trim().split(/\+(?!$)/)
  for (const raw of parts) {
    const part = raw.trim().toLowerCase()
    const modifier = MODIFIER_ALIASES[part]
    if (modifier) parsed[modifier] = true
    else parsed.key = KEY_ALIASES[part] ?? part
  }
  return parsed
}

function keyLabel(key: string, apple: boolean, names: SpokenNames | null) {
  const named = names
    ? SPOKEN_KEYS[key] && names[SPOKEN_KEYS[key]]
    : (apple ? MAC_KEYS : OTHER_KEYS)[key]
  return named || key.charAt(0).toUpperCase() + key.slice(1)
}

/**
 * Format a shortcut for display: `'mod+shift+s'` → "⇧⌘S" on Apple devices, "Ctrl+Shift+S" elsewhere.
 * `spoken: true` spells keys out for screen readers ("Shift+Command+S"); pass `names` (the
 * `shortcut` messages, e.g. `useMessages('shortcut')`) to speak them in the app's language.
 */
export function formatShortcut(
  shortcut: Shortcut,
  {
    platform = detectPlatform(),
    spoken = false,
    names = en.shortcut,
  }: ShortcutOptions & { spoken?: boolean; names?: SpokenNames } = {},
): string {
  const apple = isApple(platform)
  const { mod, ctrl, alt, shift, meta, key } = parseShortcut(resolve(shortcut, platform))
  const keyText = key ? keyLabel(key, apple, spoken ? names : null) : ''

  if (apple && !spoken) {
    // Apple's order: Control, Option, Shift, Command.
    return `${ctrl ? '⌃' : ''}${alt ? '⌥' : ''}${shift ? '⇧' : ''}${mod || meta ? '⌘' : ''}${keyText}`
  }
  // Visible text on Windows/Linux uses the standard key caps; spoken text follows the messages.
  const n = spoken ? names : en.shortcut
  const parts = apple
    ? [ctrl && n.control, alt && n.option, shift && n.shift, (mod || meta) && n.command]
    : [
        (mod || ctrl) && n.ctrl,
        alt && n.alt,
        shift && n.shift,
        meta && (platform === 'windows' ? n.win : n.super),
      ]
  return [...parts.filter(Boolean), keyText].filter(Boolean).join('+')
}

/** Whether a keyboard event matches a shortcut on the given platform. */
export function matchesShortcut(
  event: Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>,
  shortcut: Shortcut,
  { platform = detectPlatform() }: ShortcutOptions = {},
): boolean {
  const apple = isApple(platform)
  const parsed = parseShortcut(resolve(shortcut, platform))
  const wantCtrl = parsed.ctrl || (parsed.mod && !apple)
  const wantMeta = parsed.meta || (parsed.mod && apple)
  if (event.ctrlKey !== wantCtrl || event.metaKey !== wantMeta || event.altKey !== parsed.alt)
    return false
  // Shifted symbols ("?") already carry the shift; only letters and named keys check it.
  const key = (event.key ?? '').toLowerCase()
  const isSymbol = parsed.key.length === 1 && !/[a-z0-9]/.test(parsed.key)
  if (!isSymbol && event.shiftKey !== parsed.shift) return false
  if (key === parsed.key || KEY_ALIASES[key] === parsed.key) return true
  if (key === ' ' && parsed.key === 'space') return true
  // Letters and digits by physical key, so shortcuts work on non-Latin layouts.
  if (/^[a-z]$/.test(parsed.key)) return event.code === `Key${parsed.key.toUpperCase()}`
  if (/^[0-9]$/.test(parsed.key)) return event.code === `Digit${parsed.key}`
  return false
}

const subscribe = () => () => {}

/**
 * The user's platform. Renders `unknown` on the server and during hydration, then the real value,
 * so server-rendered pages never mismatch.
 */
export function usePlatform(): Platform {
  return React.useSyncExternalStore(subscribe, detectPlatform, () => 'unknown')
}
