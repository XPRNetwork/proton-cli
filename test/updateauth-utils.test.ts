import {strict as assert} from 'node:assert'
import {Serialize} from '@proton/js'

/* eslint-disable camelcase, unicorn/numeric-separators-style */

import {
  buildRequiredAuth,
  buildUpdateAuthAction,
  isValidEosioName,
  parseAccountWeights,
  parseKeyWeights,
  parseWaitWeights,
} from '../src/utils/updateauth'

// Valid fixtures generated with @proton/js Numeric.publicKeyToString.
const K1_A = 'PUB_K1_4uNjyssJ92h8UAu4LTn4HnFQrHkAawKdQaW3zyeX3sGt7naNZd'
const K1_B = 'PUB_K1_6RMs4EQmLZ5SAwdDXTfepSm1FRNmExAMr6YehRKjHqJWh8h6k5'
const WA_A = 'PUB_WA_2SDwUMxUfDecidG4YwqBKmPjppXzqto9M8gDc7kU9ZsykSpZ1nS3E8d9RcQY4zDXQ8JE'
// Same WebAuthn key bytes and presence as WA_A, but RP ID "z" instead of "webauth.com".
const WA_Z = 'PUB_WA_6ncS9eoDC2Sbcp769aEsCVFMPFXY5qVMMCjZKUqgXciqHerFCmvzsn'

