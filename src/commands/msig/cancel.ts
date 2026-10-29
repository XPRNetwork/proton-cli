import {Args, Command, Flags} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'
import {ux} from '../../utils/ux'

/* eslint-disable camelcase */

export default class MultisigCancel extends Command {
  static description = 'Multisig Cancel'

  static args = {
    proposalName: Args.string({required: true, help: 'Name of proposal'}),
    auth: Args.string({required: true, help: 'Your authorization'}),
  }

  static flags = {
    proposer: Flags.string({description: 'Proposal owner (defaults to the signing account)'}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = await this.parse(MultisigCancel)
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

    ux.log(`Multisig ${args.proposalName} successfully cancelled.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
