import { encodeName } from '@bloks/utils'
import { RpcInterfaces } from '@proton/js'
import { network } from '../storage/networks'

export async function getProtonAvatar (account: string): Promise<RpcInterfaces.UserInfo | undefined> {
    try {
        const result = await network.rpc.get_table_rows({
            json: true,
            code: 'eosio.proton',
            scope: 'eosio.proton',
            table: 'usersinfo',
            table_key: '',
            key_type: 'i64',
            lower_bound: encodeName(account, false),
            index_position: 1,
            limit: 1
        })

        return result.rows.length > 0 && result.rows[0].acc === account
            ? result.rows[0]
            : undefined
    } catch (e) {
        console.error('getProtonAvatar error', e)
        return undefined
    }
}