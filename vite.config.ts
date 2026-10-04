/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
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
  // `vite` → playground dev server, `vite build` → library, `vite build --mode playground` → static playground
  const isLibraryBuild = command === 'build' && mode !== 'playground'

  return {
    plugins: [react(), tailwindcss()],
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
          emptyOutDir: true,
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
