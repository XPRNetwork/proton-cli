import { network } from '../storage/networks'

export async function getFaucets (): Promise<any[]> {
    const { rows: faucets } = await network.rpc.get_table_rows({
        code: 'token.faucet',
        scope: 'token.faucet',
        table: 'programs',
        limit: -1
    })
    return faucets
}