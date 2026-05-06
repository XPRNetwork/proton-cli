import { spawn } from 'child_process'
import * as path from 'path'

const BIN = path.resolve(__dirname, '..', '..', 'bin', 'run')

export interface CliResult {
  stdout: string
  stderr: string
  code: number | null
}

export interface CliOptions {
  /** Lines to feed to stdin, joined by newlines. */
  input?: string | string[]
  /** Override env vars for the child. */
  env?: Record<string, string>
  /** Working directory for the child. Defaults to the repo root. */
  cwd?: string
  /** Kill the process after this many milliseconds. */
  timeoutMs?: number
}

/**
 * Run the proton CLI with the given args. Returns stdout, stderr, and exit code.
 * Never throws on non-zero exit — assertions live in the tests.
 */
export function runCli(args: string[], opts: CliOptions = {}): Promise<CliResult> {
  const { input, env, cwd, timeoutMs = 30000 } = opts

  return new Promise((resolve) => {
    const child = spawn(BIN, args, {
      cwd: cwd ?? path.resolve(__dirname, '..', '..'),
      env: { ...process.env, ...(env ?? {}) },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let killed = false

    const timer = setTimeout(() => {
      killed = true
      child.kill('SIGKILL')
    }, timeoutMs)

    child.stdout.on('data', (d) => (stdout += d.toString()))
    child.stderr.on('data', (d) => (stderr += d.toString()))

    if (input !== undefined) {
      const lines = Array.isArray(input) ? input : [input]
      child.stdin.write(lines.join('\n') + '\n')
    }
    child.stdin.end()

    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ stdout, stderr, code: killed ? -1 : code })
    })
  })
}
