import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'

/* eslint-disable camelcase */

export default class MultisigUnapprove extends Command {
  static description = 'Multisig Unapprove'

  static args = [
    {name: 'proposer', required: true, help: 'Name of proposer'},
    {name: 'proposal', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Signing authorization (e.g. user1@active)'},
  ]

  static flags = {
    level: flags.string({char: 'l', description: 'Requested permission to unapprove (e.g. user1@active)'}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = this.parse(MultisigUnapprove)
    const authorization = parseAuthorization(args.auth)
    const level = parseAuthorization(commandFlags.level || args.auth, 'level')

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'unapprove',
        data: {
          proposer: args.proposer,
          proposal_name: args.proposal,
          level,
        },
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig ${args.proposal} successfully unapproved.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
  }
}
