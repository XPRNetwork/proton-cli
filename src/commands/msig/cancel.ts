import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'
/* eslint-disable no-console */

import { network } from '../../storage/networks'

import { green, red } from 'colors'

export default class MultisigCancel extends Command {
  static description = 'Multisig Cancel'

  static args = {
    proposalName: Args.string({
      required: true,
      help: 'Name of proposal',
    }),
    auth: Args.string({
      required: true,
      help: 'Your authorization',
    }),
  }

  async run() {
    const {args: {proposalName, auth}} = await this.parse(MultisigCancel)
    const [actor, permission] = auth.split('@')
  
    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'cancel',
          data: {
            proposer: actor,
            proposal_name: proposalName,
            canceler: actor
          },
          authorization: [{ actor, permission: permission || 'active' }]
        }]
      })
      ux.log(green(`Multisig ${proposalName} successfully cancelled.`))
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
