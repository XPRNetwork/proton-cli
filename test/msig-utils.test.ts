import {strict as assert} from 'node:assert'
import {authorizationKey, parseActions, parseAuthorization} from '../src/utils/multisig'

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
    assert.throws(() => parseActions('not-json'), /valid JSON/)
  })
})
