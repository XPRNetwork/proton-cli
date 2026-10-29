import {spawn} from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

// bin/dev runs commands from src via ts-node, so no build is needed
const BIN = path.resolve(__dirname, '..', '..', 'bin', 'dev')

export interface CliResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

// Temp HOME so the CLI's Conf store is isolated from the user's real wallet
export const isolatedHome = (): {dir: string; env: Record<string, string>} => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proton-cli-test-'))
  return {
    dir,
    env: {
      HOME: dir,
      XDG_CONFIG_HOME: path.join(dir, '.config'),
      XDG_DATA_HOME: path.join(dir, '.local', 'share'),
      XDG_CACHE_HOME: path.join(dir, '.cache'),
    },
  }
}

export const cleanupHome = (dir: string): void => {
  fs.rmSync(dir, {recursive: true, force: true})
}

// Run the CLI in a child process. Never rejects on a non-zero exit; tests assert on the result
export const runCli = (args: string[], options: {env?: Record<string, string>; input?: string} = {}): Promise<CliResult> =>
  new Promise(resolve => {
    const child = spawn(BIN, args, {
      cwd: path.resolve(__dirname, '..', '..'),
      env: {...process.env, ...options.env},
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', data => {
      stdout += data.toString()
    })
    child.stderr.on('data', data => {
      stderr += data.toString()
    })

    if (options.input !== undefined) {
      child.stdin.write(options.input)
    }

    child.stdin.end()
    child.on('close', code => resolve({stdout, stderr, code}))
  })
