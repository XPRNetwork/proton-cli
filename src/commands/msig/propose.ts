/* eslint-disable no-console */
import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'
import { Authorization } from '@proton/wrap-constants'

export default class MultisigPropose extends Command {
  static description = 'Multisig Propose'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'actions', required: true, help: 'Actions JSON'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  static flags: { [k: string]: flags.IFlag<number>; } = {
    blocksBehind: flags.integer({char: 'b', default: 30}),
    expireSeconds: flags.integer({char: 'x', default: 60 * 60 * 24 * 7 }),
  }

  async run() {
    const {args: {proposalName, actions, auth}, flags} = this.parse(MultisigPropose)
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
      CliUx.ux.log(green(`Multisig ${proposalName} successfully proposed.`))
      CliUx.ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposalName}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
