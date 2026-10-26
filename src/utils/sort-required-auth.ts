import {Numeric, RpcInterfaces} from '@proton/js'
import {compareNames} from './multisig'

type KeyEntry = RpcInterfaces.RequiredAuth['keys'][number];
type AccountEntry = RpcInterfaces.RequiredAuth['accounts'][number];
type WaitEntry = RpcInterfaces.RequiredAuth['waits'][number];
type BinaryKey = ReturnType<typeof Numeric.stringToPublicKey>;

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

const compareNumbers = (left: number, right: number): number => {
  if (left === right) {
    return 0
  }

  return left < right ? -1 : 1
}

export const parseWebAuthnPublicKeyData = (data: Uint8Array): {key: Uint8Array; presence: number; rpid: Uint8Array} | null => {
  // WebAuthn public-key data is: 33-byte key, user-presence byte,
  // then a varuint32 length followed by the RP ID bytes.
  if (data.length < 35) {
    return null
  }

  let offset = 34
  let length = 0
  let shift = 0
  while (offset < data.length) {
    const byte = data[offset]
    length += (byte & 0x7F) * (2 ** shift)
    offset++
    if ((byte & 0x80) === 0) {
      break
    }

    shift += 7
    if (shift > 28) {
      return null
    }
  }

  if (offset + length !== data.length) {
    return null
  }

  return {
    key: data.slice(0, 33),
    presence: data[33],
    rpid: data.slice(offset, offset + length),
  }
}

const compareBinaryKeys = (left: BinaryKey, right: BinaryKey): number => {
  if (left.type !== right.type) {
    return compareNumbers(left.type, right.type)
  }

  if (left.type === 2) {
    const leftParts = parseWebAuthnPublicKeyData(left.data)
    const rightParts = parseWebAuthnPublicKeyData(right.data)
    if (leftParts && rightParts) {
      return compareBytes(leftParts.key, rightParts.key) ||
        compareNumbers(leftParts.presence, rightParts.presence) ||
        compareBytes(leftParts.rpid, rightParts.rpid)
    }
  }

  return compareBytes(left.data, right.data)
}

// Chain order for authority keys is by public-key value, not by its base58
// string or serialized bytes. Decode each key once before sorting.
const sortKeys = (keys: KeyEntry[]): void => {
  const decoded = keys.map(entry => ({entry, binary: Numeric.stringToPublicKey(entry.key)}))

  decoded.sort((left, right) => compareBinaryKeys(left.binary, right.binary))

  for (const [index, {entry}] of decoded.entries()) {
    keys[index] = entry
  }
}

export const sortRequiredAuth = (auth: RpcInterfaces.RequiredAuth): void => {
  sortKeys(auth.keys)
  auth.accounts.sort((a: AccountEntry, b: AccountEntry) =>
    compareNames(a.permission.actor, b.permission.actor) || compareNames(a.permission.permission, b.permission.permission))
  auth.waits.sort((a: WaitEntry, b: WaitEntry) => compareNumbers(a.wait_sec, b.wait_sec))
}
