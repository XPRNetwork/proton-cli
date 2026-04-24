import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'
import { CliUx } from '@oclif/core'
import { config, RevealPasswordHash } from './config'

const SCRYPT_PARAMS = { N: 2 ** 15, r: 8, p: 1, keyLen: 64 }
// Scrypt memory cost is ~128 * N * r bytes. For N=2^15, r=8 that's 32 MiB, which
// is exactly at Node's default maxmem. Raise the ceiling so the hash actually runs.
const SCRYPT_MAXMEM = 128 * 1024 * 1024

export function hashRevealPassword(password: string): RevealPasswordHash {
  const salt = randomBytes(32)
  const { N, r, p, keyLen } = SCRYPT_PARAMS
  const hash = scryptSync(password, salt, keyLen, { N, r, p, maxmem: SCRYPT_MAXMEM })
  return {
    salt: salt.toString('hex'),
    hash: hash.toString('hex'),
    N, r, p, keyLen,
  }
}

export function verifyRevealPassword(password: string, stored: RevealPasswordHash): boolean {
  const salt = Buffer.from(stored.salt, 'hex')
  const expected = Buffer.from(stored.hash, 'hex')
  const actual = scryptSync(password, salt, stored.keyLen, { N: stored.N, r: stored.r, p: stored.p, maxmem: SCRYPT_MAXMEM })
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export function isRevealPasswordSet(): boolean {
  return !!config.get('revealPasswordHash')
}

export function getStoredRevealPasswordHash(): RevealPasswordHash | undefined {
  return config.get('revealPasswordHash')
}

export function setRevealPasswordHash(hash: RevealPasswordHash): void {
  config.set('revealPasswordHash', hash)
}

export function clearRevealPasswordHash(): void {
  config.delete('revealPasswordHash' as any)
}

export async function requireRevealPassword(): Promise<void> {
  const stored = getStoredRevealPasswordHash()
  if (!stored) return

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    CliUx.ux.error('Refusing to prompt for the reveal password in a non-TTY stream. Run this in an interactive terminal.')
  }

  const input = await CliUx.ux.prompt('Enter reveal password', { type: 'hide' })
  if (!verifyRevealPassword(input, stored)) {
    CliUx.ux.error('Reveal password is incorrect.')
  }
}
