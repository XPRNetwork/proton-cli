import {Numeric, RpcInterfaces} from '@proton/js'
import {MultisigAction, parseAuthorization} from './multisig'
import {sortRequiredAuth} from './sortRequiredAuth'
import {isPositiveInteger} from './integer'

/* eslint-disable camelcase */

// EOSIO names allow up to 13 characters; a 13th character is restricted to [.1-5a-j].
const eosioNamePattern = /^([.1-5a-z]{1,12}|[.1-5a-z]{12}[.1-5a-j])$/

export const isValidEosioName = (value: string): boolean => eosioNamePattern.test(value)

// Chain limits: weights are uint16, delays and thresholds are uint32.
const maxWeight = 65_535
const maxUint32 = 4_294_967_295

export type KeyWeight = {key: string; weight: number};
export type AccountWeight = {permission: {actor: string; permission: string}; weight: number};
export type WaitWeight = {wait_sec: number; weight: number};

const parseWeight = (entry: string, value: string, flagName: string): number => {
  if (!isPositiveInteger(value) || Number(value) < 1 || Number(value) > maxWeight) {
    throw new Error(`${flagName} weight in "${entry}" must be an integer between 1 and ${maxWeight}`)
  }

  return Number(value)
}

export const validatePublicKey = (key: string, flagName: string): void => {
  if (!key) {
    throw new Error(`${flagName} has an empty public key`)
  }

  try {
    Numeric.stringToPublicKey(key)
  } catch (error) {
    throw new Error(`${flagName} has invalid public key "${key}": ${(error as Error).message}`)
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
    const weight = separator === -1 ? 1 : parseWeight(entry, entry.slice(separator + 1), flagName)

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
    const weight = hasWeight ? parseWeight(entry, weightPart, flagName) : 1
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
    const weight = separator === -1 ? 1 : parseWeight(entry, entry.slice(separator + 1), flagName)

    if (!isPositiveInteger(seconds) || Number(seconds) < 1 || Number(seconds) > maxUint32) {
      throw new Error(`${flagName} wait delay in "${entry}" must be an integer between 1 and ${maxUint32} seconds`)
    }

    return {wait_sec: Number(seconds), weight}
  })
}

export const buildRequiredAuth = (options: {
  threshold: number;
  keys?: string;
  accounts?: string;
  waits?: string;
}): RpcInterfaces.RequiredAuth => {
  const {threshold} = options

  if (!Number.isInteger(threshold) || threshold < 1 || threshold > maxUint32) {
    throw new Error(`--threshold must be an integer between 1 and ${maxUint32}`)
  }

  const keys = parseKeyWeights(options.keys)
  const accounts = parseAccountWeights(options.accounts)
  const waits = parseWaitWeights(options.waits)

  if (keys.length === 0 && accounts.length === 0 && waits.length === 0) {
    throw new Error('at least one key, account, or wait is required')
  }

  const seenKeys = new Set<string>()
  for (const {key} of keys) {
    const canonical = Numeric.publicKeyToString(Numeric.stringToPublicKey(key))
    if (seenKeys.has(canonical)) {
      throw new Error(`--keys contains duplicate key "${key}"`)
    }

    seenKeys.add(canonical)
  }

  const seenAccounts = new Set<string>()
  for (const {permission} of accounts) {
    const level = `${permission.actor}@${permission.permission}`
    if (seenAccounts.has(level)) {
      throw new Error(`--accounts contains duplicate account "${level}"`)
    }

    seenAccounts.add(level)
  }

  const seenWaits = new Set<number>()
  for (const {wait_sec} of waits) {
    if (seenWaits.has(wait_sec)) {
      throw new Error(`--waits contains duplicate delay "${wait_sec}"`)
    }

    seenWaits.add(wait_sec)
  }

  const total = [...keys, ...accounts, ...waits].reduce((sum, entry) => sum + entry.weight, 0)
  if (threshold > total) {
    throw new Error(`--threshold ${threshold} exceeds total weight ${total}`)
  }

  const auth: RpcInterfaces.RequiredAuth = {threshold, keys, accounts, waits}
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

  let parent = options.parent
  if (permission === 'owner') {
    if (parent !== undefined && parent !== '') {
      throw new Error('the owner permission must not have a parent')
    }

    parent = ''
  } else if (permission === 'active') {
    parent = parent === undefined || parent === '' ? 'owner' : parent
    if (!isValidEosioName(parent)) {
      throw new Error(`parent "${parent}" is not a valid permission name`)
    }

    if (parent === permission) {
      throw new Error(`permission "${permission}" cannot name itself as parent`)
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
    data: {account, permission, parent, auth},
  }
}
