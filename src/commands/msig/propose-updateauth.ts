import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization, resolveRequestedApprovers} from '../../utils/multisig'
import {buildRequiredAuth, buildUpdateAuthAction} from '../../utils/updateauth'

/* eslint-disable camelcase */

export default class MultisigProposeUpdateauth extends Command {
  static description = 'Propose an eosio::updateauth permission change through the multisig contract'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'account', required: true, help: 'Account whose permission changes'},
    {name: 'auth', required: true, help: 'Your authorization (e.g. proposer@active)'},
  ]

  static flags = {
    permission: flags.string({description: 'Permission to change', default: 'active'}),
    parent: flags.string({description: 'Parent permission (default: current parent on chain; required for new custom permissions; must be empty for owner)'}),
    threshold: flags.integer({description: 'New permission threshold', required: true}),
    keys: flags.string({description: 'Comma-separated new keys as PUB_...[:weight] (PUB_K1_, PUB_R1_, PUB_WA_ supported)'}),
    accounts: flags.string({description: 'Comma-separated accounts as actor@permission[:weight]'}),
    waits: flags.string({description: 'Comma-separated delays as seconds[:weight]'}),
    yes: flags.boolean({char: 'y', description: 'Confirm replacing the owner permission (irreversible once executed)'}),
    blocksBehind: flags.integer({char: 'b', default: 30}),
    expireSeconds: flags.integer({char: 'x', default: 60 * 60 * 24 * 7}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = this.parse(MultisigProposeUpdateauth)
    const authorization = parseAuthorization(args.auth)
    const permission = commandFlags.permission as string | undefined
    if (permission === undefined || permission === '') {
      throw new Error('--permission must not be empty')
    }

    const threshold = commandFlags.threshold as number

    if (permission === 'owner' && !commandFlags.yes) {
      throw new Error('replacing the owner permission can permanently lock the account; re-run with --yes to confirm')
    }

    const requiredAuth = buildRequiredAuth({
      threshold,
      keys: commandFlags.keys as string | undefined,
      accounts: commandFlags.accounts as string | undefined,
      waits: commandFlags.waits as string | undefined,
    })

    // Resolve the parent and the existing permission from the chain so a
    // custom permission keeps its current parent unless --parent overrides it.
    const onChain = await network.rpc.get_account(args.account)
    const existing = onChain.permissions.find(entry => entry.perm_name === permission)
    if (existing) {
      CliUx.ux.log(`Current ${permission} authority: ${JSON.stringify(existing.required_auth)}`)
    }

    CliUx.ux.log(`Proposed ${permission} authority: ${JSON.stringify(requiredAuth)}`)

    const flagParent = commandFlags.parent as string | undefined
    const parent = flagParent === undefined || flagParent === '' ? existing?.parent : flagParent
    const updateAuthAction = buildUpdateAuthAction({
      account: args.account,
      permission,
      parent,
      auth: requiredAuth,
    })

    // A permission that does not exist yet cannot authorize; the parent
    // authority creates it.
    if (!existing) {
      const actionData = updateAuthAction.data as {parent: string}
      updateAuthAction.authorization = [{actor: args.account, permission: actionData.parent}]
    }

    const parsedActions = [updateAuthAction]

    // Serialize action
    const serializedActions = await network.api.serializeActions(parsedActions)
    const transactionSettings = await network.protonApi.generateTransactionSettings(
      commandFlags.expireSeconds as number,
      commandFlags.blocksBehind as number,
      0,
    )

    // Find required signers
    const sortedRequested = await resolveRequestedApprovers(parsedActions, (actor, permissionName) =>
      network.protonApi.getRequiredAccounts(actor, permissionName))

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
