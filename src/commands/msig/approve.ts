import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'
/* eslint-disable no-console */

import { network } from '../../storage/networks'

import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'

export default class MultisigApprove extends Command {
  static description = 'Multisig Approve'

  static args = {
    proposer: Args.string({
      required: true,
      help: 'Name of proposer',
    }),
    proposal: Args.string({
      required: true,
      help: 'Name of proposal',
    }),
    auth: Args.string({
      required: true,
      help: 'Signing authorization (e.g. user1@active)',
    }),
  }

  async run() {
    const {args: { proposer, proposal, auth }} = await this.parse(MultisigApprove)
    const [actor, permission] = auth.split('@')

    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'approve',
          data: {
            proposer,
            proposal_name: proposal,
            level: { actor, permission }
          },
          authorization: [{ actor, permission }]
        }]
      })
      ux.log(green(`Multisig ${proposal} successfully approved.`))
      ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposal}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
