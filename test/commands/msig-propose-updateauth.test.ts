import {expect, test} from '@oclif/test'
import {network} from '../../src/storage/networks'

/* eslint-disable camelcase */

type CapturedAction = {
  account: string;
  name: string;
  data: Record<string, unknown>;
  authorization: Array<{actor: string; permission: string}>;
};

type CapturedTransaction = {
  actions: CapturedAction[];
};

const transaction: {value?: CapturedTransaction} = {}
const capture = <T>(target: {value?: T}) => async (...args: unknown[]): Promise<void> => {
  target.value = args[0] as T
}

const WA_KEY = 'PUB_WA_2SDwUMxUfDecidG4YwqBKmPjppXzqto9M8gDc7kU9ZsykSpZ1nS3E8d9RcQY4zDXQ8JE'

describe('msig:propose-updateauth', () => {
  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.api, 'serializeActions', async (...args: unknown[]) => args[0])
  .stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
  .stub(network.protonApi, 'getRequiredAccounts', async () => ([
    {actor: 'ruter2', permission: 'active'},
    {actor: 'ruter1', permission: 'active'},
  ]))
  .stdout()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY])
  .it('proposes replacing active with a single WebAuthn key', ctx => {
    const propose = transaction.value?.actions[0]
    const trx = propose?.data.trx as {actions: Array<{account: string; name: string; data: Record<string, unknown>}>}
    const updateauth = trx.actions[0]

    expect(propose?.account).to.equal('eosio.msig')
    expect(propose?.name).to.equal('propose')
    expect(propose?.data.proposer).to.equal('ruter1')
    expect(propose?.data.proposal_name).to.equal('waprop')
    expect(propose?.data.requested).to.deep.equal([
      {actor: 'ruter1', permission: 'active'},
      {actor: 'ruter2', permission: 'active'},
    ])
    expect(updateauth.account).to.equal('eosio')
    expect(updateauth.name).to.equal('updateauth')
    expect(updateauth.data.account).to.equal('victorcrisan')
    expect(updateauth.data.permission).to.equal('active')
    expect(updateauth.data.parent).to.equal('owner')
    expect((updateauth.data.auth as {threshold: number}).threshold).to.equal(1)
    expect((updateauth.data.auth as {keys: unknown}).keys).to.deep.equal([{key: WA_KEY, weight: 1}])
    expect(ctx.stdout).to.contain('/msig/ruter1/waprop')
  })

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', 'PUB_WA_NOTVALID'])
  .catch(/invalid public key/)
  .it('rejects keys the chain cannot decode')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '2', '--keys', `${WA_KEY}:1`])
  .catch(/exceeds total weight/)
  .it('rejects thresholds above the total weight')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1'])
  .catch(/at least one key, account, or wait/)
  .it('rejects empty authorities')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1'])
  .catch((error: Error & {oclif?: {exit?: number}}) => {
    expect(error.oclif?.exit).to.equal(1)
  })
  .it('exits non-zero when the proposal fails')
})
