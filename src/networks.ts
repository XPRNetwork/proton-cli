import { CliUx } from '@oclif/core'
import {JsonRpc, Api} from '@proton/js'
import { networks } from './constants'
import { config } from './storage/config'

class Network {
  rpc: JsonRpc
  api: Api

  constructor () {
    const endpoint = config.get('currentEndpoint')
    this.rpc = new JsonRpc(endpoint as string)
    this.api = new Api({ rpc: this.rpc })
  }

  get network () {
    const chain = config.get('currentChain')
    const networks = config.get('networks') as any
    return networks.find((network: any) => network.chain === chain)!
  }

  initialize () {
    const endpoint = config.get('currentEndpoint')
    this.rpc = new JsonRpc(endpoint as string)
    this.api = new Api({ rpc: this.rpc })
  }

  async transact (actions: any[]) {
    return this.api.transact({actions}, {
      useLastIrreversible: true,
      expireSeconds: 3000,
    })
  }

  setChain (chain: string) {
    const foundChain = networks.find(network => network.chain === chain)
    if (!foundChain) {
      throw new Error(`No chain with name ${chain} found, use network:all to see available chains.`)
    }
    config.set('currentChain', chain)
    this.initialize()
    CliUx.ux.log(`Successfully switched to chain ${chain}`)
  }
  
  setEndpoint (endpoint: string) {
    config.set('currentEndpoint', endpoint)
    this.initialize()
    CliUx.ux.log(`Successfully switched to endpoint ${endpoint}`)
  }
}

export const network = new Network()
