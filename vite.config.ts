/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Every runtime dependency stays external so consumers dedupe React, Radix, etc.
const externalDeps = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]
const isExternal = (id: string) =>
  externalDeps.some((dep) => id === dep || id.startsWith(`${dep}/`))

export default defineConfig(({ command, mode }) => {
  // `vite` → playground dev server, `vite build` → library, `vite build --mode playground` → static playground,
  // `vite build --watch --mode watch` → library rebuilds for `npm run dev:lib`
  const isLibraryBuild = command === 'build' && mode !== 'playground'

  return {
    // The static playground uses relative URLs, so it works under any path (GitHub Pages serves it
    // at /momi-ui/); pages are routed by the URL hash.
    base: command === 'build' && mode === 'playground' ? './' : '/',
    plugins: [react(), tailwindcss()],
    // The playground shows the package version (playground/env.d.ts declares it).
    define: { __MOMI_VERSION__: JSON.stringify(pkg.version) },
    build: isLibraryBuild
      ? {
          lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: 'index',
          },
          rolldownOptions: {
            external: isExternal,
            output: {
              // Components rely on hooks/Radix, so mark the bundle as a client module (Next.js RSC).
              banner: "'use client';",
            },
          },
          sourcemap: true,
          copyPublicDir: false,
          // In watch mode the type declarations and CSS are written by other watchers — keep them.
          emptyOutDir: mode !== 'watch',
        }
      : {
          outDir: 'playground-dist',
        },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
    },
  }
})
