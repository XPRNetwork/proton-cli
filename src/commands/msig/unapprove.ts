import {Command} from '@oclif/command'
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
    {name: 'auth', required: true, help: 'Requested permission to unapprove; also signs the transaction (e.g. user1@active)'},
  ]

  async run(): Promise<void> {
    const {args} = this.parse(MultisigUnapprove)
    const authorization = parseAuthorization(args.auth)

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'unapprove',
        data: {
          proposer: args.proposer,
          proposal_name: args.proposal,
          level: authorization,
        },
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig ${args.proposal} successfully unapproved.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
