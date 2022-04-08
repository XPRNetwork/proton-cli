import * as LightApi from '@eoscafe/light-api'
import { config } from '../storage/config'

export async function getLightAccount(accountName: string) {
  try {
    const chain = config.get('currentChain')
    const lightApi = new LightApi.JsonRpc(chain.toLowerCase().replace('-', ''))
    return lightApi.get_account_info(accountName)
  } catch (e) {
    return undefined
  }
}

export async function getLightBalances(accountName: string) {
  try {
    const chain = config.get('currentChain')
    const lightApi = new LightApi.JsonRpc(chain.toLowerCase().replace('-', ''))
    const { balances } = await lightApi.get_balances(accountName)
    return balances
  } catch (e) {
    return undefined
  }
}
