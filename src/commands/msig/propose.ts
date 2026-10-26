import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseActions, parseAuthorization, resolveRequestedApprovers} from '../../utils/multisig'

/* eslint-disable camelcase */

export default class MultisigPropose extends Command {
  static description = 'Multisig Propose'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'actions', required: true, help: 'Actions JSON'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  static flags: { [k: string]: flags.IFlag<number>; } = {
    blocksBehind: flags.integer({char: 'b', default: 30}),
    expireSeconds: flags.integer({char: 'x', default: 60 * 60 * 24 * 7}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = this.parse(MultisigPropose)
    const authorization = parseAuthorization(args.auth)

    // Serialize action
    const parsedActions = parseActions(args.actions)
    const serializedActions = await network.api.serializeActions(parsedActions)
    const transactionSettings = await network.protonApi.generateTransactionSettings(commandFlags.expireSeconds, commandFlags.blocksBehind, 0)

    // Find required signers
    const sortedRequested = await resolveRequestedApprovers(parsedActions, (actor, permission) =>
      network.protonApi.getRequiredAccounts(actor, permission))

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'propose',
        data: {
          proposer: authorization.actor,
          proposal_name: args.proposalName,
          requested: sortedRequested,
          trx: {
            ...transactionSettings,
            actions: serializedActions,
          },
        },
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig ${args.proposalName} successfully proposed.`)
    CliUx.ux.url('View Proposal', `${getExplorer()}/msig/${authorization.actor}/${args.proposalName}`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
