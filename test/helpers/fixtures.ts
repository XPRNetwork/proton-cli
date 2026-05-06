import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

/**
 * Create a fresh tempdir to use as HOME so the CLI's Conf instance
 * writes to an isolated config rather than the user's real one.
 *
 * Returns an env override map ready to spread into runCli's env option.
 */
export function isolatedHome(): { dir: string; env: Record<string, string> } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proton-cli-test-'))

  // Conf resolves config paths from XDG_CONFIG_HOME or platform defaults
  // anchored on HOME. Overriding HOME alone is sufficient on macOS and
  // Linux for the test process.
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

/** Recursively remove a tempdir created by isolatedHome. */
export function cleanupHome(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true })
}
