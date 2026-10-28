import {Numeric, RpcInterfaces} from '@proton/js'
import {MultisigAction, parseAuthorization} from './multisig'
import {parseWebAuthnPublicKeyData, sortRequiredAuth} from './sort-required-auth'
import {isPositiveInteger} from './integer'

/* eslint-disable camelcase */

// EOSIO names allow up to 13 characters; a 13th character is restricted to [.1-5a-j].
const eosioNamePattern = /^([.1-5a-z]{1,12}|[.1-5a-z]{12}[.1-5a-j])$/

// Trailing dots are name-encoding padding, so accepting them would let two
// spellings alias the same on-chain name and evade duplicate checks.
export const isValidEosioName = (value: string): boolean =>
  eosioNamePattern.test(value) && !value.endsWith('.')

// Chain limits: weights are uint16, delays and thresholds are uint32, and an
// authority may contain at most 2^16 key/account/wait entries in total.
const maxWeight = 65_535
const maxUint32 = 4_294_967_295
const maxAuthEntries = 65_536

export type KeyWeight = {key: string; weight: number};
export type AccountWeight = {permission: {actor: string; permission: string}; weight: number};
export type WaitWeight = {wait_sec: number; weight: number};

const parseWeight = (value: string, flagName: string): number => {
  if (!isPositiveInteger(value) || Number(value) < 1 || Number(value) > maxWeight) {
    throw new Error(`${flagName} weight must be an integer between 1 and ${maxWeight}`)
  }

  return Number(value)
}

export const validatePublicKey = (key: string, flagName: string): void => {
  if (!key) {
    throw new Error(`${flagName} has an empty public key`)
  }

  try {
    const binary = Numeric.stringToPublicKey(key)
    if (binary.type === 2) {
      const webauthn = parseWebAuthnPublicKeyData(binary.data)
      if (!webauthn || webauthn.presence > 2 || webauthn.rpid.length === 0) {
        throw new Error('malformed WebAuthn public key data')
      }
    }
  } catch {
    // Do not echo the value: a user may have pasted a private key by mistake.
    throw new Error(`${flagName} has an invalid public key`)
  }
}

const splitList = (raw: string | undefined): string[] => {
  if (raw === undefined || raw.trim() === '') {
    return []
  }

  return raw.split(',').map(entry => entry.trim())
}

export const parseKeyWeights = (raw: string | undefined, flagName = '--keys'): KeyWeight[] => {
  return splitList(raw).map(entry => {
    const separator = entry.lastIndexOf(':')
    const key = separator === -1 ? entry : entry.slice(0, separator)
    const weight = separator === -1 ? 1 : parseWeight(entry.slice(separator + 1), flagName)

    validatePublicKey(key, flagName)

    return {key, weight}
  })
}

export const parseAccountWeights = (raw: string | undefined, flagName = '--accounts'): AccountWeight[] => {
  return splitList(raw).map(entry => {
    const separator = entry.lastIndexOf(':')
    const weightPart = separator === -1 ? '' : entry.slice(separator + 1)
    const hasWeight = separator !== -1 && weightPart !== '' && !weightPart.includes('@')
    const level = hasWeight ? entry.slice(0, separator) : entry
    const weight = hasWeight ? parseWeight(weightPart, flagName) : 1
    const permission = parseAuthorization(level, `${flagName} entry "${entry}"`)

    if (!isValidEosioName(permission.actor)) {
      throw new Error(`${flagName} entry "${entry}" has invalid account "${permission.actor}"`)
    }

    if (!isValidEosioName(permission.permission)) {
      throw new Error(`${flagName} entry "${entry}" has invalid permission "${permission.permission}"`)
    }

    return {permission, weight}
  })
}

