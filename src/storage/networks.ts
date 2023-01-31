import { CliUx } from '@oclif/core'
import { JsonRpc, Api, JsSignatureProvider, RpcInterfaces, ApiInterfaces } from '@proton/js'
import { green } from 'colors'
import { networks } from '../constants'
import { config } from './config'
import passwordManager from './passwordManager'
import { ApiClass } from '@proton/api'

class Network {
  rpc!: JsonRpc
  api!: Api
  protonApi!: ApiClass

  constructor () {
    this.initialize()
  }

  get network () {
    const chain = config.get('currentChain')
    // const masterNetwork = 
    // const networks = config.get('networks') as any
    return networks.find((network: any) => network.chain === chain)!
  }

  initialize () {
    this.rpc = new JsonRpc(this.network.endpoints)
    this.api = new Api({ rpc: this.rpc })
    this.protonApi = new ApiClass(config.get('currentChain'))
  }

  async getSignatureProvider () {
    const privateKeys = await passwordManager.getPrivateKeys()
    return new JsSignatureProvider(privateKeys)
  }

  async transact (transaction: any, args: { endpoint?: string } = {}): Promise<RpcInterfaces.PushTransactionArgs | ApiInterfaces.TransactResult | RpcInterfaces.ReadOnlyTransactResult> {
    const api = new Api({
      rpc: args.endpoint
        ? new JsonRpc(args.endpoint)
        : this.rpc,
      signatureProvider: await this.getSignatureProvider()
    })
    return api.transact(transaction, {
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
