import {expect, test} from '@oclif/test'

describe('network', () => {
  test
  .stdout()
  .command(['network'])
  .it('prints the current network', ctx => {
    expect(ctx.stdout).to.contain('Current Network:')
  })
})
