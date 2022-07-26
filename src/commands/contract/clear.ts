import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { config } from '../../storage/config'
import { green } from 'colors'
import { parseDetailsError } from '../../utils/detailsError'
import { getExplorer } from '../../apis/getExplorer'

export default class CleanContract extends Command {
  static description = 'Clean Contract'

  static args = [
    { name: 'account', required: true, help: 'The account to cleanup the contract' },
  ]

  static flags = {
    abiOnly: flags.boolean({ char: 'a', description: 'Only remove ABI' }),
    wasmOnly: flags.boolean({ char: 'w', description: 'Only remove WASM' }),
  }

  async run() {
    const { args, flags } = this.parse(CleanContract)

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

        CliUx.ux.log(green(`WASM Successfully cleaned:`))
        CliUx.ux.url(`View TX`, `https://${config.get('currentChain')}.ProtonScan.io/tx/${(res as any).transaction_id}?tab=traces`)
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
        CliUx.ux.log(green(`ABI Successfully cleaned:`))
        CliUx.ux.url(`View TX`, `${getExplorer()}/tx/${(res as any).transaction_id}?tab=traces`)
      } catch (e) {
        parseDetailsError(e)
      }
    }
  }
}
