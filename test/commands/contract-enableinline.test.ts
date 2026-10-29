import {expect, test} from '../helpers/oclif'
import {network} from '../../src/storage/networks'

/* eslint-disable camelcase, unicorn/numeric-separators-style */

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

const K1_A = 'PUB_K1_4uNjyssJ92h8UAu4LTn4HnFQrHkAawKdQaW3zyeX3sGt7naNZd'
const WA_A = 'PUB_WA_2SDwUMxUfDecidG4YwqBKmPjppXzqto9M8gDc7kU9ZsykSpZ1nS3E8d9RcQY4zDXQ8JE'
// Same WebAuthn key bytes and presence as WA_A, but RP ID "z".
const WA_Z = 'PUB_WA_6ncS9eoDC2Sbcp769aEsCVFMPFXY5qVMMCjZKUqgXciqHerFCmvzsn'

const accountFixture = () => ({
  permissions: [
    {
      perm_name: 'owner',
      parent: '',
      required_auth: {threshold: 1, keys: [{key: K1_A, weight: 1}], accounts: [], waits: []},
    },
    {
      perm_name: 'active',
      parent: 'owner',
      required_auth: {
        threshold: 2,
        keys: [
          {key: WA_Z, weight: 1},
          {key: WA_A, weight: 1},
          {key: K1_A, weight: 1},
        ],
        accounts: [
          {permission: {actor: 'ruter1', permission: 'owner'}, weight: 1},
          {permission: {actor: 'ruter1', permission: 'active'}, weight: 1},
        ],
        waits: [
          {wait_sec: 86400, weight: 1},
          {wait_sec: 3600, weight: 1},
        ],
      },
    },
  ],
})

describe('contract:enableinline', () => {
  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.rpc, 'get_account', async () => accountFixture())
  .stdout()
  .command(['contract:enableinline', 'mycontract'])
  .it('sorts the updated authority in chain order', () => {
    const action = transaction.value?.actions[0]
    const auth = action?.data.auth as {
      keys: Array<{key: string; weight: number}>;
      accounts: Array<{permission: {actor: string; permission: string}; weight: number}>;
      waits: Array<{wait_sec: number; weight: number}>;
    }

    expect(action?.account).to.equal('eosio')
    expect(action?.name).to.equal('updateauth')
    expect(auth.keys.map(entry => entry.key)).to.deep.equal([K1_A, WA_A, WA_Z])
    expect(auth.accounts).to.deep.equal([
      {permission: {actor: 'mycontract', permission: 'eosio.code'}, weight: 2},
      {permission: {actor: 'ruter1', permission: 'active'}, weight: 1},
      {permission: {actor: 'ruter1', permission: 'owner'}, weight: 1},
    ])
    expect(auth.waits.map(entry => entry.wait_sec)).to.deep.equal([3600, 86400])
  })
})
