import { themeDefaults, type ResolvedTheme, type Theme } from './theme-provider'

export interface ThemeScriptOptions {
  /** Must match `ThemeProvider`. @default 'momi-theme' */
  storageKey?: string | false
  /** Must match `ThemeProvider`. @default 'system' */
  defaultTheme?: Theme
  /** Must match `ThemeProvider`. @default 'class' */
  attribute?: 'class' | 'data-theme'
  forcedTheme?: ResolvedTheme
}

export interface ThemeScriptProps extends ThemeScriptOptions {
  /** For a Content-Security-Policy that requires nonces. */
  nonce?: string
}

/**
 * The inline script `ThemeScript` renders — for frameworks that insert raw HTML into `<head>`
 * themselves (e.g. Astro: `<script is:inline set:html={getThemeScript()} />`).
 */
export function getThemeScript({
  storageKey = themeDefaults.storageKey,
  defaultTheme = themeDefaults.defaultTheme,
  attribute = themeDefaults.attribute,
  forcedTheme,
}: ThemeScriptOptions = {}): string {
  const args = [storageKey || null, defaultTheme, attribute, forcedTheme ?? null]
    .map((value) => JSON.stringify(value))
    .join(',')
  return `(function(k,d,a,f){try{var t=f;if(!t){try{t=k&&localStorage.getItem(k)}catch(_){}}if(t!=='light'&&t!=='dark'&&t!=='system')t=d;if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var e=document.documentElement;if(a==='class'){e.classList.remove('light','dark');e.classList.add(t)}else{e.setAttribute('data-theme',t)}e.style.colorScheme=t}catch(_){}})(${args})`
}

/**
 * Applies the stored theme before the page paints, so server-rendered or static pages don't flash
 * light in dark mode. Render it in `<head>` with the same options as `ThemeProvider`
 * (and add `suppressHydrationWarning` to `<html>` in React frameworks).
 */
export function ThemeScript({ nonce, ...options }: ThemeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: getThemeScript(options) }} />
}
