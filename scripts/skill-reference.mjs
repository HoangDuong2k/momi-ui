#!/usr/bin/env node
/**
 * Generates skills/momi-ui/references/components.md from the source: every export of
 * src/index.ts with its doc comment, the props the library declares itself, and the members of
 * its data types. Run after changing a public API (`npm run skill:refs`); `--check` fails when
 * the file is out of date (part of `npm run check`).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'src/index.ts')
const output = resolve(root, 'skills/momi-ui/references/components.md')
const srcDir = resolve(root, 'src') + '/'

const configPath = resolve(root, 'tsconfig.app.json')
const config = ts.getParsedCommandLineOfConfigFile(
  configPath,
  {},
  { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} },
)
const program = ts.createProgram([entry], { ...config.options, noEmit: true })
const checker = program.getTypeChecker()
const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry))

const own = (decl) => decl.getSourceFile().fileName.startsWith(srcDir)
const oneLine = (text) => text.replace(/\s+/g, ' ').trim()
const clip = (text, max = 110) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)
const escapeCell = (text) => text.replace(/\|/g, '\\|')

/** The doc comment of a symbol, and its @default tag. */
function docs(symbol) {
  const summary = oneLine(ts.displayPartsToString(symbol.getDocumentationComment(checker)))
  const fallback = symbol.getJsDocTags(checker).find((tag) => tag.name === 'default')
  return {
    summary,
    default: fallback ? oneLine(ts.displayPartsToString(fallback.text)) : '',
  }
}

/** Readable type text: as written in the source, unless that only names an internal value. */
function typeText(symbol, location) {
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
  if (decl && 'type' in decl && decl.type) {
    const written = oneLine(decl.type.getText())
    if (!/\btypeof\b/.test(written)) return clip(written)
  }
  if (decl && ts.isMethodSignature(decl)) return clip(oneLine(decl.getText().replace(/^[^(]*/, '')))
  return clip(oneLine(checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, location))))
}

// Radix building blocks every primitive extends: not worth naming.
const RADIX_INTERNALS = new Set([
  'primitive',
  'popper',
  'dismissable-layer',
  'focus-scope',
  'portal',
  'roving-focus',
  'collection',
  'presence',
  'slot',
])

/** Where props declared outside the library come from: "Radix dialog", "the HTML element". */
function inheritedFrom(declarations) {
  const sources = new Set()
  for (const decl of declarations) {
    const file = decl.getSourceFile().fileName
    const radix = file.match(/@radix-ui\/react-([\w-]+)/)
    if (radix && !RADIX_INTERNALS.has(radix[1])) sources.add(`Radix ${radix[1]}`)
    else if (file.includes('/@types/react/')) sources.add('the HTML element')
  }
  return [...sources]
}

/** Props of a component's first parameter, split into the library's own and inherited ones. */
function propsOf(type, location) {
  const parts = type.isUnion() ? type.types : [type]
  const seen = new Map()
  const foreign = []
  for (const part of parts) {
    for (const prop of checker.getPropertiesOfType(part)) {
      const decls = prop.declarations ?? []
      if (decls.length && decls.every(own)) {
        if (!seen.has(prop.name)) seen.set(prop.name, prop)
      } else {
        foreign.push(...decls)
      }
    }
  }
  const rows = [...seen.values()]
    .filter((prop) => !prop.name.startsWith('_'))
    .map((prop) => {
      const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0
      const { summary, default: fallback } = docs(prop)
      return {
        name: prop.name + (optional ? '?' : ''),
        type: typeText(prop, location),
        summary,
        fallback,
      }
    })
  return { rows, inherits: inheritedFrom(foreign) }
}

function propsTable(rows) {
  if (rows.length === 0) return ''
  const lines = ['| Prop | Type | Notes |', '| --- | --- | --- |']
  for (const row of rows) {
    const notes = [row.summary, row.fallback && `Default: ${row.fallback}`]
      .filter(Boolean)
      .join(' ')
    lines.push(`| \`${row.name}\` | \`${escapeCell(row.type)}\` | ${escapeCell(notes)} |`)
  }
  return lines.join('\n')
}

const isComponentName = (name) => /^[A-Z]/.test(name)

