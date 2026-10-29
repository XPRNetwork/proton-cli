import {expect, test} from '../helpers/oclif'

describe('network', () => {
  test
  .stdout()
  .command(['network'])
  .it('prints the current network', ctx => {
    expect(ctx.stdout).to.contain('Current Network:')
    expect(ctx.stdout).to.contain('chain')
    expect(ctx.stdout).to.contain('endpoints')
  })
})
