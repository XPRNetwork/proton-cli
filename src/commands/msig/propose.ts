import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'
/* eslint-disable no-console */

import { network } from '../../storage/networks'

import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'
import { Authorization } from '@proton/wrap-constants'

export default class MultisigPropose extends Command {
  static description = 'Multisig Propose'

  static args = {
    proposalName: Args.string({
      required: true,
      help: 'Name of proposal',
    }),
    actions: Args.string({
      required: true,
      help: 'Actions JSON',
    }),
    auth: Args.string({
      required: true,
      help: 'Your authorization',
    }),
  }

  static flags = {
    blocksBehind: Flags.integer({char: 'b', default: 30}),
    expireSeconds: Flags.integer({char: 'x', default: 60 * 60 * 24 * 7 }),
  }

  async run() {
    const {args: {proposalName, actions, auth}, flags} = await this.parse(MultisigPropose)
    const [actor, permission] = auth.split('@')
    
    // Serialize action
    const parsedActions = JSON.parse(actions)
    const serializedActions = await network.api.serializeActions(parsedActions)
    const transactionSettings = await network.protonApi.generateTransactionSettings(flags.expireSeconds, flags.blocksBehind, 0)

    // Find required signers
    let requested: Authorization[] = []
    for (const action of parsedActions) {
      for (const { actor, permission } of action.authorization) {
        const requiredAccountsLocal = await network.protonApi.getRequiredAccounts(actor, permission)
        requested = requested.concat(requiredAccountsLocal)
      }
    }
    requested = requested.filter((item, pos) => requested.findIndex(_ => _.actor === item.actor) === pos)
      
    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'propose',
          data: {
            proposer: actor,
            proposal_name: proposalName,
            requested,
            trx: {
              ...transactionSettings,
              actions: serializedActions,
            }
          },
          authorization: [{ actor, permission: permission || 'active' }]
        }]
      })
      ux.log(green(`Multisig ${proposalName} successfully proposed.`))
      ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposalName}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
