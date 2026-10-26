import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {Authorization} from '@proton/wrap-constants'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {authorizationKey, parseAuthorization} from '../../utils/multisig'
import {buildRequiredAuth, buildUpdateAuthAction, compareNames} from '../../utils/updateauth'

/* eslint-disable camelcase */

export default class MultisigProposeUpdateauth extends Command {
  static description = 'Propose an eosio::updateauth permission change through the multisig contract'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'account', required: true, help: 'Account whose permission changes'},
    {name: 'auth', required: true, help: 'Your authorization (e.g. proposer@active)'},
  ]

  static flags = {
    permission: flags.string({description: 'Permission to change (default: active)'}),
    parent: flags.string({description: 'Parent permission (default: owner; empty for owner)'}),
    threshold: flags.integer({description: 'New permission threshold (required)', required: true}),
    keys: flags.string({description: 'Comma-separated new keys as PUB_...[:weight] (PUB_K1_, PUB_R1_, PUB_WA_ supported)'}),
    accounts: flags.string({description: 'Comma-separated accounts as actor@permission[:weight]'}),
    waits: flags.string({description: 'Comma-separated delays as seconds[:weight]'}),
    blocksBehind: flags.integer({char: 'b', default: 30}),
    expireSeconds: flags.integer({char: 'x', default: 60 * 60 * 24 * 7}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = this.parse(MultisigProposeUpdateauth)
    const authorization = parseAuthorization(args.auth)
    const permission = commandFlags.permission || 'active'
    const threshold = commandFlags.threshold as number

    const requiredAuth = buildRequiredAuth({
      threshold,
      keys: commandFlags.keys as string | undefined,
      accounts: commandFlags.accounts as string | undefined,
      waits: commandFlags.waits as string | undefined,
    })
    const updateAuthAction = buildUpdateAuthAction({
      account: args.account,
      permission,
      parent: commandFlags.parent as string | undefined,
      auth: requiredAuth,
    })
    const parsedActions = [updateAuthAction]

    // Serialize action
    const serializedActions = await network.api.serializeActions(parsedActions)
    const transactionSettings = await network.protonApi.generateTransactionSettings(
      commandFlags.expireSeconds as number,
      commandFlags.blocksBehind as number,
      0,
    )

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
