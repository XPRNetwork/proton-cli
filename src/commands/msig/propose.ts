import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {Authorization} from '@proton/wrap-constants'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {authorizationKey, parseActions, parseAuthorization} from '../../utils/multisig'

/* eslint-disable camelcase */

// Code-unit order matches EOSIO name collation (`.` < `1-5` < `a-z`)
// and is stable across machines, unlike localeCompare.
const compareNames = (left: string, right: string): number => {
  if (left === right) {
    return 0
  }

  return left < right ? -1 : 1
}

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
    const requested = new Map<string, Authorization>()
    const actionAuthorizations = parsedActions.flatMap(action => action.authorization)
    const requiredAccounts = await Promise.all(actionAuthorizations.map(async level => {
      const parsedLevel = parseAuthorization(`${level.actor}@${level.permission}`, 'action authorization')
      const required = await network.protonApi.getRequiredAccounts(parsedLevel.actor, parsedLevel.permission)
      if (required.length === 0) {
        throw new Error(`could not resolve required accounts for ${authorizationKey(parsedLevel)}`)
      }

      return required
    }))
    for (const required of requiredAccounts.flat()) {
      requested.set(authorizationKey(required), required)
    }

    const sortedRequested = [...requested.values()].sort((left, right) =>
      compareNames(left.actor, right.actor) || compareNames(left.permission, right.permission))

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
