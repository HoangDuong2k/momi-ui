// Rebuilds dist/ whenever src/ changes — for apps that install momi-ui with `file:../momi-ui`.
//   vite build --watch  → dist/index.js
//   tsc --watch         → dist/**/*.d.ts
//   build-css on change → dist/styles.css, theme.css, tailwind.css
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const children = new Set()

/** Run a script with this Node directly (no shell), so stopping us stops it too. */
function run(script, args) {
  const child = spawn(process.execPath, [path.join(root, script), ...args], {
    cwd: root,
    stdio: 'inherit',
  })
  children.add(child)
  child.on('exit', () => children.delete(child))
  return child
}

const buildCss = () =>
  new Promise((resolve) => run('scripts/build-css.mjs', []).on('exit', resolve))

run('node_modules/vite/bin/vite.js', ['build', '--watch', '--mode', 'watch'])
run('node_modules/typescript/bin/tsc', [
  '-p',
  'tsconfig.build.json',
  '--watch',
  '--preserveWatchOutput',
])

// The precompiled CSS depends on every class used in src/, so rebuild it after any change.
let timer
let building = false
let pending = false
async function scheduleCss() {
  if (building) {
    pending = true
    return
  }
  building = true
  await buildCss()
  building = false
  if (pending) {
    pending = false
    scheduleCss()
  }
}
await buildCss()
watch(path.join(root, 'src'), { recursive: true }, (_event, file) => {
  if (!file || /__tests__|\.test\./.test(file)) return
  clearTimeout(timer)
  timer = setTimeout(scheduleCss, 200)
})

const stop = () => {
  for (const child of children) child.kill()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
process.on('SIGHUP', stop)
