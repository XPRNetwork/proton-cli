import { expect } from 'chai'
import { CONFIRMATION_PHRASE } from '../../src/storage/confirmation'

describe('confirmation', () => {
  it('exports the expected phrase', () => {
    // The exact value matters for documentation and user instructions —
    // changing it is a user-facing breaking change.
    expect(CONFIRMATION_PHRASE).to.equal('I UNDERSTAND')
  })

  it('is a non-empty case-sensitive string', () => {
    expect(CONFIRMATION_PHRASE).to.be.a('string')
    expect(CONFIRMATION_PHRASE.length).to.be.greaterThan(0)
    expect(CONFIRMATION_PHRASE).to.equal(CONFIRMATION_PHRASE.toUpperCase())
  })
})
