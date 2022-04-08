import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { green } from 'colors'

export default class UnlinkAuth extends Command {
  static description = 'Unlink Auth'

  static args = [
    { name: 'accountName', required: true },
    { name: 'contractName', required: true },
    { name: 'actionName', required: false, default: '' },
  ]

  static flags = {
    permission: flags.string({ char: 'p', default: '' })
  }

  async run() {
    const {args, flags} = this.parse(UnlinkAuth)

    const [actor, permission] = flags.permission.split('@')

    await network.transact({
      actions: [{
        account: 'eosio',
        name: 'unlinkauth',
        data: {
          account: args.accountName,
          code: args.contractName,
          type: args.actionName
        },
        authorization: [{
          actor: actor || args.accountName,
          permission: permission || args.permissionName
        }]
      }]
    })
    
    await CliUx.ux.log(`${green('Success:')} Permission successfully unlinked.`)
  }

  async catch(e: Error) {
    CliUx.ux.error(e)
  }
}
