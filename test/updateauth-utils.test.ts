import {strict as assert} from 'node:assert'

/* eslint-disable camelcase, unicorn/numeric-separators-style */

import {
  buildUpdateauthAction,
  buildUpdateauthAuth,
  parseAccountWeights,
  parseKeyWeights,
  parseWaitWeights,
} from '../src/utils/updateauth'

// Valid fixtures generated with @proton/js Numeric.publicKeyToString.
const K1_A = 'PUB_K1_4uNjyssJ92h8UAu4LTn4HnFQrHkAawKdQaW3zyeX3sGt7naNZd'
const K1_B = 'PUB_K1_6RMs4EQmLZ5SAwdDXTfepSm1FRNmExAMr6YehRKjHqJWh8h6k5'
const WA_A = 'PUB_WA_2SDwUMxUfDecidG4YwqBKmPjppXzqto9M8gDc7kU9ZsykSpZ1nS3E8d9RcQY4zDXQ8JE'

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
    const auth = buildUpdateauthAuth({threshold: 1, keys: `${WA_A}:1`})

    assert.equal(auth.threshold, 1)
    assert.deepEqual(auth.keys, [{key: WA_A, weight: 1}])
    assert.deepEqual(auth.accounts, [])
    assert.deepEqual(auth.waits, [])
  })

  it('sorts keys deterministically', () => {
    const auth = buildUpdateauthAuth({threshold: 1, keys: `${K1_B}:1,${K1_A}:1`})

    assert.deepEqual(auth.keys.map(entry => entry.key), [K1_A, K1_B].sort())
  })

  it('rejects unusable authorities', () => {
    assert.throws(() => buildUpdateauthAuth({threshold: 1}), /at least one key, account, or wait/)
    assert.throws(() => buildUpdateauthAuth({threshold: 0, keys: `${K1_A}:1`}), /threshold/)
    assert.throws(() => buildUpdateauthAuth({threshold: 2, keys: `${K1_A}:1`}), /exceeds total weight/)
  })

  it('builds an updateauth action authorized by the updated permission', () => {
    const auth = buildUpdateauthAuth({threshold: 1, keys: `${WA_A}:1`})
    const action = buildUpdateauthAction({account: 'victorcrisan', permission: 'active', auth})

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
    const auth = buildUpdateauthAuth({threshold: 1, keys: `${K1_A}:1`})
    const action = buildUpdateauthAction({account: 'victorcrisan', permission: 'owner', auth})

    assert.equal((action.data as {parent: string}).parent, '')
  })

  it('rejects permissions that name themselves as parent', () => {
    const auth = buildUpdateauthAuth({threshold: 1, keys: `${K1_A}:1`})

    assert.throws(() => buildUpdateauthAction({account: 'victorcrisan', permission: 'active', parent: 'active', auth}), /parent/)
  })
})
