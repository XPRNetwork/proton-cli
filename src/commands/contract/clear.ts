import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import { config } from '../../storage/config'
import { green } from 'colors'
import { parseDetailsError } from '../../utils/detailsError'
import { getExplorer } from '../../apis/getExplorer'

export default class CleanContract extends Command {
  static description = 'Clean Contract'

  static args = {
    account: Args.string({
      required: true,
      help: 'The account to cleanup the contract',
    }),
  }

  static flags = {
    abiOnly: Flags.boolean({ char: 'a', description: 'Only remove ABI' }),
    wasmOnly: Flags.boolean({ char: 'w', description: 'Only remove WASM' }),
  }

  async run() {
    const { args, flags } = await this.parse(CleanContract)

    // 3. Set code
    if (!flags.abiOnly) {
      try {
        const res = await network.transact({
          actions: [{
            account: 'eosio',
            name: 'setcode',
            data: {
              account: args.account,
              vmtype: 0,
              vmversion: 0,
              code: Buffer.from(''),
            },
            authorization: [{
              actor: args.account,
              permission: 'active',
            }],
          }],
        })

        ux.log(green(`WASM Successfully cleaned:`))
        ux.url(`View TX`, `${getExplorer()}/tx/${(res as any).transaction_id}?tab=traces`)
      } catch (e) {
        parseDetailsError(e)
      }
    }

    // 4. Set ABI
    if (!flags.wasmOnly) {
      try {
        const res = await network.transact({
          actions: [{
            account: 'eosio',
            name: 'setabi',
            data: {
              account: args.account,
              abi: '',
            },
            authorization: [{
              actor: args.account,
              permission: 'active',
            }],
          }],
        })
        ux.log(green(`ABI Successfully cleaned:`))
        ux.url(`View TX`, `${getExplorer()}/tx/${(res as any).transaction_id}?tab=traces`)
      } catch (e) {
        parseDetailsError(e)
      }
    }
  }
}
