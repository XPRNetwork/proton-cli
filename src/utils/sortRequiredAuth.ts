import {Numeric, RpcInterfaces} from '@proton/js'
import {compareNames} from './multisig'

type KeyEntry = RpcInterfaces.RequiredAuth['keys'][number];
type AccountEntry = RpcInterfaces.RequiredAuth['accounts'][number];
type WaitEntry = RpcInterfaces.RequiredAuth['waits'][number];

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

// Chain order for authority keys is (key type, key bytes). Decode each key
// once: base58 decoding inside the comparator would run O(n log n) times.
const sortKeys = (keys: KeyEntry[]): void => {
  const decoded = keys.map(entry => ({entry, binary: Numeric.stringToPublicKey(entry.key)}))

  decoded.sort((left, right) => {
    if (left.binary.type !== right.binary.type) {
      return left.binary.type < right.binary.type ? -1 : 1
    }

    return compareBytes(left.binary.data, right.binary.data)
  })

  for (const [index, {entry}] of decoded.entries()) {
    keys[index] = entry
  }
}

export const sortRequiredAuth = (auth: RpcInterfaces.RequiredAuth): void => {
  sortKeys(auth.keys)
  auth.accounts.sort((a: AccountEntry, b: AccountEntry) =>
    compareNames(a.permission.actor, b.permission.actor) || compareNames(a.permission.permission, b.permission.permission))
  auth.waits.sort((a: WaitEntry, b: WaitEntry) => a.wait_sec - b.wait_sec)
}
