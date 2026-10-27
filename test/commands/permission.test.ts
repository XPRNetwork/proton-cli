/* eslint-disable camelcase, unicorn/numeric-separators-style, no-restricted-imports, @typescript-eslint/no-empty-function */
import {expect, test} from '@oclif/test'
import {CliUx} from '@oclif/core'
import {green} from 'colors'
import * as lightApi from '../../src/apis/lightApi'
import {network} from '../../src/storage/networks'
import * as promptUtils from '../../src/utils/prompt'
import * as waitUtils from '../../src/utils/wait'

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
        threshold: 1,
        keys: [{key: WA_Z, weight: 1}],
        accounts: [{permission: {actor: 'ruter1', permission: 'owner'}, weight: 1}],
        waits: [
          {wait_sec: 86400, weight: 1},
          {wait_sec: 3600, weight: 1},
        ],
      },
    },
  ],
})

const originalPrompt = Object.getOwnPropertyDescriptor(CliUx.ux, 'prompt')
let choiceCalls = 0
const choose = async () => {
  choiceCalls++
  if (choiceCalls === 1) return 'active'
  if (choiceCalls === 2) return 'Add New Key'
  if (choiceCalls === 3) return 'Add New Account'
  if (choiceCalls === 4) return green('Save')
  throw new Error('stop test')
}

describe('permission', () => {
  test
  .stub(network, 'transact', capture(transaction))
  .stub(network.rpc, 'get_account', async () => accountFixture())
  .stub(lightApi, 'getLightAccount', async () => ({linkauth: []}))
  .stub(promptUtils, 'promptChoices', choose)
  .stub(promptUtils, 'promptInteger', async () => 1)
  .stub(promptUtils, 'promptKey', async () => WA_A)
  .stub(promptUtils, 'promptAuthority', async () => ({actor: 'ruter1', permission: 'active'}))
  .do(() => {
    Object.defineProperty(CliUx.ux, 'prompt', {value: async () => 'victorcrisan@active', configurable: true})
  })
  .finally(() => {
    if (originalPrompt) {
      Object.defineProperty(CliUx.ux, 'prompt', originalPrompt)
    }
  })
  .stub(waitUtils, 'wait', async () => {})
  .stdout()
  .command(['permission', 'victorcrisan'])
  .catch(/stop test/)
  .it('sorts the edited authority in chain order when saving', () => {
    const action = transaction.value?.actions[0]
    const auth = action?.data.auth as {
      keys: Array<{key: string; weight: number}>;
      accounts: Array<{permission: {actor: string; permission: string}; weight: number}>;
      waits: Array<{wait_sec: number; weight: number}>;
    }

    expect(action?.account).to.equal('eosio')
    expect(action?.name).to.equal('updateauth')
    expect(auth.keys.map(entry => entry.key)).to.deep.equal([WA_A, WA_Z])
    expect(auth.accounts).to.deep.equal([
      {permission: {actor: 'ruter1', permission: 'active'}, weight: 1},
      {permission: {actor: 'ruter1', permission: 'owner'}, weight: 1},
    ])
    expect(auth.waits.map(entry => entry.wait_sec)).to.deep.equal([3600, 86400])
  })
})
