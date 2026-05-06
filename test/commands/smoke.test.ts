import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import { pathToFileURL } from 'url'

// Mocha runs tests from the project root, so resolve relative to cwd.
const COMMANDS_DIR = path.resolve(process.cwd(), 'src', 'commands')

function walkTsFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkTsFiles(full, acc)
    else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      acc.push(full)
    }
  }
  return acc
}

describe('command registration smoke', () => {
  const files = walkTsFiles(COMMANDS_DIR)

  it('discovers at least 30 command files', () => {
    expect(files.length).to.be.greaterThan(30)
  })

  for (const file of files) {
    const relative = path.relative(COMMANDS_DIR, file)

    it(`loads ${relative}`, async () => {
      let mod: any
      try {
        mod = await import(pathToFileURL(file).href)
      } catch (err) {
        throw new Error(`Failed to import ${relative}: ${(err as Error).message}`)
      }

      const Cmd = mod.default
      expect(Cmd, `${relative} must default-export a class`).to.exist
      expect(Cmd, `${relative} default export must be a constructor`).to.be.a('function')
    })

    it(`${relative} declares a description`, async () => {
      const mod = await import(pathToFileURL(file).href)
      const Cmd = mod.default
      const hasDescription = Cmd && (typeof Cmd.description === 'string' || Cmd.prototype?.description)
      expect(hasDescription, `${relative} should declare a description (helps users understand the command)`).to.be.ok
    })
  }
})
