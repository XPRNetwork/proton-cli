import {Numeric, RpcInterfaces} from '@proton/js'
import {MultisigAction, parseAuthorization} from './multisig'
import {sortRequiredAuth} from './sortRequiredAuth'
import {isPositiveInteger} from './integer'

/* eslint-disable camelcase */

// EOSIO names allow up to 13 characters; a 13th character is restricted to [.1-5a-j].
const validName = /^([.1-5a-z]{1,12}|[.1-5a-z]{12}[.1-5a-j])$/

export type KeyWeight = {key: string; weight: number};
export type AccountWeight = {permission: {actor: string; permission: string}; weight: number};
export type WaitWeight = {wait_sec: number; weight: number};

// Code-unit order matches EOSIO name collation (`.` < `1-5` < `a-z`)
// and is stable across machines, unlike localeCompare.
export const compareNames = (left: string, right: string): number => {
  if (left === right) {
    return 0
  }

  return left < right ? -1 : 1
}

const parseWeight = (entry: string, value: string, argument: string): number => {
  if (!isPositiveInteger(value) || Number(value) < 1) {
    throw new Error(`${argument} weight in "${entry}" must be a positive integer`)
  }

  return Number(value)
}

export const validatePublicKey = (key: string, argument: string): void => {
  if (!key) {
    throw new Error(`${argument} has an empty public key`)
  }

  try {
    Numeric.stringToPublicKey(key)
  } catch (error) {
    throw new Error(`${argument} has invalid public key "${key}": ${(error as Error).message}`)
  }
}

const splitList = (raw: string | undefined): string[] => {
  if (raw === undefined || raw.trim() === '') {
    return []
  }

  return raw.split(',').map(entry => entry.trim())
}

export const parseKeyWeights = (raw: string | undefined, argument = '--keys'): KeyWeight[] => {
  return splitList(raw).map(entry => {
    const separator = entry.lastIndexOf(':')
    const key = separator === -1 ? entry : entry.slice(0, separator)
    const weight = separator === -1 ? 1 : parseWeight(entry, entry.slice(separator + 1), argument)

    validatePublicKey(key, argument)

    return {key, weight}
  })
}

export const parseAccountWeights = (raw: string | undefined, argument = '--accounts'): AccountWeight[] => {
  return splitList(raw).map(entry => {
    const separator = entry.lastIndexOf(':')
    const weightPart = separator === -1 ? '' : entry.slice(separator + 1)
    const hasWeight = separator !== -1 && weightPart !== '' && !weightPart.includes('@')
    const level = hasWeight ? entry.slice(0, separator) : entry
    const weight = hasWeight ? parseWeight(entry, weightPart, argument) : 1
    const permission = parseAuthorization(level, `${argument} entry "${entry}"`)

    if (!validName.test(permission.actor)) {
      throw new Error(`${argument} entry "${entry}" has invalid account "${permission.actor}"`)
    }

    if (!validName.test(permission.permission)) {
      throw new Error(`${argument} entry "${entry}" has invalid permission "${permission.permission}"`)
    }

    return {permission, weight}
  })
}

export const parseWaitWeights = (raw: string | undefined, argument = '--waits'): WaitWeight[] => {
  return splitList(raw).map(entry => {
    const separator = entry.lastIndexOf(':')
    const seconds = separator === -1 ? entry : entry.slice(0, separator)
    const weight = separator === -1 ? 1 : parseWeight(entry, entry.slice(separator + 1), argument)

    if (!isPositiveInteger(seconds)) {
      throw new Error(`${argument} wait delay in "${entry}" must be a positive integer number of seconds`)
    }

    return {wait_sec: Number(seconds), weight}
  })
}

export const buildUpdateauthAuth = (options: {
  threshold: number;
  keys?: string;
  accounts?: string;
  waits?: string;
}): RpcInterfaces.RequiredAuth => {
  const {threshold} = options

  if (!Number.isInteger(threshold) || threshold < 1) {
    throw new Error('--threshold must be a positive integer')
  }

  const keys = parseKeyWeights(options.keys)
  const accounts = parseAccountWeights(options.accounts)
  const waits = parseWaitWeights(options.waits)

  if (keys.length === 0 && accounts.length === 0 && waits.length === 0) {
    throw new Error('at least one key, account, or wait is required')
  }

  const total = [...keys, ...accounts, ...waits].reduce((sum, entry) => sum + entry.weight, 0)
  if (threshold > total) {
    throw new Error(`--threshold ${threshold} exceeds total weight ${total}`)
  }

  const auth: RpcInterfaces.RequiredAuth = {threshold, keys, accounts, waits}
  sortRequiredAuth(auth)

  return auth
}

export const buildUpdateauthAction = (options: {
  account: string;
  permission: string;
  parent?: string;
  auth: RpcInterfaces.RequiredAuth;
}): MultisigAction => {
  const {account, permission, auth} = options

  if (!validName.test(account)) {
    throw new Error(`account "${account}" is not a valid EOSIO account name`)
  }

  if (!validName.test(permission)) {
    throw new Error(`permission "${permission}" is not a valid permission name`)
  }

  let parent = options.parent
  if (permission === 'owner') {
    if (parent !== undefined && parent !== '') {
      throw new Error('the owner permission must not have a parent')
    }

    parent = ''
  } else {
    parent = parent === undefined || parent === '' ? 'owner' : parent
    if (!validName.test(parent)) {
      throw new Error(`parent "${parent}" is not a valid permission name`)
    }

    if (parent === permission) {
      throw new Error(`permission "${permission}" cannot name itself as parent`)
    }
  }

  return {
    account: 'eosio',
    name: 'updateauth',
    authorization: [{actor: account, permission}],
    data: {account, permission, parent, auth},
  }
}