export const parseWaitWeights = (raw: string | undefined, flagName = '--waits'): WaitWeight[] => {
  return splitList(raw).map(entry => {
    const separator = entry.lastIndexOf(':')
    const seconds = separator === -1 ? entry : entry.slice(0, separator)
    const weight = separator === -1 ? 1 : parseWeight(entry.slice(separator + 1), flagName)

    if (!isPositiveInteger(seconds) || Number(seconds) < 1 || Number(seconds) > maxUint32) {
      throw new Error(`${flagName} wait delay in "${entry}" must be an integer between 1 and ${maxUint32} seconds`)
    }

    return {wait_sec: Number(seconds), weight}
  })
}

type RequiredAuthLabels = {
  threshold: string;
  keys: string;
  accounts: string;
  waits: string;
};

const assertEntryWeight = (weight: number, label: string): void => {
  if (!Number.isInteger(weight) || weight < 1 || weight > maxWeight) {
    throw new Error(`${label} weight must be an integer between 1 and ${maxWeight}`)
  }
}

const defaultRequiredAuthLabels: RequiredAuthLabels = {
  threshold: 'threshold',
  keys: 'auth keys',
  accounts: 'auth accounts',
  waits: 'auth waits',
}

const assertKeyEntries = (keys: RpcInterfaces.RequiredAuth['keys'], label: string): void => {
  const seenKeys = new Set<string>()
  for (const entry of keys) {
    if (!entry || typeof entry.key !== 'string') {
      throw new TypeError(`${label} must include a public key string`)
    }

    validatePublicKey(entry.key, label)
    assertEntryWeight(entry.weight, label)
    const canonical = Numeric.publicKeyToString(Numeric.stringToPublicKey(entry.key))
    if (seenKeys.has(canonical)) {
      throw new Error(`${label} contains duplicate key "${entry.key}"`)
    }

    seenKeys.add(canonical)
  }
}

const assertAccountEntries = (accounts: RpcInterfaces.RequiredAuth['accounts'], label: string): void => {
  const seenAccounts = new Set<string>()
  for (const entry of accounts) {
    const permission = entry?.permission
    if (!permission || typeof permission.actor !== 'string' || typeof permission.permission !== 'string') {
      throw new TypeError(`${label} must include an actor and permission`)
    }

    if (!isValidEosioName(permission.actor)) {
      throw new Error(`${label} has invalid account "${permission.actor}"`)
    }

    if (!isValidEosioName(permission.permission)) {
      throw new Error(`${label} has invalid permission "${permission.permission}"`)
    }

    assertEntryWeight(entry.weight, label)
    const level = `${permission.actor}@${permission.permission}`
    if (seenAccounts.has(level)) {
      throw new Error(`${label} contains duplicate account "${level}"`)
    }

    seenAccounts.add(level)
  }
}

const assertWaitEntries = (waits: RpcInterfaces.RequiredAuth['waits'], label: string): void => {
  const seenWaits = new Set<number>()
  for (const entry of waits) {
    if (!entry || !Number.isInteger(entry.wait_sec) || entry.wait_sec < 1 || entry.wait_sec > maxUint32) {
      throw new Error(`${label} wait delay must be an integer between 1 and ${maxUint32} seconds`)
    }

    assertEntryWeight(entry.weight, label)
    if (seenWaits.has(entry.wait_sec)) {
      throw new Error(`${label} contains duplicate delay "${entry.wait_sec}"`)
    }

    seenWaits.add(entry.wait_sec)
  }
}

