import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { green } from 'colors'

export default class LinkAuth extends Command {
  static description = 'Link Auth'

  static args = [
    { name: 'accountName', required: true },
    { name: 'permissionName', required: true },
    { name: 'contractName', required: true },
    { name: 'actionName', required: false, default: '' },
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
          account: args.accountName,
          requirement: args.permissionName,
          code: args.contractName,
          type: args.actionName
        },
        authorization: [{
          actor: actor || args.accountName,
          permission: permission || args.permissionName
        }]
      }]
    })
    
    await CliUx.ux.log(`${green('Success:')} Permission successfully linked.`)
  }

  async catch(e: Error) {
    CliUx.ux.error(e)
  }
}
