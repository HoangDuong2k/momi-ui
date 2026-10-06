#!/usr/bin/env node
/**
 * momi-ui command line. `npx momi-ui link-skill` makes the momi-ui agent skill (shipped in this
 * package) visible to coding agents in the current project.
 */
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL = 'momi-ui'
const TARGETS = {
  claude: '.claude/skills', // Claude Code; also read by GitHub Copilot and Cursor
  agents: '.agents/skills', // OpenAI Codex; also read by Cursor
  github: '.github/skills', // GitHub Copilot
}

const help = `Usage: npx momi-ui link-skill [options]

Links the momi-ui agent skill into this project so coding agents (Claude Code, Codex,
Copilot, Cursor…) load it when working on UI. The links point into node_modules, so the
skill always matches the installed momi-ui version. Commit them.

Options:
  --to <list>   Where to link, comma-separated: ${Object.keys(TARGETS).join(', ')} (default: claude,agents)
  --copy        Copy the files instead of linking (re-run after upgrading momi-ui)
  --force       Replace an existing ${SKILL} skill folder that this command did not create
  -h, --help    Show this help`

const args = process.argv.slice(2)
const command = args[0]
if (!command || command === '-h' || command === '--help') {
  console.log(help)
  process.exit(command ? 0 : 1)
}
if (command !== 'link-skill') {
  console.error(`Unknown command "${command}".\n\n${help}`)
  process.exit(1)
}

const flag = (name) => args.includes(name)
const option = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}
if (flag('-h') || flag('--help')) {
  console.log(help)
  process.exit(0)
}

const project = process.cwd()
const wanted = (option('--to') ?? 'claude,agents')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
for (const name of wanted) {
  if (!(name in TARGETS)) {
    console.error(`Unknown target "${name}". Use: ${Object.keys(TARGETS).join(', ')}.`)
    process.exit(1)
  }
}

// Prefer the copy in the project's node_modules: links to it keep working for everyone after
// `npm install`, and follow upgrades. Fall back to this package's own folder.
const installed = join(project, 'node_modules', 'momi-ui', 'skills', SKILL)
const bundled = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills', SKILL)
const source = existsSync(join(installed, 'SKILL.md')) ? installed : bundled
if (!existsSync(join(source, 'SKILL.md'))) {
  console.error('Could not find the momi-ui skill. Is momi-ui installed (npm install)?')
  process.exit(1)
}
if (!existsSync(join(project, 'package.json'))) {
  console.warn(`Note: no package.json in ${project}. Run this from the project root.`)
}

/** Whether a path already holds the momi-ui skill (a copy this command made). */
const isOurSkill = (path) => {
  try {
    return /^name:\s*momi-ui\s*$/m.test(readFileSync(join(path, 'SKILL.md'), 'utf8'))
  } catch {
    return false
  }
}

let copied = false
let done = 0
for (const name of wanted) {
  const folder = join(project, TARGETS[name])
  const destination = join(folder, SKILL)
  const target = relative(folder, source)
  const shown = relative(project, destination)

  let existing = null
  try {
    existing = lstatSync(destination)
  } catch {
    // Nothing there yet.
  }
  if (existing?.isSymbolicLink() && readlinkSync(destination) === target && !flag('--copy')) {
    console.log(`✓ ${shown} already links to ${target}`)
    done++
    continue
  }
  if (existing && !existing.isSymbolicLink() && !isOurSkill(destination) && !flag('--force')) {
    console.error(`✗ ${shown} exists and is not the momi-ui skill. Use --force to replace it.`)
    process.exitCode = 1
    continue
  }
  if (existing) rmSync(destination, { recursive: true, force: true })
  mkdirSync(folder, { recursive: true })

  if (!flag('--copy')) {
    try {
      symlinkSync(target, destination, 'dir')
      console.log(`✓ ${shown} → ${target}`)
      done++
      continue
    } catch (error) {
      // Windows without Developer Mode can't create symlinks: copy instead.
      console.warn(`Could not create a symlink (${error.code}); copying instead.`)
    }
  }
  cpSync(source, destination, { recursive: true })
  copied = true
  console.log(`✓ ${shown} (copied)`)
  done++
}

if (done > 0) {
  console.log(
    copied
      ? '\nCopies do not follow upgrades: run `npx momi-ui link-skill --copy` again after updating momi-ui.'
      : '\nCommit the links. They work on any machine after `npm install`, and follow momi-ui upgrades.',
  )
  console.log('Start a new agent session to load the skill.')
}
