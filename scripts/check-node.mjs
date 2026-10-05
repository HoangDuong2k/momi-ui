// Runs before `npm test`: Vitest 5 needs Node ^22.12 / 24 / ≥26 and fails with an unclear error on
// older versions. Building (and installing from git) only needs Node ^20.19 or ≥22.12.
const [major, minor] = process.versions.node.split('.').map(Number)
const supported = (major === 22 && minor >= 12) || major === 24 || major >= 26

if (!supported) {
  console.error(
    `momi-ui: tests need Node 22.12+ or 24 (this is v${process.versions.node}).\n` +
      'Run `nvm use` in the repo — it reads .nvmrc — then try again.',
  )
  process.exit(1)
}
