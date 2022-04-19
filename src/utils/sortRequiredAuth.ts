import { Numeric, Serialize } from "@proton/js"
import { RequiredAuth } from "@proton/js/dist/rpc/types"


export const decodeWaPublicKey = (waPublicKey: string) => {
	if (!waPublicKey.startsWith('PUB_WA_')) {
	  throw new Error('Not WA Public Key (starts with PUB_WA_)')
	}
  
	const pubKey = Numeric.stringToPublicKey(waPublicKey)
	const ser = new Serialize.SerialBuffer({ array: pubKey.data })
	
	const data = ser.getUint8Array(33)
	const userPresence = ser.get()
	const rpid = ser.getString()

	return {
		data,
		userPresence,
		rpid
	}
}

export const sortRequiredAuth = (required_auth: RequiredAuth) => {
    required_auth.accounts = required_auth.accounts.sort((a: { permission: { actor: any; }; }, b: { permission: { actor: any; }; }) => a.permission.actor.localeCompare(b.permission.actor))
    required_auth.waits    = required_auth.waits.sort((a: { wait_sec: any; }, b: { wait_sec: any; }) => a.wait_sec.localeCompare(b.wait_sec))
    required_auth.keys = required_auth.keys.sort((a: { key: string }, b: { key: string }) => {
      if (a.key.includes('PUB_WA_') && b.key.includes('PUB_WA_')) {
        const keyADecoded = decodeWaPublicKey(a.key)
        const keyBDecoded = decodeWaPublicKey(b.key)
        
        for (let i = 0; i < 33; i++) {
          if (keyADecoded.data[i] < keyBDecoded.data[i]) {
            return -1
          } else if (keyADecoded.data[i] > keyBDecoded.data[i]) {
            return 1
          }
        }

        if (keyADecoded.userPresence < keyBDecoded.userPresence) {
          return -1
        } else if (keyADecoded.userPresence > keyBDecoded.userPresence) {
          return 1
        }

        return keyADecoded.rpid.localeCompare(keyBDecoded.rpid)
      }

      return a.key.localeCompare(b.key)
    })
}