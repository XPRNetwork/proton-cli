import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { GetAccountResult } from '@proton/js/dist/rpc/types'
import { green, red } from 'colors'
import { network } from '../../storage/networks'

export default class ContractEnableInline extends Command {
  static description = 'Enable Inline Actions on a Contract'

  static args = [
    {name: 'account', required: true, description: 'Contract account to enable'},
  ]

  async run() {
    const {args} = this.parse(ContractEnableInline)

    // Get active perm
    const account: GetAccountResult = await network.rpc.get_account(args.account)
    const activePerm = account.permissions.find(perm => perm.perm_name === 'active')

    // Check if already exists
    const existingCode = activePerm?.required_auth.accounts.find(account =>  account.permission.actor === args.account && account.permission.permission === 'eosio.code')
    if (existingCode) {
      throw new Error('Inline actions already enabled')
    }

    // Add to required auth
    activePerm?.required_auth.accounts.push({
      permission: {
        actor: args.account,
        permission: 'eosio.code'
      },
      weight: activePerm.required_auth.threshold
    })

    // Get signer
    const authority = await CliUx.ux.prompt(green(`Enter signing permission`), { default: `${args.account}@active` })
    const [actor, permission] = authority.split('@')

    await network.transact({
      actions: [{
        account: 'eosio',
        name: 'updateauth',
        data: {
          account: args.account,
          permission: 'active',
          parent: 'owner',
          auth: activePerm?.required_auth
        },
        authorization: [{ actor, permission }]
      }]
    })

    // Log
    CliUx.ux.log(`${green('Success:')} Inline actions enabled`)
  }

  async catch(e: Error) {
    CliUx.ux.error(red(e.message))
  }
}