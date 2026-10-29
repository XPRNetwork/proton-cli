import {expect, test} from '../helpers/oclif'
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

const captureWithResult = (target: {value?: CapturedTransaction}) => async (...args: unknown[]): Promise<{transaction_id: string}> => {
  target.value = args[0] as CapturedTransaction
  return {transaction_id: 'transaction-id'}
}

const actions = [
  {
    account: 'token',
    name: 'transfer',
    authorization: [{actor: 'charlie', permission: 'active'}],
    data: {from: 'charlie', to: 'bob', quantity: '1.0000 XPR', memo: ''},
  },
  {
    account: 'token',
    name: 'transfer',
    authorization: [{actor: 'alice', permission: 'owner'}],
    data: {from: 'alice', to: 'carol', quantity: '1.0000 XPR', memo: ''},
  },
  {
    account: 'token',
    name: 'transfer',
    authorization: [{actor: 'alice', permission: 'active'}],
    data: {from: 'alice', to: 'dave', quantity: '1.0000 XPR', memo: ''},
  },
]

describe('multisig commands', () => {
  test
  .stub(network, 'transact', capture(transaction))
  .stdout()
  .command([
    'msig:approve',
    'proposer',
    'proposal',
    'requested@owner',
    '--proposal-hash',
    `0x${'00'.repeat(32)}`,
  ])
  .it('approves with the signing authorization as the requested level', () => {
    expect(transaction.value).to.deep.equal({
      actions: [{
        account: 'eosio.msig',
        name: 'approve',
        data: {
          proposer: 'proposer',
          proposal_name: 'proposal',
          level: {actor: 'requested', permission: 'owner'},
          proposal_hash: '00'.repeat(32),
        },
        authorization: [{actor: 'requested', permission: 'owner'}],
      }],
    })
  })

  test
  .stub(network, 'transact', capture(transaction))
  .stdout()
  .command(['msig:approve', 'proposer', 'proposal', 'signer'])
  .it('defaults approval signer and requested level to active', ctx => {
    expect(transaction.value?.actions[0].data).to.deep.equal({
      proposer: 'proposer',
      proposal_name: 'proposal',
      level: {actor: 'signer', permission: 'active'},
    })
    expect(transaction.value?.actions[0].authorization).to.deep.equal([{actor: 'signer', permission: 'active'}])
    expect(ctx.stdout).to.contain('/msig/proposer/proposal')
  })

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:unapprove', 'proposer', 'proposal', 'requested@owner'])
  .it('unapproves with the signing authorization as the requested level', () => {
    expect(transaction.value?.actions[0]).to.deep.equal({
      account: 'eosio.msig',
      name: 'unapprove',
      data: {
        proposer: 'proposer',
        proposal_name: 'proposal',
        level: {actor: 'requested', permission: 'owner'},
      },
      authorization: [{actor: 'requested', permission: 'owner'}],
    })
  })

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:unapprove', 'proposer', 'proposal', 'signer'])
  .it('defaults unapproval level to the signing authorization', () => {
    expect(transaction.value?.actions[0].data.level).to.deep.equal({actor: 'signer', permission: 'active'})
  })

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:invalidate', 'proposer@owner'])
  .it('invalidates proposals for the signing account', () => {
    expect(transaction.value?.actions[0]).to.deep.equal({
      account: 'eosio.msig',
      name: 'invalidate',
      data: {account: 'proposer'},
      authorization: [{actor: 'proposer', permission: 'owner'}],
    })
  })

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:cancel', 'proposal', 'canceler@active', '--proposer', 'proposer'])
  .it('cancels a proposal owned by another account', () => {
    expect(transaction.value?.actions[0]).to.deep.equal({
      account: 'eosio.msig',
      name: 'cancel',
      data: {
        proposer: 'proposer',
        proposal_name: 'proposal',
        canceler: 'canceler',
      },
      authorization: [{actor: 'canceler', permission: 'active'}],
    })
  })

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:cancel', 'proposal', 'canceler@owner'])
  .it('defaults cancel proposer to the signing account', () => {
    expect(transaction.value?.actions[0].data).to.deep.equal({
      proposer: 'canceler',
      proposal_name: 'proposal',
      canceler: 'canceler',
    })
  })

  test
  .stub(network, 'transact', captureWithResult(transaction))
  .stdout()
  .command(['msig:exec', 'proposer', 'proposal', 'executor@active'])
  .it('executes a proposal with the signer as executer and shows the transaction', ctx => {
    expect(transaction.value?.actions[0]).to.deep.equal({
      account: 'eosio.msig',
      name: 'exec',
      data: {
        proposer: 'proposer',
        proposal_name: 'proposal',
        executer: 'executor',
      },
      authorization: [{actor: 'executor', permission: 'active'}],
    })
    expect(ctx.stdout).to.contain('/tx/transaction-id?tab=traces')
  })

  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.api, 'serializeActions', async () => actions)
  .stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
  .stub(network.protonApi, 'getRequiredAccounts', async (...args: unknown[]) => {
    const [actor, permission] = args as [string, string]
    return [{actor, permission}]
  })
  .command(['msig:propose', 'proposal', JSON.stringify(actions), 'proposer@active'])
  .it('deduplicates and sorts proposal approvals by account and permission', () => {
    expect(transaction.value?.actions[0].data.requested).to.deep.equal([
      {actor: 'alice', permission: 'active'},
      {actor: 'alice', permission: 'owner'},
      {actor: 'charlie', permission: 'active'},
    ])
    expect(transaction.value?.actions[0].data.trx).to.deep.equal({
      expiration: '2030-01-01T00:00:00',
      ref_block_num: 1,
      ref_block_prefix: 2,
      actions,
    })
  })

  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.api, 'serializeActions', async () => actions)
  .stub(network.protonApi, 'generateTransactionSettings', async () => ({expiration: '2030-01-01T00:00:00', ref_block_num: 1, ref_block_prefix: 2}))
  .stub(network.protonApi, 'getRequiredAccounts', async () => [])
  .command(['msig:propose', 'proposal', JSON.stringify(actions), 'proposer@active'])
  .catch(/could not resolve required accounts for charlie@active/)
  .it('fails fast when required accounts cannot be resolved')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:approve', 'proposer', 'proposal', 'bad@active@extra'])
  .catch(/authorization must use the account@permission format/)
  .it('rejects malformed command authorization')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:approve', 'proposer', 'proposal', 'bad@active@extra'])
  .catch((error: Error & {oclif?: {exit?: number}}) => {
    expect(error.oclif?.exit).to.equal(1)
  })
  .it('exits non-zero when approval fails')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose', 'proposal', 'not-json', 'proposer@active'])
  .catch(/actions must be valid JSON/)
  .it('rejects malformed proposal actions')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose', 'proposal', '[{"account":"token","name":"transfer","authorization":[{"actor":"alice"}],"data":{}}]', 'proposer@active'])
  .catch(/each authorization must include actor and permission/)
  .it('rejects incomplete action authorization')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:propose', 'proposal', '[{"account":"token","name":"transfer","authorization":[{"actor":"alice","permission":"active"}]}]', 'proposer@active'])
  .catch(/each action must include data/)
  .it('rejects actions without data')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:approve', 'proposer', 'proposal', 'signer', '--proposal-hash', 'abcd'])
  .catch(/--proposal-hash must be exactly 64 hexadecimal characters/)
  .it('rejects proposal hashes with the wrong length')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:approve', 'proposer', 'proposal', 'signer', '--proposal-hash', 'zz'.repeat(32)])
  .catch(/--proposal-hash must be exactly 64 hexadecimal characters/)
  .it('rejects non-hexadecimal proposal hashes')

  // eosio.msig approve/unapprove call require_auth(level), so the approval
  // level must be the declared action authorization. A separate --level
  // could only build transactions the chain rejects.
  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:approve', 'proposer', 'proposal', 'signer@active', '--level', 'requested@owner'])
  .catch(/Nonexistent flag: --level/)
  .it('rejects --level on approve so the level cannot differ from the signer')

  test
  .stub(network, 'transact', capture(transaction))
  .command(['msig:unapprove', 'proposer', 'proposal', 'signer@active', '--level', 'requested@owner'])
  .catch(/Nonexistent flag: --level/)
  .it('rejects --level on unapprove so the level cannot differ from the signer')
})
