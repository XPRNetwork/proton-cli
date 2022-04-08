import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { green } from 'colors'

export default class LinkAuth extends Command {
  static description = 'Link Auth'

  static args = [
    { name: 'account', required: true },
    { name: 'permission', required: true },
    { name: 'contract', required: true },
    { name: 'action', required: false, default: '' },
  ]

  static flags = {
    permission: flags.string({ char: 'p', default: '' })
  }

  async run() {
    const {args, flags} = this.parse(LinkAuth)

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
          permission: permission || args.permission
        }]
      }]
    })
    
    await CliUx.ux.log(`${green('Success:')} Permission successfully linked.`)
  }

  async catch(e: Error) {
    CliUx.ux.error(e)
  }
}
