#!/usr/bin/env node
/**
 * Second-pass codemod: convert legacy `static args = [{ name: 'X', ... }]`
 * array syntax to v4 object syntax `static args = { X: Args.string({...}) }`,
 * and clean up remaining `flags.X(...)` references.
 *
 * Run from repo root: `node scripts/migrate-args.mjs`.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const FILES = execSync('find src -type f -name "*.ts"', { cwd: process.cwd() })
  .toString().trim().split('\n').filter(Boolean)

let touched = 0

function convertArgsBlock(body) {
  // body is the text inside `static args = [ ... ]`. Returns the replacement
  // (the inside of the new object form). We split on top-level commas between
  // {...} items.
  const items = []
  let depth = 0
  let start = 0
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === ',' && depth === 0) {
      const piece = body.slice(start, i).trim()
      if (piece) items.push(piece)
      start = i + 1
    }
  }
  const tail = body.slice(start).trim()
  if (tail) items.push(tail)

  const converted = items
    .map((item) => {
      // item is like `{ name: 'foo', required: true, description: 'bar' }`
      const m = item.match(/\{\s*([\s\S]*)\s*\}/)
      if (!m) return null
      const inner = m[1]

      // Parse property pairs (very simple — works for this codebase's args).
      const props = {}
      // Split on top-level commas, ignoring those inside strings or braces
      let d = 0
      let s = 0
      const parts = []
      for (let i = 0; i < inner.length; i++) {
        const c = inner[i]
        if (c === '{' || c === '[') d++
        else if (c === '}' || c === ']') d--
        else if (c === ',' && d === 0) {
          parts.push(inner.slice(s, i))
          s = i + 1
        }
      }
      parts.push(inner.slice(s))

      for (const p of parts) {
        const kv = p.match(/^\s*([a-zA-Z_]+)\s*:\s*([\s\S]*)$/)
        if (kv) props[kv[1]] = kv[2].trim().replace(/,$/, '')
      }

      const name = props.name?.replace(/^['"]|['"]$/g, '')
      if (!name) return null

      const otherProps = Object.entries(props)
        .filter(([k]) => k !== 'name')
        .map(([k, v]) => `      ${k}: ${v},`)

      if (otherProps.length === 0) {
        return `    ${name}: Args.string({})`
      }
      return `    ${name}: Args.string({\n${otherProps.join('\n')}\n    })`
    })
    .filter(Boolean)

  return converted.join(',\n')
}

for (const file of FILES) {
  let src = readFileSync(file, 'utf8')
  const original = src

  // 1. Convert static args = [...] to static args = {...}
  // Match the array form, capturing whatever is between [ and the matching ]
  src = src.replace(
    /static\s+args\s*=\s*\[\s*([\s\S]*?)\s*\]/g,
    (match, body) => {
      try {
        const converted = convertArgsBlock(body)
        return `static args = {\n${converted},\n  }`
      } catch {
        return match
      }
    },
  )

  // 2. Bare `flags.X(` -> `Flags.X(`
  src = src.replace(/\bflags\.(boolean|string|integer|enum|build|option|help|version)\(/g, 'Flags.$1(')

  // 3. Drop `help: Flags.help({...})` — v4 commands have help built in
  src = src.replace(/\s*help:\s*Flags\.help\([^)]*\)\s*,?\s*\n?/g, '\n')

  // 4. If we now use Args.X(...), import Args from @oclif/core
  if (/\bArgs\.\w+\(/.test(src) && !/\bArgs\b[^,}]*\}\s*from\s*["']@oclif\/core["']/m.test(src)) {
    const coreImportRe = /^import\s*\{([^}]+)\}\s*from\s*["']@oclif\/core["'];?$/m
    const m = src.match(coreImportRe)
    if (m) {
      const existing = m[1].split(',').map((n) => n.trim()).filter(Boolean)
      if (!existing.includes('Args')) existing.push('Args')
      src = src.replace(coreImportRe, `import { ${existing.join(', ')} } from '@oclif/core'`)
    } else {
      src = `import { Args } from '@oclif/core'\n` + src
    }
  }

  // 5. If we now use Flags.X(...), ensure Flags is imported
  if (/\bFlags\.\w+\(/.test(src) && !/\bFlags\b[^,}]*\}\s*from\s*["']@oclif\/core["']/m.test(src)) {
    const coreImportRe = /^import\s*\{([^}]+)\}\s*from\s*["']@oclif\/core["'];?$/m
    const m = src.match(coreImportRe)
    if (m) {
      const existing = m[1].split(',').map((n) => n.trim()).filter(Boolean)
      if (!existing.includes('Flags')) existing.push('Flags')
      src = src.replace(coreImportRe, `import { ${existing.join(', ')} } from '@oclif/core'`)
    } else {
      src = `import { Flags } from '@oclif/core'\n` + src
    }
  }

  if (src !== original) {
    writeFileSync(file, src)
    touched++
  }
}

console.log(`migrate-args: rewrote ${touched} files`)
