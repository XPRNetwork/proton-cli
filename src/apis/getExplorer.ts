import { config } from "../storage/config"

export function getExplorer () {
	const chain: string = config.get('currentChain')

    if (chain === 'proton') {
        return 'https://protonscan.io'
    } else if (chain === 'proton-test') {
        return 'https://testnet.protonscan.io'
    }

    throw new Error('Chain not supported')
}