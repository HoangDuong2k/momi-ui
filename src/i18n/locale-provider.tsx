import * as React from 'react'
import { en } from './en'
import { mergeMessages, type MomiMessages, type MomiMessagesInput } from './messages'

interface LocaleContextValue {
  /** BCP 47 locale for dates and numbers. `undefined` = the browser's locale. */
  locale: string | undefined
  messages: MomiMessages
}

const LocaleContext = React.createContext<LocaleContextValue>({ locale: undefined, messages: en })

export interface LocaleProviderProps {
  children: React.ReactNode
  /**
   * BCP 47 locale used to format dates and numbers (Calendar, DatePicker, DataTable, NumberTicker),
   * e.g. `vi-VN`. Inherited from a parent provider; defaults to the browser's locale.
   */
  locale?: string
  /**
   * Built-in text, e.g. the `vi` pack, or only the keys you want to change. Merged over the parent
   * provider's messages (English at the root), so partial overrides and nested providers work.
   */
  messages?: MomiMessagesInput
}

/** Sets the language of every built-in label, placeholder and screen-reader text below it. */
export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  const parent = React.useContext(LocaleContext)
  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale: locale ?? parent.locale,
      messages: messages ? mergeMessages(parent.messages, messages) : parent.messages,
    }),
    [locale, messages, parent],
  )
  return <LocaleContext value={value}>{children}</LocaleContext>
}

/** Current locale and messages. Works without a provider (English, browser locale). */
export function useLocale(): LocaleContextValue {
  return React.useContext(LocaleContext)
}

/**
 * Messages of one component group, with per-instance `overrides` (a component's `labels` prop)
 * applied on top.
 */
export function useMessages<K extends keyof MomiMessages>(
  group: K,
  overrides?: Partial<MomiMessages[K]>,
): MomiMessages[K] {
  const messages = React.useContext(LocaleContext).messages[group]
  if (!overrides) return messages
  const merged = { ...messages }
  for (const key of Object.keys(overrides) as Array<keyof MomiMessages[K]>) {
    if (overrides[key] !== undefined) merged[key] = overrides[key] as MomiMessages[K][typeof key]
  }
  return merged
}
