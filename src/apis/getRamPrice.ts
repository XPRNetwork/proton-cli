import { network } from '../storage/networks'
import BN from 'bignumber.js'

export async function getRamPrice (): Promise<number> {
    const { rows } = await network.rpc.get_table_rows({
        code: 'eosio',
        scope: 'eosio',
        table: 'globalram',
        limit: 1
    })
    const ramPricePerByte = rows[0].ram_price_per_byte.split(' ')[0]
    return +new BN(ramPricePerByte).multipliedBy(1.1).toFixed(4, BN.ROUND_DOWN)
}