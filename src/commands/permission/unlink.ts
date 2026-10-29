import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import { green } from 'colors'

export default class UnlinkAuth extends Command {
  static description = 'Unlink Auth'

  static args = {
    account: Args.string({
      required: true,
    }),
    contract: Args.string({
      required: true,
    }),
    action: Args.string({
      required: false,
      default: '',
    }),
  }

  static flags = {
    permission: Flags.string({ char: 'p', default: '' })
  }

  async run() {
    const {args, flags} = await this.parse(UnlinkAuth)

    const [actor, permission] = flags.permission.split('@')

    await network.transact({
      actions: [{
        account: 'eosio',
        name: 'unlinkauth',
        data: {
          account: args.account,
          code: args.contract,
          type: args.action
        },
        authorization: [{
          actor: actor || args.account,
          permission: permission || 'active'
        }]
      }]
    })
    
    await ux.log(`${green('Success:')} Permission successfully unlinked.`)
  }

  async catch(e: Error) {
    ux.error(e)
  }
}
