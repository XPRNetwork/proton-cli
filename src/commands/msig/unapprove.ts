import {Args, Command} from '@oclif/core'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'
import {ux} from '../../utils/ux'

/* eslint-disable camelcase */

export default class MultisigUnapprove extends Command {
  static description = 'Multisig Unapprove'

  static args = {
    proposer: Args.string({required: true, help: 'Name of proposer'}),
    proposal: Args.string({required: true, help: 'Name of proposal'}),
    auth: Args.string({required: true, help: 'Requested permission to unapprove; also signs the transaction (e.g. user1@active)'}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(MultisigUnapprove)
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

    ux.log(`Multisig ${args.proposal} successfully unapproved.`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
