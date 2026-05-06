import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'
/* eslint-disable no-console */

import { network } from '../../storage/networks'

import { green, red } from 'colors'

export default class MultisigExecute extends Command {
  static description = 'Multisig Execute'

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
      help: 'Your authorization (e.g. user1@active',
    }),
  }

  async run() {
    const {args: {proposer, proposal, auth}} = await this.parse(MultisigExecute)
    const [actor, permission] = auth.split('@')
  
    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'exec',
          data: {
            proposer: proposer,
            proposal_name: proposal,
            executer: actor
          },
          authorization: [{ actor, permission }]
        }]
      })
      ux.log(green(`Multisig ${proposal} successfully executed.`))
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
