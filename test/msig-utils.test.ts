import {strict as assert} from 'node:assert'
import {authorizationKey, parseActions, parseAuthorization, resolveRequestedApprovers} from '../src/utils/multisig'
import type {MultisigAction} from '../src/utils/multisig'

const stubRequiredAccounts = async () => ([
  {actor: 'ruter2', permission: 'active'},
  {actor: 'ruter1', permission: 'active'},
  {actor: 'ruter1', permission: 'active'},
])

describe('multisig utilities', () => {
  it('defaults authorization to active', () => {
    const authorization = parseAuthorization('alice')

    assert.deepEqual(authorization, {actor: 'alice', permission: 'active'})
    assert.equal(authorizationKey(authorization), 'alice@active')
  })

  it('parses explicit permissions', () => {
    assert.deepEqual(parseAuthorization('alice@owner'), {actor: 'alice', permission: 'owner'})
  })

  it('rejects malformed authorization', () => {
    assert.throws(() => parseAuthorization('@active'), /account@permission/)
    assert.throws(() => parseAuthorization(''), /account@permission/)
    assert.throws(() => parseAuthorization('alice@'), /account@permission/)
    assert.throws(() => parseAuthorization('alice@active@extra'), /account@permission/)
  })

  it('requires a non-empty actions array with complete action metadata', () => {
    assert.deepEqual(parseActions('[{"account":"eosio","name":"noop","authorization":[],"data":{}}]'), [{account: 'eosio', name: 'noop', authorization: [], data: {}}])
    assert.throws(() => parseActions('[]'), /non-empty JSON array/)
    assert.throws(() => parseActions('{"account":"eosio"}'), /non-empty JSON array/)
    assert.throws(() => parseActions('[null]'), /each action must be an object/)
    assert.throws(() => parseActions('["action"]'), /each action must be an object/)
    assert.throws(() => parseActions('[{"account":"eosio","authorization":[],"data":{}}]'), /account, name, and authorization/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":{},"data":{}}]'), /account, name, and authorization/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[{"actor":"alice"}],"data":{}}]'), /actor and permission/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[null],"data":{}}]'), /actor and permission/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[{"actor":"","permission":"active"}],"data":{}}]'), /actor and permission/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[{"actor":"alice","permission":""}],"data":{}}]'), /actor and permission/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[]}]'), /each action must include data/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[],"data":null}]'), /each action must include data/)
    assert.throws(() => parseActions('[{"account":"eosio","name":"noop","authorization":[],"data":[]}]'), /each action must include data/)
    assert.throws(() => parseActions('not-json'), /valid JSON/)
  })

  it('resolves, dedupes, and sorts requested approvers', async () => {
    const actions: MultisigAction[] = [{
      account: 'eosio',
      name: 'updateauth',
      authorization: [{actor: 'victorcrisan', permission: 'active'}],
      data: {},
    }]

    assert.deepEqual(await resolveRequestedApprovers(actions, stubRequiredAccounts), [
      {actor: 'ruter1', permission: 'active'},
      {actor: 'ruter2', permission: 'active'},
    ])
  })

  it('rejects unresolvable action authorizations', async () => {
    const actions: MultisigAction[] = [{
      account: 'eosio',
      name: 'noop',
      authorization: [{actor: 'nobody', permission: 'active'}],
      data: {},
    }]

    await assert.rejects(resolveRequestedApprovers(actions, async () => []), /could not resolve required accounts/)
  })

  it('resolves each distinct action authorization only once', async () => {
    const actions: MultisigAction[] = [
      {account: 'eosio', name: 'noop', authorization: [{actor: 'alice', permission: 'active'}], data: {}},
      {account: 'eosio', name: 'noop', authorization: [{actor: 'alice', permission: 'active'}, {actor: 'bob', permission: 'active'}], data: {}},
    ]
    const calls: string[] = []
    const resolver = async (actor: string, permission: string) => {
      calls.push(`${actor}@${permission}`)
      return [{actor, permission}]
    }

    assert.deepEqual(await resolveRequestedApprovers(actions, resolver), [
      {actor: 'alice', permission: 'active'},
      {actor: 'bob', permission: 'active'},
    ])
    assert.deepEqual(calls, ['alice@active', 'bob@active'])
  })

  it('rejects malformed required-account results', async () => {
    const actions: MultisigAction[] = [{
      account: 'eosio',
      name: 'noop',
      authorization: [{actor: 'alice', permission: 'active'}],
      data: {},
    }]

    await assert.rejects(
      resolveRequestedApprovers(actions, async () => ([{actor: '', permission: 'active'}])),
      /account@permission/,
    )
  })
})