export const assertValidRequiredAuth = (
  auth: RpcInterfaces.RequiredAuth,
  labels: RequiredAuthLabels = defaultRequiredAuthLabels,
): void => {
  if (!auth || !Array.isArray(auth.keys) || !Array.isArray(auth.accounts) || !Array.isArray(auth.waits)) {
    throw new TypeError('auth must include keys, accounts, and waits arrays')
  }

  if (!Number.isInteger(auth.threshold) || auth.threshold < 1 || auth.threshold > maxUint32) {
    throw new Error(`${labels.threshold} must be an integer between 1 and ${maxUint32}`)
  }

  const entryCount = auth.keys.length + auth.accounts.length + auth.waits.length
  if (entryCount === 0) {
    throw new Error('at least one key, account, or wait is required')
  }

  if (entryCount > maxAuthEntries) {
    throw new Error(`authority may contain at most ${maxAuthEntries} key, account, and wait entries in total`)
  }

  assertKeyEntries(auth.keys, labels.keys)
  assertAccountEntries(auth.accounts, labels.accounts)
  assertWaitEntries(auth.waits, labels.waits)

  const total = [...auth.keys, ...auth.accounts, ...auth.waits].reduce((sum, entry) => sum + entry.weight, 0)
  if (auth.threshold > total) {
    throw new Error(`${labels.threshold} ${auth.threshold} exceeds total weight ${total}`)
  }

  const principalWeight = [...auth.keys, ...auth.accounts].reduce((sum, entry) => sum + entry.weight, 0)
  if (principalWeight < auth.threshold) {
    throw new Error('keys and accounts must provide at least the threshold weight; waits alone must not satisfy an authority')
  }
}

export const buildRequiredAuth = (options: {
  threshold: number;
  keys?: string;
  accounts?: string;
  waits?: string;
}): RpcInterfaces.RequiredAuth => {
  const {threshold, keys, accounts, waits} = options

  if (!Number.isInteger(threshold) || threshold < 1 || threshold > maxUint32) {
    throw new Error(`--threshold must be an integer between 1 and ${maxUint32}`)
  }

  const auth: RpcInterfaces.RequiredAuth = {
    threshold,
    keys: parseKeyWeights(keys),
    accounts: parseAccountWeights(accounts),
    waits: parseWaitWeights(waits),
  }
  assertValidRequiredAuth(auth, {threshold: '--threshold', keys: '--keys', accounts: '--accounts', waits: '--waits'})
  sortRequiredAuth(auth)

  return auth
}

export const buildUpdateAuthAction = (options: {
  account: string;
  permission: string;
  parent?: string;
  auth: RpcInterfaces.RequiredAuth;
  actionPermission?: string;
}): MultisigAction => {
  const {account, permission, auth} = options

  if (!isValidEosioName(account)) {
    throw new Error(`account "${account}" is not a valid EOSIO account name`)
  }

  if (!isValidEosioName(permission)) {
    throw new Error(`permission "${permission}" is not a valid permission name`)
  }

  if (permission.startsWith('eosio.')) {
    throw new Error(`permission "${permission}" is reserved because it starts with "eosio."`)
  }

  assertValidRequiredAuth(auth)
  const sortedAuth: RpcInterfaces.RequiredAuth = {
    threshold: auth.threshold,
    keys: [...auth.keys],
    accounts: [...auth.accounts],
    waits: [...auth.waits],
  }
  sortRequiredAuth(sortedAuth)

  if (auth.accounts.some(entry => entry.permission.actor === account && entry.permission.permission === permission)) {
    throw new Error(`permission "${permission}" cannot authorize itself`)
  }

  let parent = options.parent
  if (permission === 'owner') {
    if (parent !== undefined && parent !== '') {
      throw new Error('the owner permission must not have a parent')
    }

    parent = ''
  } else if (permission === 'active') {
    parent = parent === undefined || parent === '' ? 'owner' : parent
    if (parent !== 'owner') {
      throw new Error('the active permission parent must be owner')
    }
  } else {
    if (parent === undefined || parent === '') {
      throw new Error(`permission "${permission}" requires an explicit --parent so an existing permission is never silently reparented`)
    }

    if (!isValidEosioName(parent)) {
      throw new Error(`parent "${parent}" is not a valid permission name`)
    }

    if (parent === permission) {
      throw new Error(`permission "${permission}" cannot name itself as parent`)
    }
  }

  const actionPermission = options.actionPermission === undefined ? permission : options.actionPermission
  if (!isValidEosioName(actionPermission)) {
    throw new Error(`action permission "${actionPermission}" is not a valid permission name`)
  }

  return {
    account: 'eosio',
    name: 'updateauth',
    authorization: [{actor: account, permission: actionPermission}],
    data: {account, permission, parent, auth: sortedAuth},
  }
}
