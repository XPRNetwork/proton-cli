#!/usr/bin/env node
/**
 * One-time codemod: migrate proton-cli command files off @oclif/command (v1)
 * to @oclif/core (v4) and the local ux shim at src/utils/ux.ts.
 *
 * Run from the repo root: `node scripts/migrate-oclif.mjs`.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { relative, dirname, posix } from 'node:path'

const ROOT = process.cwd()
const FILES = execSync('find src -type f -name "*.ts"', { cwd: ROOT })
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

let touched = 0

for (const file of FILES) {
  if (file === 'src/utils/ux.ts') continue
  let src = readFileSync(file, 'utf8')
  const original = src

  // 1. Drop legacy @oclif/command imports — covers Command, flags, both, either order
  src = src.replace(
    /^import\s*\{[^}]*\}\s*from\s*["']@oclif\/command["'];?\s*$/gm,
    '',
  )

  // 2. Drop @oclif/core imports of CliUx (we use the shim instead).
  //    Preserve other named exports from the same import.
  src = src.replace(
    /^import\s*\{([^}]+)\}\s*from\s*["']@oclif\/core["'];?\s*$/gm,
    (line, names) => {
      const filtered = names
        .split(',')
        .map((n) => n.trim())
        .filter((n) => n && n !== 'CliUx')
      if (filtered.length === 0) return ''
      return `import { ${filtered.join(', ')} } from '@oclif/core'`
    },
  )

  // 3. Body: CliUx.ux.X -> ux.X, bare CliUx -> ux
  src = src.replace(/\bCliUx\.ux\b/g, 'ux')
  src = src.replace(/\bCliUx\b/g, 'ux')

  // 4. await this.parse(...) — only outside of test or non-async contexts.
  //    Commands have async run(). this.parse(...) should be awaited.
  //    Be conservative: only rewrite if not already awaited and the surrounding
  //    function is async.
  //    Heuristic: replace `const ... = this.parse(` with `const ... = await this.parse(`.
  src = src.replace(
    /(const\s+\{[^}]*\}\s*=\s*)this\.parse\(/g,
    '$1await this.parse(',
  )

  // 5. If the file uses `ux.something(`, ensure it imports the shim.
  const usesUx = /\bux\.\w+/.test(src)
  const hasUxImport = /from\s+["'][^"']*\/utils\/ux["']/.test(src)
  if (usesUx && !hasUxImport) {
    const fileDir = dirname(file)
    let importPath = relative(fileDir, 'src/utils/ux').replaceAll('\\', '/')
    if (!importPath.startsWith('.')) importPath = './' + importPath
    src = `import { ux } from '${importPath}'\n` + src
  }

  // 6. If we removed the @oclif/command import but still have `extends Command`,
  //    ensure Command is imported from @oclif/core.
  const usesCommandClass = /\bextends\s+Command\b/.test(src)
  const usesFlagsHelpers = /\bflags\.(boolean|string|integer|enum|build|option)\(/.test(src)
  const usesFlagsCapital = /\bFlags\.(boolean|string|integer|enum|build|option)\(/.test(src)

  // Replace lower-case `flags.X({...})` (legacy) with `Flags.X({...})` (v4)
  if (usesFlagsHelpers && !usesFlagsCapital) {
    src = src.replace(/\bflags\.(boolean|string|integer|enum|build|option)\(/g, 'Flags.$1(')
  }

  if (usesCommandClass || usesFlagsCapital || /\bFlags\.\w+\(/.test(src)) {
    const hasCommandImport = /from\s+["']@oclif\/core["']/.test(src) && /\bCommand\b/.test(
      src.match(/import\s*\{([^}]+)\}\s*from\s*["']@oclif\/core["']/m)?.[1] ?? '',
    )
    const hasFlagsImport = /import\s*\{[^}]*\bFlags\b[^}]*\}\s*from\s*["']@oclif\/core["']/.test(src)
    const needCommand = usesCommandClass && !hasCommandImport
    const needFlags = /\bFlags\.\w+\(/.test(src) && !hasFlagsImport

    if (needCommand || needFlags) {
      // Build or update the @oclif/core import line
      const coreImportRe = /^import\s*\{([^}]+)\}\s*from\s*["']@oclif\/core["'];?$/m
      const m = src.match(coreImportRe)
      if (m) {
        const existing = m[1].split(',').map((n) => n.trim()).filter(Boolean)
        if (needCommand && !existing.includes('Command')) existing.push('Command')
        if (needFlags && !existing.includes('Flags')) existing.push('Flags')
        const newLine = `import { ${existing.join(', ')} } from '@oclif/core'`
        src = src.replace(coreImportRe, newLine)
      } else {
        const parts = []
        if (needCommand) parts.push('Command')
        if (needFlags) parts.push('Flags')
        src = `import { ${parts.join(', ')} } from '@oclif/core'\n` + src
      }
    }
  }

  // 7. Tidy: collapse multiple blank lines
  src = src.replace(/\n{3,}/g, '\n\n')

  if (src !== original) {
    writeFileSync(file, src)
    touched++
  }
}

console.log(`migrate-oclif: rewrote ${touched} files`)
