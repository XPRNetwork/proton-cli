import {Numeric, RpcInterfaces} from '@proton/js'
import {compareNames} from './multisig'

/* eslint-disable camelcase */

const compareBytes = (left: Uint8Array, right: Uint8Array): number => {
  const shared = Math.min(left.length, right.length)
  for (let i = 0; i < shared; i++) {
    if (left[i] !== right[i]) {
      return left[i] < right[i] ? -1 : 1
    }
  }

  if (left.length === right.length) {
    return 0
  }

  return left.length < right.length ? -1 : 1
}

// Chain order for authority keys is (key type, key bytes): decode every key
// instead of comparing base58 strings, where '10...' would sort before '9...'.
const compareKeys = (left: string, right: string): number => {
  if (left === right) {
    return 0
  }

  const leftKey = Numeric.stringToPublicKey(left)
  const rightKey = Numeric.stringToPublicKey(right)
  if (leftKey.type !== rightKey.type) {
    return leftKey.type < rightKey.type ? -1 : 1
  }

  return compareBytes(leftKey.data, rightKey.data)
}

export const sortRequiredAuth = (auth: RpcInterfaces.RequiredAuth): void => {
  auth.keys.sort((a: {key: string}, b: {key: string}) => compareKeys(a.key, b.key))
  auth.accounts.sort((a: {permission: {actor: string; permission: string}}, b: {permission: {actor: string; permission: string}}) =>
    compareNames(a.permission.actor, b.permission.actor) || compareNames(a.permission.permission, b.permission.permission))
  auth.waits.sort((a: {wait_sec: number}, b: {wait_sec: number}) => a.wait_sec - b.wait_sec)
}
