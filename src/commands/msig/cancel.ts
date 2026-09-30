import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'

/* eslint-disable camelcase */

export default class MultisigCancel extends Command {
  static description = 'Multisig Cancel'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  static flags = {
    proposer: flags.string({description: 'Proposal owner (defaults to the signing account)'}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = this.parse(MultisigCancel)
    const authorization = parseAuthorization(args.auth)
    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'cancel',
        data: {
          proposer: commandFlags.proposer || authorization.actor,
          proposal_name: args.proposalName,
          canceler: authorization.actor,
        },
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig ${args.proposalName} successfully cancelled.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
  }
}
