import {strict as assert} from 'node:assert'
import {hashRevealPassword, verifyRevealPassword} from '../src/storage/revealPassword'
import {CONFIRMATION_PHRASE} from '../src/storage/confirmation'

describe('reveal password', () => {
  it('hashes to hex-encoded salt and hash with recorded scrypt parameters', () => {
    const result = hashRevealPassword('correct horse battery staple')
    assert.match(result.salt, /^[\da-f]+$/)
    assert.match(result.hash, /^[\da-f]+$/)
    assert.equal(typeof result.r, 'number')
    assert.equal(typeof result.p, 'number')
    assert.equal(typeof result.keyLen, 'number')
    // scrypt requires N to be a power of two
    assert.equal(result.N & (result.N - 1), 0)
  })

  it('uses a fresh salt on every call', () => {
    const first = hashRevealPassword('same-password')
    const second = hashRevealPassword('same-password')
    assert.notEqual(first.salt, second.salt)
    assert.notEqual(first.hash, second.hash)
  })

  it('verifies only the exact password', () => {
    const stored = hashRevealPassword('letmein')
    assert.equal(verifyRevealPassword('letmein', stored), true)
    assert.equal(verifyRevealPassword('letmeout', stored), false)
    assert.equal(verifyRevealPassword('', stored), false)
    assert.equal(verifyRevealPassword(' letmein', stored), false)
    assert.equal(verifyRevealPassword('letmein\n', stored), false)
  })

  it('keeps the confirmation phrase stable', () => {
    // Users are told to type this exact phrase, so changing it is a breaking change
    assert.equal(CONFIRMATION_PHRASE, 'I UNDERSTAND')
  })
})
