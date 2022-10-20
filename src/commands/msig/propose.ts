/* eslint-disable no-console */
import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'
import { Authorization } from '@proton/wrap-constants'

export default class Multisig extends Command {
  static description = 'Multisig Transaction'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'actions', required: true, help: 'Actions JSON'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  static flags = {
    blocksBehind: flags.string({char: 'b', default: "30"}),
    expireSeconds: flags.string({char: 'x', default: "3000"}),
  }

  async run() {
    const {args: {proposalName, actions, auth}, flags} = this.parse(Multisig)
    const [actor, permission] = auth.split('@')
    
    // Serialize action
    const parsedActions = JSON.parse(actions)
    const serializedActions = await network.api.serializeActions(parsedActions)
    const transactionSettings = await network.protonApi.generateTransactionSettings(
      +flags.blocksBehind,
      +flags.blocksBehind,
      0
    )

    // Find required signers
    let requested: Authorization[] = []
    for (const action of parsedActions) {
      for (const { actor, permission } of action.authorization) {
        const requiredAccountsLocal = await network.protonApi.getRequiredAccounts(actor, permission)
        requested = requested.concat(requiredAccountsLocal)
      }
    }
    requested = [...new Set(requested)]
  
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
      CliUx.ux.log(green(`Multisig ${proposalName} successfully proposed.`))
      CliUx.ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposalName}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
