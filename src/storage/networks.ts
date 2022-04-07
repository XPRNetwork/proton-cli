import { CliUx } from '@oclif/core'
import {JsonRpc, Api} from '@proton/js'
import { green } from 'colors'
import { networks } from '../constants'
import { config } from './config'

class Network {
  rpc: JsonRpc
  api: Api

  constructor () {
    this.rpc = new JsonRpc(this.network.endpoint)
    this.api = new Api({ rpc: this.rpc })
  }

  get network () {
    const chain = config.get('currentChain')
    const networks = config.get('networks') as any
    return networks.find((network: any) => network.chain === chain)!
  }

  initialize () {
    this.rpc = new JsonRpc(this.network.endpoint)
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
    CliUx.ux.log(`${green('Success:')} Switched to chain ${chain}`)
  }
  
  setEndpoint (endpoint: string) {
    config.set('currentEndpoint', endpoint)
    this.initialize()
    CliUx.ux.log(`${green('Success:')} Switched to endpoint ${endpoint}`)
  }
}

export const network = new Network()
