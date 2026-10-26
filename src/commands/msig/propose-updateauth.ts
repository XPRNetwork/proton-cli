import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization, resolveRequestedApprovers} from '../../utils/multisig'
import {buildRequiredAuth, buildUpdateAuthAction, isValidEosioName} from '../../utils/updateauth'
import {RpcInterfaces} from '@proton/js'

/* eslint-disable camelcase */

const assertCommandNames = (
  proposalName: string,
  account: string,
  permission: string,
  authorization: {actor: string; permission: string},
): void => {
  if (!isValidEosioName(proposalName)) {
    throw new Error(`proposal name "${proposalName}" is not a valid EOSIO name`)
  }

  if (!isValidEosioName(account)) {
    throw new Error(`account "${account}" is not a valid EOSIO account name`)
  }

  if (!isValidEosioName(permission)) {
    throw new Error(`permission "${permission}" is not a valid permission name`)
  }

  if (permission.startsWith('eosio.')) {
    throw new Error(`permission "${permission}" is reserved because it starts with "eosio."`)
  }

  if (!isValidEosioName(authorization.actor)) {
    throw new Error(`authorization actor "${authorization.actor}" is not a valid EOSIO account name`)
  }

  if (!isValidEosioName(authorization.permission)) {
    throw new Error(`authorization permission "${authorization.permission}" is not a valid permission name`)
  }
}

const assertAccountAuthoritiesExist = async (
  requiredAuth: RpcInterfaces.RequiredAuth,
  account: string,
  onChain: RpcInterfaces.GetAccountResult,
): Promise<void> => {
  if (requiredAuth.accounts.length === 0) {
    return
  }

  const actors = [...new Set(requiredAuth.accounts.map(entry => entry.permission.actor))]
  const fetchedAccounts = await Promise.all(actors.map(async actor => {
    if (actor === account) {
      return [actor, onChain] as const
    }

    try {
      return [actor, await network.rpc.get_account(actor)] as const
    } catch {
      throw new Error(`--accounts account "${actor}" does not exist`)
    }
  }))
  const accountsByName = new Map(fetchedAccounts)
  for (const {permission: level} of requiredAuth.accounts) {
    if (level.permission === 'owner' || level.permission === 'active' || level.permission === 'eosio.code') {
      continue
    }

    if (!accountsByName.get(level.actor)?.permissions.some(entry => entry.perm_name === level.permission)) {
      throw new Error(`--accounts permission "${level.actor}@${level.permission}" does not exist`)
    }
  }
}

const assertWaitsWithinChainLimit = async (requiredAuth: RpcInterfaces.RequiredAuth): Promise<void> => {
  if (requiredAuth.waits.length === 0) {
    return
  }

  const chainGlobal = await network.protonApi.getChainTable()
  const maxDelay = chainGlobal?.max_transaction_delay
  if (!Number.isInteger(maxDelay) || maxDelay < 0) {
    throw new Error('could not resolve the chain maximum transaction delay')
  }

  const greatestWait = requiredAuth.waits[requiredAuth.waits.length - 1].wait_sec
  if (greatestWait > maxDelay) {
    throw new Error(`--waits delay ${greatestWait} exceeds the chain maximum transaction delay of ${maxDelay} seconds`)
  }
}

export default class MultisigProposeUpdateauth extends Command {
  static description = 'Propose an eosio::updateauth permission change through the multisig contract'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'account', required: true, help: 'Account whose permission changes'},
    {name: 'auth', required: true, help: 'Your authorization (e.g. proposer@active)'},
  ]

  static flags = {
    permission: flags.string({description: 'Permission to change', default: 'active'}),
    parent: flags.string({description: 'Parent permission (default: current parent on chain; cannot change an existing parent; required for new custom permissions; must be empty for owner)'}),
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

    // Validate every name before touching the chain so typos fail here
    // with a clear message instead of an opaque node error.
    assertCommandNames(args.proposalName, args.account, permission, authorization)

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

    // Resolve the parent and the existing permission from the chain. An
    // existing permission must keep its current parent.
    const onChain = await network.rpc.get_account(args.account)
    if (!Array.isArray(onChain?.permissions)) {
      throw new TypeError(`could not resolve permissions for account "${args.account}"`)
    }

    const existing = onChain.permissions.find(entry => entry.perm_name === permission)
    if (existing) {
      CliUx.ux.log(`Current ${permission} authority: ${JSON.stringify(existing.required_auth)}`)
    }

    CliUx.ux.log(`Proposed ${permission} authority: ${JSON.stringify(requiredAuth)}`)

    const flagParent = commandFlags.parent as string | undefined
    const parent = flagParent === undefined || flagParent === '' ? existing?.parent : flagParent

    if (existing && parent !== existing.parent) {
      throw new Error(`permission "${permission}" already has parent "${existing.parent}"; changing a permission parent is not supported`)
    }

    // A parent that does not exist would only fail at exec, after approvals
    // are collected. Reject it now while the chain state is in hand.
    if (parent !== undefined && parent !== '' && !onChain.permissions.some(entry => entry.perm_name === parent)) {
      throw new Error(`parent "${parent}" does not exist on account "${args.account}"`)
    }

    await assertAccountAuthoritiesExist(requiredAuth, args.account, onChain)
    await assertWaitsWithinChainLimit(requiredAuth)

    const updateAuthAction = buildUpdateAuthAction({
      account: args.account,
      permission,
      parent,
      auth: requiredAuth,
      // A permission that does not exist yet cannot authorize; the parent
      // authority creates it.
      actionPermission: existing ? permission : parent,
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
