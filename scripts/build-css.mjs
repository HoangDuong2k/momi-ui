// Builds the CSS entry points shipped in dist/:
//   dist/styles.css   – precompiled, minified stylesheet (no Tailwind needed in the consumer app)
//   dist/theme.css    – design tokens + base layer (for Tailwind v4 consumers)
//   dist/tailwind.css – theme + @source pointing at the bundle, imported after `tailwindcss`
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/postcss'
import postcss from 'postcss'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const srcDir = path.join(root, 'src', 'styles')
const distDir = path.join(root, 'dist')

await mkdir(distDir, { recursive: true })

const standaloneEntry = path.join(srcDir, 'standalone.css')
const result = await postcss([tailwindcss({ base: root, optimize: { minify: true } })]).process(
  await readFile(standaloneEntry, 'utf8'),
  { from: standaloneEntry },
)
await writeFile(path.join(distDir, 'styles.css'), result.css)

await copyFile(path.join(srcDir, 'theme.css'), path.join(distDir, 'theme.css'))
await writeFile(
  path.join(distDir, 'tailwind.css'),
  [
    '/* momi-ui — import right after `@import "tailwindcss";` */',
    '@import "./theme.css";',
    '@source "./index.js";',
    '',
  ].join('\n'),
)

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`
console.log(`dist/styles.css   ${kb(Buffer.byteLength(result.css))}`)
console.log('dist/theme.css    copied')
console.log('dist/tailwind.css written')
