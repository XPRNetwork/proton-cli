import {ApiInterfaces, RpcInterfaces, Keosd} from '@protonprotocol/protonjs'
import {getApi} from './networks'
import {ux} from 'cli-ux'

/** Signs transactions using in-process private keys */
export class KeosdSignatureProvider implements ApiInterfaces.SignatureProvider {
  /** Public keys associated with the private keys that the `SignatureProvider` holds */
  public async getAvailableKeys() {
    try {
      return Keosd.wallet_list_public_keys()
    } catch (_) {
      const err = {
        message: 'Locked Wallet',
        error: 'You don\'t have any unlocked wallet!',
      }
      ux.styledJSON(err)
      throw new Error('Locked Wallet')
    }
  }

  /** Sign a transaction */
  public async sign({
    chainId,
    requiredKeys,
    serializedTransaction,
    serializedContextFreeData,
  }: ApiInterfaces.SignatureProviderArgs): Promise<RpcInterfaces.PushTransactionArgs> {
    const {api} = await getApi()
    const transaction = api.deserializeTransaction(serializedTransaction)
    const {signatures} = await Keosd.wallet_sign_transaction(transaction, requiredKeys, chainId)
    return {
      signatures,
      serializedTransaction,
      serializedContextFreeData,
    }
  }
}
