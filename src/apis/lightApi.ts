import * as LightApi from '@proton/light-api'
import { config } from '../storage/config'

export async function getLightAccount(account: string) {
  try {
    const chain = config.get('currentChain')
    const lightApi = new LightApi.JsonRpc(chain.toLowerCase().replace('-', ''))
    return lightApi.get_account_info(account)
  } catch (e) {
    return undefined
  }
}

export async function getLightBalances(account: string) {
  try {
    const chain = config.get('currentChain')
    const lightApi = new LightApi.JsonRpc(chain.toLowerCase().replace('-', ''))
    const { balances } = await lightApi.get_balances(account)
    return balances
  } catch (e) {
    return undefined
  }
}