describe('updateauth utilities', () => {
  it('parses keys with a default weight of 1', () => {
    assert.deepEqual(parseKeyWeights(`${K1_A},${WA_A}:2`), [
      {key: K1_A, weight: 1},
      {key: WA_A, weight: 2},
    ])
  })

  it('rejects keys the chain cannot decode', () => {
    assert.throws(() => parseKeyWeights('PUB_WA_NOTVALID'), /invalid public key/)
    assert.throws(() => parseKeyWeights('PUB_WA_3MJeEJyy1g3bnX5KBuZegGiGDcJHrrHSgvFpsYxqb6g97uaQTd2kE31rPUeDZTeDsjVq'), /invalid public key/)
  })

  it('rejects malformed WebAuthn public key payloads', () => {
    // RP ID length byte declares 20 bytes but only one byte follows.
    assert.throws(() => parseKeyWeights('PUB_WA_6ncS9eoDC2Sbcp769aEsCVFMPFXY5qVMMCjZKUqgXciqHf1fALogVe'), /invalid public key/)
  })

  it('does not echo a mistakenly supplied private key in errors', () => {
    const secret = 'PVT_K1_notarealprivatekeyvalue1234567890'
    assert.throws(() => parseKeyWeights(secret), (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.match(error.message, /invalid public key/)
      assert.ok(!error.message.includes(secret))
      return true
    })
  })

  it('rejects non-positive key weights', () => {
    assert.throws(() => parseKeyWeights(`${K1_A}:0`), /weight/)
    assert.throws(() => parseKeyWeights(`${K1_A}:abc`), /weight/)
  })

  it('parses accounts with default active permission and weight 1', () => {
    assert.deepEqual(parseAccountWeights('ruter1,ruter2@active:2'), [
      {permission: {actor: 'ruter1', permission: 'active'}, weight: 1},
      {permission: {actor: 'ruter2', permission: 'active'}, weight: 2},
    ])
  })

  it('parses waits with default weight 1', () => {
    assert.deepEqual(parseWaitWeights('86400,3600:2'), [
      {wait_sec: 86400, weight: 1},
      {wait_sec: 3600, weight: 2},
    ])
  })

  it('builds a threshold-1 WebAuthn authority', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${WA_A}:1`})

    assert.equal(requiredAuth.threshold, 1)
    assert.deepEqual(requiredAuth.keys, [{key: WA_A, weight: 1}])
    assert.deepEqual(requiredAuth.accounts, [])
    assert.deepEqual(requiredAuth.waits, [])
  })

  it('sorts keys deterministically', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_B}:1,${K1_A}:1`})

    // '4uNj…' orders before '6RMs…' regardless of input order.
    assert.deepEqual(requiredAuth.keys.map(entry => entry.key), [K1_A, K1_B])
  })

  it('rejects malformed account entries', () => {
    assert.throws(() => parseAccountWeights('ruter1@active:'), /invalid permission/)
    assert.throws(() => parseAccountWeights('ruter1@foo!'), /invalid permission/)
    assert.throws(() => parseAccountWeights('no@such@perm:1'), /account@permission/)
  })

  it('accepts 13-character names with a valid final character', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`})
    const action = buildUpdateAuthAction({account: 'abcdefghij123', permission: 'active', auth: requiredAuth})

    assert.equal((action.authorization as Array<{actor: string}>)[0].actor, 'abcdefghij123')
    assert.throws(() => buildUpdateAuthAction({account: 'abcdefghij1234', permission: 'active', auth: requiredAuth}), /not a valid EOSIO account name/)
    assert.throws(() => buildUpdateAuthAction({account: 'abcdefghij123', permission: 'abcdefghijklm', auth: requiredAuth}), /not a valid permission name/)
  })

  it('rejects unusable authorities', () => {
    assert.throws(() => buildRequiredAuth({threshold: 1}), /at least one key, account, or wait/)
    assert.throws(() => buildRequiredAuth({threshold: 0, keys: `${K1_A}:1`}), /threshold/)
    assert.throws(() => buildRequiredAuth({threshold: 2, keys: `${K1_A}:1`}), /exceeds total weight/)
  })

  it('builds an updateauth action authorized by the updated permission', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${WA_A}:1`})
    const action = buildUpdateAuthAction({account: 'victorcrisan', permission: 'active', auth: requiredAuth})

    assert.deepEqual(action, {
      account: 'eosio',
      name: 'updateauth',
      authorization: [{actor: 'victorcrisan', permission: 'active'}],
      data: {
        account: 'victorcrisan',
        permission: 'active',
        parent: 'owner',
        auth: {
          threshold: 1,
          keys: [{key: WA_A, weight: 1}],
          accounts: [],
          waits: [],
        },
      },
    })
  })

  it('stores owner authorities without a parent', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`})
    const action = buildUpdateAuthAction({account: 'victorcrisan', permission: 'owner', auth: requiredAuth})

    assert.equal((action.data as {parent: string}).parent, '')
  })

  it('rejects permissions that name themselves as parent', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`})

    assert.throws(() => buildUpdateAuthAction({account: 'victorcrisan', permission: 'active', parent: 'active', auth: requiredAuth}), /parent/)
  })

  it('sorts multiple waits numerically', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`, waits: '86400,3600:2'})

    assert.deepEqual(requiredAuth.waits.map(entry => entry.wait_sec), [3600, 86400])
  })

  it('sorts WebAuthn keys by RP ID content, not serialized length', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${WA_Z}:1,${WA_A}:1`})

    // "webauth.com" sorts before "z" even though its length byte is larger.
    assert.deepEqual(requiredAuth.keys.map(entry => entry.key), [WA_A, WA_Z])
  })

  it('sorts mixed key types by type then bytes', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${WA_A}:1,${K1_A}:1`})

    assert.deepEqual(requiredAuth.keys.map(entry => entry.key), [K1_A, WA_A])
  })

  it('sorts several permissions of one actor by permission name', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, accounts: 'ruter1@owner,ruter1@active'})

    assert.deepEqual(requiredAuth.accounts.map(entry => entry.permission.permission), ['active', 'owner'])
  })

  it('rejects duplicate keys, accounts, and waits', () => {
    assert.throws(() => buildRequiredAuth({threshold: 1, keys: `${K1_A}:1,${K1_A}:2`}), /duplicate key/)
    assert.throws(() => buildRequiredAuth({threshold: 1, accounts: 'ruter1@active,ruter1@active:2'}), /duplicate account/)
    assert.throws(() => buildRequiredAuth({threshold: 1, accounts: 'ruter1,ruter1@active:2'}), /duplicate account/)
    assert.throws(() => buildRequiredAuth({threshold: 1, accounts: 'ruter1@active,ruter1@active.'}), /invalid permission/)
    assert.throws(() => buildRequiredAuth({threshold: 1, waits: '3600,3600:2'}), /duplicate delay/)
  })

  it('rejects weights above uint16', () => {
    assert.throws(() => buildRequiredAuth({threshold: 1, keys: `${K1_A}:65536`}), /between 1 and 65535/)
  })

  it('rejects zero and out-of-range wait delays', () => {
    assert.throws(() => buildRequiredAuth({threshold: 1, waits: '0'}), /between 1 and 4294967295/)
    assert.throws(() => buildRequiredAuth({threshold: 1, waits: '4294967296'}), /between 1 and 4294967295/)
  })

  it('rejects thresholds above uint32', () => {
    assert.throws(() => buildRequiredAuth({threshold: 4294967296, keys: `${K1_A}:1`}), /between 1 and 4294967295/)
  })

  it('requires an explicit parent for custom permissions', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`})

    assert.throws(() => buildUpdateAuthAction({account: 'victorcrisan', permission: 'trading', auth: requiredAuth}), /explicit --parent/)
    const action = buildUpdateAuthAction({account: 'victorcrisan', permission: 'trading', parent: 'active', auth: requiredAuth})

    assert.equal((action.data as {parent: string}).parent, 'active')
  })

  it('validates EOSIO names', () => {
    assert.equal(isValidEosioName('victorcrisan'), true)
    assert.equal(isValidEosioName('eosio.msig'), true)
    assert.equal(isValidEosioName(''), false)
    assert.equal(isValidEosioName('BAD NAME!'), false)
    assert.equal(isValidEosioName('abcdefghijklm'), false)
  })

  it('authorizes the action with an explicit action permission', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`})
    const action = buildUpdateAuthAction({account: 'victorcrisan', permission: 'trading', parent: 'active', auth: requiredAuth, actionPermission: 'active'})

    assert.deepEqual(action.authorization, [{actor: 'victorcrisan', permission: 'active'}])
    assert.throws(() => buildUpdateAuthAction({account: 'victorcrisan', permission: 'trading', parent: 'active', auth: requiredAuth, actionPermission: 'bad!'}), /action permission/)
  })

  it('serializes updateauth data against the system ABI shape', () => {
    const abi = {
      version: 'eosio::abi/1.1',
      types: [],
      structs: [
        {name: 'permission_level', base: '', fields: [{name: 'actor', type: 'name'}, {name: 'permission', type: 'name'}]},
        {name: 'key_weight', base: '', fields: [{name: 'key', type: 'public_key'}, {name: 'weight', type: 'uint16'}]},
        {name: 'permission_level_weight', base: '', fields: [{name: 'permission', type: 'permission_level'}, {name: 'weight', type: 'uint16'}]},
        {name: 'wait_weight', base: '', fields: [{name: 'wait_sec', type: 'uint32'}, {name: 'weight', type: 'uint16'}]},
        {name: 'authority', base: '', fields: [{name: 'threshold', type: 'uint32'}, {name: 'keys', type: 'key_weight[]'}, {name: 'accounts', type: 'permission_level_weight[]'}, {name: 'waits', type: 'wait_weight[]'}]},
        {name: 'updateauth', base: '', fields: [{name: 'account', type: 'name'}, {name: 'permission', type: 'name'}, {name: 'parent', type: 'name'}, {name: 'auth', type: 'authority'}]},
      ],
      actions: [{name: 'updateauth', type: 'updateauth', ricardian_contract: ''}],
      tables: [],
      ricardian_clauses: [],
      error_messages: [],
      abi_extensions: [],
      variants: [],
    }
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${WA_A}:1`, accounts: 'ruter1@active', waits: '3600'})
    const action = buildUpdateAuthAction({account: 'victorcrisan', permission: 'active', auth: requiredAuth})
    const types = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), abi as never)
    const buffer = new Serialize.SerialBuffer()
    types.get('updateauth')?.serialize(buffer, action.data)
    const decoded = types.get('updateauth')?.deserialize(new Serialize.SerialBuffer({array: buffer.asUint8Array()}))

    assert.deepEqual(decoded, action.data)
  })

  it('rejects non-canonical trailing-dot names', () => {
    assert.equal(isValidEosioName('.'), false)
    assert.equal(isValidEosioName('active.'), false)
    assert.equal(isValidEosioName('victorcrisan.'), false)
  })

  it('rejects authorities that waits alone can satisfy', () => {
    assert.throws(() => buildRequiredAuth({threshold: 1, waits: '3600:1'}), /waits alone/)
    assert.throws(() => buildRequiredAuth({threshold: 2, keys: `${K1_A}:1`, waits: '3600:1'}), /waits alone/)
  })

  it('rejects reserved, self-referential, and invalid direct authorities', () => {
    const requiredAuth = buildRequiredAuth({threshold: 1, keys: `${K1_A}:1`})
    const selfReferential = buildRequiredAuth({threshold: 1, accounts: 'victorcrisan@active'})

    assert.throws(() => buildUpdateAuthAction({account: 'victorcrisan', permission: 'eosio.code', parent: 'active', auth: requiredAuth}), /reserved/)
    assert.throws(() => buildUpdateAuthAction({account: 'victorcrisan', permission: 'active', parent: 'trading', auth: requiredAuth}), /active permission parent must be owner/)
    assert.throws(() => buildUpdateAuthAction({account: 'victorcrisan', permission: 'active', auth: selfReferential}), /cannot authorize itself/)
    assert.throws(() => buildUpdateAuthAction({
      account: 'victorcrisan',
      permission: 'active',
      auth: {threshold: 1, keys: [], accounts: [], waits: []},
    }), /at least one key, account, or wait/)
    assert.throws(() => buildUpdateAuthAction({
      account: 'victorcrisan',
      permission: 'active',
      auth: {
        threshold: 1,
        keys: [{key: K1_A, weight: 1}],
        accounts: [],
        waits: Array.from({length: 65536}, (_, index) => ({wait_sec: index + 1, weight: 1})),
      },
    }), /at most 65536/)
  })
})
