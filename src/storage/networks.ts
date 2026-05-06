import { ux } from '../utils/ux'

import {
  JsonRpc,
  Api,
  JsSignatureProvider,
  RpcInterfaces,
  ApiInterfaces,
} from '@proton/js'
import {green} from 'colors'
import {networks} from '../constants'
import {config} from './config'
import passwordManager from './passwordManager'
import {ApiClass} from '@proton/api'

type Endpoints = {
  chain: string;
  endpoints: string[];
};

class Network {
  rpc!: JsonRpc;
  api!: Api;
  protonApi!: ApiClass;

  constructor() {
    this.initialize()
  }

  get chain() {
    return config.get('currentChain')
  }

  get network() {
    const chain = this.chain
    const endpoints = (config.get('endpoints') as Endpoints[]) || []
    const currentEndpoint = endpoints.find(
      endpoint => endpoint.chain === chain,
    )
    if (!currentEndpoint) {
      return networks.find((network: any) => network.chain === chain)!
    }

    return currentEndpoint
  }

  initialize() {
    this.rpc = new JsonRpc(this.network.endpoints)
    this.api = new Api({rpc: this.rpc})
    this.protonApi = new ApiClass(this.chain)
  }

  async getSignatureProvider() {
    const privateKeys = await passwordManager.getPrivateKeys()
    return new JsSignatureProvider(privateKeys)
  }

  async transact(
    transaction: any,
    args: { endpoint?: string } = {},
  ): Promise<
    | RpcInterfaces.PushTransactionArgs
    | ApiInterfaces.TransactResult
    | RpcInterfaces.ReadOnlyTransactResult
  > {
    const api = new Api({
      rpc: args.endpoint ? new JsonRpc([args.endpoint]) : this.rpc,
      signatureProvider: await this.getSignatureProvider(),
    })
    return api.transact(transaction, {
      useLastIrreversible: true,
      expireSeconds: 3000,
    })
  }

  setChain(chain: string) {
    const foundChain = networks.find(network => network.chain === chain)
    if (!foundChain) {
      throw new Error(
        `No chain with name ${chain} found, use network:all to see available chains.`,
      )
    }

    config.set('currentChain', chain)
    this.initialize()
    ux.log(`${green('Success:')} Switched to chain ${chain}`)
  }

  setEndpoint(endpoint: string) {
    this.initialize()
    ux.log(`${green('Success:')} Switched to endpoint ${endpoint}`)
  }

  overrideEndpoint(endpointList: string[]) {
    const chain = this.chain
    const endpoints = (config.get('endpoints') as Endpoints[]) || []
    const filteredEndpoints = endpoints.filter(ep => ep.chain !== chain)
    const newEndpoints = {chain, endpoints: [...endpointList]}
    filteredEndpoints.push(newEndpoints)
    console.log(filteredEndpoints, 'this is the endpoints after override')
    config.set('endpoints', filteredEndpoints)
    ux.log(
      `${green('Success:')} Endpoints set to ${endpointList} for ${chain}`,
    )
  }

  getEndpoint(): Endpoints[] | undefined {
    return config.get('endpoints')
  }

  resetEndpoint() {
    const chain = this.chain
    const endpoints = (config.get('endpoints') as Endpoints[]) || []
    const newEndpoints = endpoints.filter(ep => ep.chain !== chain)
    config.set('endpoints', newEndpoints)
  }
}

export const network = new Network()
