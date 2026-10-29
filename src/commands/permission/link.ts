import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import { green } from 'colors'

export default class LinkAuth extends Command {
  static description = 'Link Auth'

  static args = {
    account: Args.string({
      required: true,
    }),
    permission: Args.string({
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
    permission: Flags.string({ char: 'p', default: '', description: 'Permission to sign with (e.g. account@active)' })
  }

  async run() {
    const {args, flags} = await this.parse(LinkAuth)

    const [actor, permission] = flags.permission.split('@')

    await network.transact({
      actions: [{
        account: 'eosio',
        name: 'linkauth',
        data: {
          account: args.account,
          requirement: args.permission,
          code: args.contract,
          type: args.action
        },
        authorization: [{
          actor: actor || args.account,
          permission: permission || 'active'
        }]
      }]
    })
    
    await ux.log(`${green('Success:')} Permission successfully linked.`)
  }

  async catch(e: Error) {
    ux.error(e)
  }
}
