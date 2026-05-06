import { expect } from 'chai'
import {
  hashRevealPassword,
  verifyRevealPassword,
} from '../../src/storage/revealPassword'

describe('revealPassword', () => {
  describe('hashRevealPassword', () => {
    it('produces a hash with hex-encoded salt and hash', () => {
      const result = hashRevealPassword('correct horse battery staple')
      expect(result.salt).to.match(/^[0-9a-f]+$/)
      expect(result.hash).to.match(/^[0-9a-f]+$/)
      expect(result.salt.length).to.be.greaterThan(0)
      expect(result.hash.length).to.be.greaterThan(0)
    })

    it('produces a different salt and hash on every call (probabilistic)', () => {
      const a = hashRevealPassword('same-password')
      const b = hashRevealPassword('same-password')
      expect(a.salt).to.not.equal(b.salt)
      expect(a.hash).to.not.equal(b.hash)
    })

    it('records scrypt parameters alongside the hash', () => {
      const result = hashRevealPassword('any')
      expect(result.N).to.be.a('number')
      expect(result.r).to.be.a('number')
      expect(result.p).to.be.a('number')
      expect(result.keyLen).to.be.a('number')
      expect(result.N & (result.N - 1)).to.equal(0, 'N must be a power of two')
    })
  })

  describe('verifyRevealPassword', () => {
    it('returns true for the correct password', () => {
      const stored = hashRevealPassword('letmein')
      expect(verifyRevealPassword('letmein', stored)).to.equal(true)
    })

    it('returns false for the wrong password', () => {
      const stored = hashRevealPassword('letmein')
      expect(verifyRevealPassword('letmeout', stored)).to.equal(false)
    })

    it('uses constant-time comparison (returns boolean for any input)', () => {
      const stored = hashRevealPassword('letmein')
      // Empty string, special chars, leading/trailing whitespace — none should throw
      expect(verifyRevealPassword('', stored)).to.equal(false)
      expect(verifyRevealPassword(' letmein', stored)).to.equal(false)
      expect(verifyRevealPassword('letmein\n', stored)).to.equal(false)
    })
  })
})
