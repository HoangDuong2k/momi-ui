// `npm install` runs this for git installs (`github:HoangDuong2k/momi-ui#v0.2.0`), `file:` installs
// and installs inside this repo. Build only when dist/ is missing: a git checkout never has it, while
// a `file:` setup keeps it fresh with `npm run dev:lib` and shouldn't rebuild on every install.
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

if (existsSync(path.join(root, 'dist', 'index.js')) && !process.env.MOMI_FORCE_BUILD) {
  console.log('momi-ui: dist/ exists, skipping build (set MOMI_FORCE_BUILD=1 to rebuild).')
} else {
  execSync('npm run build', { cwd: root, stdio: 'inherit' })
}
