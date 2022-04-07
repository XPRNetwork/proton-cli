import {expect, test} from '@oclif/test'
import { CliUx } from '@oclif/core'
import {getRpc, getApi} from '../../src/networks'

describe('network', () => {
  test
  .stub(CliUx.ux, 'prompt', () => async () => 'proton-test')
  .stdout()
  .command(['network'])
  .it('RPC and API were set', async ctx => {
    expect(await getRpc()).to.be.ok
    expect((await getApi()).api).to.be.ok
    expect(JSON.parse(ctx.stdout)).to.be.deep.equal({
      chain: 'proton-test',
      endpoints: [
        'https://protontestnet.greymass.com',
      ],
    })
  })
})
