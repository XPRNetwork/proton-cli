import { ux } from '../utils/ux'
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

import { config, RevealPasswordHash } from './config'

const SCRYPT_PARAMS = { N: 2 ** 15, r: 8, p: 1, keyLen: 64 }
// Scrypt memory cost is ~128 * N * r bytes. For N=2^15, r=8 that's 32 MiB, which
// is exactly at Node's default maxmem. Raise the ceiling so the hash actually runs.
const SCRYPT_MAXMEM = 128 * 1024 * 1024

// Bounds for stored scrypt parameters. A tampered config could otherwise pin
// the verifier to extreme values that cause local DoS or excessive memory use.
const PARAM_BOUNDS = {
  N: { min: 1 << 10, max: 1 << 20 }, // 1 KiB cost factor up to 1 Mi
  r: { min: 1, max: 32 },
  p: { min: 1, max: 16 },
  keyLen: { min: 16, max: 128 },
  saltHexLen: { min: 16, max: 256 },
  hashHexLen: { min: 32, max: 256 },
}

function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0
}

function validateStoredHash(stored: RevealPasswordHash): void {
  const { N, r, p, keyLen, salt, hash } = stored
  if (!isPowerOfTwo(N) || N < PARAM_BOUNDS.N.min || N > PARAM_BOUNDS.N.max) {
    throw new Error(`Invalid scrypt N parameter (${N}) in stored reveal password.`)
  }
  if (!Number.isInteger(r) || r < PARAM_BOUNDS.r.min || r > PARAM_BOUNDS.r.max) {
    throw new Error(`Invalid scrypt r parameter (${r}) in stored reveal password.`)
  }
  if (!Number.isInteger(p) || p < PARAM_BOUNDS.p.min || p > PARAM_BOUNDS.p.max) {
    throw new Error(`Invalid scrypt p parameter (${p}) in stored reveal password.`)
  }
  if (!Number.isInteger(keyLen) || keyLen < PARAM_BOUNDS.keyLen.min || keyLen > PARAM_BOUNDS.keyLen.max) {
    throw new Error(`Invalid scrypt keyLen (${keyLen}) in stored reveal password.`)
  }
  if (typeof salt !== 'string' || !/^[0-9a-fA-F]+$/.test(salt) || salt.length < PARAM_BOUNDS.saltHexLen.min || salt.length > PARAM_BOUNDS.saltHexLen.max) {
    throw new Error('Invalid salt encoding in stored reveal password.')
  }
  if (typeof hash !== 'string' || !/^[0-9a-fA-F]+$/.test(hash) || hash.length < PARAM_BOUNDS.hashHexLen.min || hash.length > PARAM_BOUNDS.hashHexLen.max) {
    throw new Error('Invalid hash encoding in stored reveal password.')
  }
}

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
  validateStoredHash(stored)
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
  config.delete('revealPasswordHash')
}

export async function requireRevealPassword(): Promise<void> {
  const stored = getStoredRevealPasswordHash()
  if (!stored) return

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    ux.error('Refusing to prompt for the reveal password in a non-TTY stream. Run this in an interactive terminal.')
  }

  const input = await ux.prompt('Enter reveal password', { type: 'hide' })
  let ok: boolean
  try {
    ok = verifyRevealPassword(input, stored)
  } catch (err) {
    ux.error(`Stored reveal password configuration is invalid: ${(err as Error).message}\nRun \`proton key:reveal-disable\` and then \`proton key:reveal-setup\` to reset it.`)
    return
  }
  if (!ok) {
    ux.error('Reveal password is incorrect.')
  }
}