const sections = new Map() // source file → entries
for (const exported of checker.getExportsOfModule(moduleSymbol)) {
  const symbol =
    exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported
  const decl = symbol.valueDeclaration ?? symbol.declarations?.[0]
  if (!decl || !own(decl)) continue
  const file = relative(srcDir, decl.getSourceFile().fileName)
  if (!sections.has(file)) sections.set(file, [])
  const entries = sections.get(file)
  const name = exported.name
  const { summary } = docs(symbol)

  if (symbol.flags & ts.SymbolFlags.Function) {
    const sig = checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures()[0]
    const params = sig?.getParameters() ?? []
    const isComponent = isComponentName(name) && params.length <= 1
    if (isComponent) {
      const first = params[0]
      const props = first
        ? propsOf(checker.getTypeOfSymbolAtLocation(first, decl), decl)
        : { rows: [], inherits: [] }
      entries.push({ kind: 'component', name, summary, ...props })
    } else {
      const text = sig ? checker.signatureToString(sig, decl, ts.TypeFormatFlags.NoTruncation) : ''
      entries.push({ kind: 'function', name, summary, signature: clip(oneLine(text), 220) })
    }
  } else if (symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)) {
    if (/Props$/.test(name)) {
      entries.push({ kind: 'type', name, summary })
      continue
    }
    const type = checker.getDeclaredTypeOfSymbol(symbol)
    const members =
      type.isUnion() || !(type.flags & ts.TypeFlags.Object) ? [] : propsOf(type, decl).rows
    const alias = ts.isTypeAliasDeclaration(decl) ? clip(oneLine(decl.type.getText()), 160) : ''
    entries.push({ kind: 'type', name, summary, members, alias })
  } else if (symbol.flags & ts.SymbolFlags.Variable) {
    const text = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, decl), decl)
    entries.push({ kind: 'value', name, summary, signature: clip(oneLine(text), 160) })
  }
}

const groupTitle = (file) => file.replace(/\.(tsx?|mjs)$/, '').replace(/\/index$/, '')
const files = [...sections.keys()].sort((a, b) => groupTitle(a).localeCompare(groupTitle(b)))

const out = [
  '# momi-ui component reference',
  '',
  '<!-- Generated by scripts/skill-reference.mjs from src/index.ts — do not edit by hand. -->',
  '',
  'Every public export, grouped by source file. Component tables list the props momi-ui declares;',
  '"Also takes" names where the remaining props come from (a Radix primitive or the HTML element).',
  'Search this file (e.g. for `EventCalendar` or `onValueCommit`) instead of reading it whole.',
  '',
  '## Contents',
  '',
  ...files.map(
    (file) =>
      `- ${groupTitle(file)}: ${sections
        .get(file)
        .map((e) => e.name)
        .join(', ')}`,
  ),
  '',
]

for (const file of files) {
  out.push(`## ${groupTitle(file)}`, '')
  for (const entry of sections.get(file)) {
    if (entry.kind === 'component') {
      out.push(`### ${entry.name}`, '')
      if (entry.summary) out.push(entry.summary, '')
      const table = propsTable(entry.rows)
      if (table) out.push(table, '')
      if (entry.inherits.length) {
        const names = entry.inherits
        const list =
          names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
        out.push(`Also takes the props of ${list}.`, '')
      }
    } else if (entry.kind === 'function' || entry.kind === 'value') {
      out.push(`### ${entry.name}`, '')
      if (entry.summary) out.push(entry.summary, '')
      out.push('```ts', `${entry.name}: ${entry.signature}`, '```', '')
    } else if (entry.members?.length || entry.alias) {
      out.push(`### type ${entry.name}`, '')
      if (entry.summary) out.push(entry.summary, '')
      if (entry.alias) out.push('```ts', `type ${entry.name} = ${entry.alias}`, '```', '')
      const table = propsTable(entry.members ?? [])
      if (table) out.push(table, '')
    }
  }
  const propTypes = sections
    .get(file)
    .filter((e) => e.kind === 'type' && !e.members?.length && !e.alias)
  if (propTypes.length) out.push(`Types: ${propTypes.map((e) => `\`${e.name}\``).join(', ')}`, '')
}

const text = out.join('\n').replace(/\n{3,}/g, '\n\n')

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(output, 'utf8')
  } catch {
    // Missing counts as out of date.
  }
  if (current !== text) {
    console.error(
      'skills/momi-ui/references/components.md is out of date. Run `npm run skill:refs`.',
    )
    process.exit(1)
  }
} else {
  writeFileSync(output, text)
  console.log(`Wrote ${relative(root, output)} (${text.split('\n').length} lines).`)
}
