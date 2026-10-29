import {strict as assert} from 'node:assert'
import {encryptor} from '../src/storage/encryptor'

const KEY = '0123456789abcdef0123456789abcdef'
const OTHER_KEY = 'abcdef0123456789abcdef0123456789'

describe('encryptor', () => {
  it('round-trips a string in iv:ciphertext format', () => {
    const plain = 'PVT_K1_example_pretend_private_key'
    const ciphertext = encryptor.encrypt(KEY, plain)
    assert.notEqual(ciphertext, plain)
    assert.ok(ciphertext.includes(':'))
    assert.equal(encryptor.decrypt(KEY, ciphertext), plain)
  })

  it('uses a random IV, so repeat encryptions differ', () => {
    const first = encryptor.encrypt(KEY, 'same input')
    const second = encryptor.encrypt(KEY, 'same input')
    assert.notEqual(first, second)
    assert.equal(encryptor.decrypt(KEY, first), 'same input')
    assert.equal(encryptor.decrypt(KEY, second), 'same input')
  })

  it('does not recover the plaintext with the wrong key', () => {
    const ciphertext = encryptor.encrypt(KEY, 'secret')
    let recovered: string | undefined
    try {
      recovered = encryptor.decrypt(OTHER_KEY, ciphertext)
    } catch {
      recovered = undefined
    }

    assert.notEqual(recovered, 'secret')
  })

  it('handles empty and unicode content', () => {
    assert.equal(encryptor.decrypt(KEY, encryptor.encrypt(KEY, '')), '')
    const unicode = '🔑 PVT_K1_💀\n  — special'
    assert.equal(encryptor.decrypt(KEY, encryptor.encrypt(KEY, unicode)), unicode)
  })
})
