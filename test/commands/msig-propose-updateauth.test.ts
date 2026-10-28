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

const accountWithActive = {
  permissions: [
    {perm_name: 'owner', parent: '', required_auth: {threshold: 1, keys: [], accounts: [], waits: []}},
    {perm_name: 'active', parent: 'owner', required_auth: {threshold: 1, keys: [], accounts: [], waits: []}},
  ],
}

const baseStubs = () => test
.stub(network, 'transact', capture(transaction))
.stub(network.api, 'serializeActions', async (...args: unknown[]) => args[0])
.stub(network.rpc, 'get_account', async () => accountWithActive)
.stub(network.protonApi, 'getChainTable', async () => ({max_transaction_delay: 3600}))
.stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
.stub(network.protonApi, 'getRequiredAccounts', async () => ([
  {actor: 'ruter2', permission: 'active'},
  {actor: 'ruter1', permission: 'active'},
]))

describe('msig:propose-updateauth', () => {
  baseStubs()
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
    expect(ctx.stdout).to.contain('Proposed active authority')
  })

  baseStubs()
  .stdout()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY])
  .it('prints the authority being replaced', ctx => {
    expect(ctx.stdout).to.contain('Current active authority')
  })

  baseStubs()
  .stdout()
  .command(['msig:propose-updateauth', 'newperm', 'victorcrisan', 'ruter1@active', '--permission', 'trading', '--parent', 'active', '--threshold', '1', '--keys', WA_KEY])
  .it('authorizes a new permission with its parent authority', () => {
    const propose = transaction.value?.actions[0]
    const trx = propose?.data.trx as {actions: Array<{account: string; name: string; data: Record<string, unknown>; authorization: Array<{actor: string; permission: string}>}>}
    const updateauth = trx.actions[0]

    expect(updateauth.data.parent).to.equal('active')
    expect(updateauth.authorization).to.deep.equal([{actor: 'victorcrisan', permission: 'active'}])
  })

  baseStubs()
  .stdout()
  .command(['msig:propose-updateauth', 'ownprop', 'victorcrisan', 'ruter1@active', '--permission', 'owner', '--yes', '--threshold', '1', '--keys', WA_KEY])
  .it('replaces owner only with explicit confirmation', ctx => {
    expect(ctx.stdout).to.contain('/msig/ruter1/ownprop')
  })

  baseStubs()
  .command(['msig:propose-updateauth', 'ownprop', 'victorcrisan', 'ruter1@active', '--permission', 'owner', '--threshold', '1', '--keys', WA_KEY])
  .catch(/--yes/)
  .it('refuses to replace owner without confirmation')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--permission', '', '--threshold', '1', '--keys', WA_KEY])
  .catch(/--permission must not be empty/)
  .it('rejects an empty permission instead of defaulting to active')

  baseStubs()
  .command(['msig:propose-updateauth', 'BAD NAME!', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY])
  .catch(/proposal name/)
  .it('rejects an invalid proposal name')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'BAD NAME!', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY])
  .catch(/not a valid EOSIO account name/)
  .it('rejects an invalid account name')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--permission', 'trading', '--parent', 'nosuchperm', '--threshold', '1', '--keys', WA_KEY])
  .catch(/does not exist on account/)
  .it('rejects a parent permission that does not exist on the account')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--permission', 'active', '--parent', 'active', '--threshold', '1', '--keys', WA_KEY])
  .catch(/already has parent/)
  .it('rejects changing the parent of an existing permission')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--permission', 'eosio.code', '--parent', 'active', '--threshold', '1', '--keys', WA_KEY])
  .catch(/reserved/)
  .it('rejects reserved eosio dot permission names')

  baseStubs()
  .stdout()
  .command(['msig:propose-updateauth', 'acctprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY, '--accounts', 'ruter1@active'])
  .it('accepts account authorities that exist on chain', ctx => {
    const propose = transaction.value?.actions[0]
    const trx = propose?.data.trx as {actions: Array<{data: Record<string, unknown>}>}
    const auth = trx.actions[0].data.auth as {accounts: unknown}

    expect(auth.accounts).to.deep.equal([
      {permission: {actor: 'ruter1', permission: 'active'}, weight: 1},
    ])
    expect(ctx.stdout).to.contain('/msig/ruter1/acctprop')
  })

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY, '--accounts', 'ruter1@trading'])
  .catch(/permission "ruter1@trading" does not exist/)
  .it('rejects account authorities whose permission does not exist')

  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.api, 'serializeActions', async (...args: unknown[]) => args[0])
  .stub(network.rpc, 'get_account', async (...args: unknown[]) => {
    if (args[0] === 'victorcrisan') {
      return accountWithActive
    }

    throw new Error('unknown account')
  })
  .stub(network.protonApi, 'getChainTable', async () => ({max_transaction_delay: 3600}))
  .stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
  .stub(network.protonApi, 'getRequiredAccounts', async () => ([
    {actor: 'ruter1', permission: 'active'},
  ]))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY, '--accounts', 'nosuchacct@active'])
  .catch(/account "nosuchacct" does not exist/)
  .it('rejects account authorities whose account does not exist')

  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.api, 'serializeActions', async (...args: unknown[]) => args[0])
  .stub(network.rpc, 'get_account', async (...args: unknown[]) => {
    if (args[0] === 'victorcrisan') {
      return accountWithActive
    }

    throw new Error('fetch failed: request timed out')
  })
  .stub(network.protonApi, 'getChainTable', async () => ({max_transaction_delay: 3600}))
  .stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
  .stub(network.protonApi, 'getRequiredAccounts', async () => ([
    {actor: 'ruter1', permission: 'active'},
  ]))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY, '--accounts', 'ruter2@active'])
  .catch(/request timed out/)
  .it('does not report RPC failures as a missing account')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY, '--waits', '86400'])
  .catch(/maximum transaction delay/)
  .it('rejects waits longer than the chain maximum transaction delay')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', 'PUB_WA_NOTVALID'])
  .catch(/invalid public key/)
  .it('rejects keys the chain cannot decode')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '2', '--keys', `${WA_KEY}:1`])
  .catch(/exceeds total weight/)
  .it('rejects thresholds above the total weight')

  baseStubs()
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1'])
  .catch(/at least one key, account, or wait/)
  .it('rejects empty authorities')

  test
  .stub(network, 'transact', async () => {
    throw new Error('node rejected the transaction')
  })
  .stub(network.api, 'serializeActions', async (...args: unknown[]) => args[0])
  .stub(network.rpc, 'get_account', async () => accountWithActive)
  .stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
  .stub(network.protonApi, 'getRequiredAccounts', async () => ([
    {actor: 'ruter1', permission: 'active'},
  ]))
  .command(['msig:propose-updateauth', 'waprop', 'victorcrisan', 'ruter1@active', '--threshold', '1', '--keys', WA_KEY])
  .catch((error: Error & {oclif?: {exit?: number}}) => {
    expect(error.message).to.contain('node rejected the transaction')
    expect(error.oclif?.exit).to.equal(1)
  })
  .it('exits non-zero when the proposal fails')
})
