import { config } from "../storage/config";
import fetch from 'cross-fetch'

export async function postData (url: string, data = {}): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

const getMetalEndpoint = (chain: string) => {
    if (chain === 'proton') {
        return 'https://identity.api.prod.metalx.com'
    } else if (chain === 'proton-test') {
        return 'https://identity.api.dev.metalx.com'
    } else {
        throw new Error('Can only create new account on proton or proton testnet')
    }
}

export const createAccount = async (params: {
    email: string,
    name: string,
    chainAccount: string,
    activePublicKey: string,
    ownerPublicKey: string,
    verificationCode?: string
}): Promise<any> => {
    const metalEndpoint = getMetalEndpoint(config.get('currentChain'))
    return postData(`${metalEndpoint}/v2/users/create`, params)
}