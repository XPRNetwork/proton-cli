import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { GetAccountResult } from '@proton/js/dist/rpc/types'
import { green, red } from 'colors'
import { network } from '../../storage/networks'
import { sortRequiredAuth } from '../../utils/sortRequiredAuth'

export default class ContractEnableInline extends Command {
  static description = 'Enable Inline Actions on a Contract'

  static args = [
    {name: 'account', required: true, description: 'Contract account to enable'},
  ]

  static flags = {
    authorization: flags.string({ char: 'p', description: 'Use a specific authorization other than contract@active' }),
  }

  async run() {
    const {args, flags} = this.parse(ContractEnableInline)

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
    sortRequiredAuth(activePerm?.required_auth!)

    // Get signer
    const [actor, permission] = flags.authorization ? flags.authorization.split('@') : [args.account, 'active']

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