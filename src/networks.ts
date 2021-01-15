import cli from 'cli-ux'
import {JsonRpc, Api} from '@protonprotocol/protonjs'
import fetch from 'node-fetch'
import {info} from './debug'
import {networks, settings} from './constants'
import {KeosdSignatureProvider} from './keosd-signature-provider'

let rpc: JsonRpc
let api: Api

export const setRpc = (endpoints: string[]) => {
  info('Endpoints:', endpoints)
  rpc = new JsonRpc(endpoints, {fetch})
  api = new Api({rpc, signatureProvider: new KeosdSignatureProvider()})
  return rpc
}

export const currentNetwork = {
  get: async () => {
    let network = settings.get().currentNetwork
    if (!network) {
      const chain = await cli.prompt('What network would you like to connect to (proton, proton-test, eos)? You can change this in the future like `proton network:set proton-test`.')
      network = currentNetwork.set(chain)
    }
    return network
  },
  set: (chain: string) => {
    const network = networks.find(network => network.chain === chain)
    if (!network) {
      throw new Error('Chain not found, please use proton network:all to find all chains')
    }
    settings.merge({currentNetwork: network})
    setRpc(network.endpoints)
    return network
  },
}

export const getRpc = async () => {
  if (!rpc) {
    await currentNetwork.get()
  }
  return rpc
}

export const getApi = async () => {
  if (!api) {
    await currentNetwork.get()
  }
  return {
    api,
    transact: (actions: any[]) => api.transact({actions}, {
      useLastIrreversible: true,
      expireSeconds: 3000,
    }),
  }
}

// Initialization
const initialize = () => {
  if (settings.exists() && settings.get().currentNetwork) {
    setRpc(settings.get().currentNetwork.endpoints)
  } else {
    settings.set({
      currentNetwork: null,
    })
  }
}
initialize()
