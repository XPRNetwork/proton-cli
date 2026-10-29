import {Args, Command} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'
import {ux} from '../../utils/ux'

/* eslint-disable camelcase */

export default class MultisigExecute extends Command {
  static description = 'Multisig Execute'

  static args = {
    proposer: Args.string({required: true, help: 'Name of proposer'}),
    proposal: Args.string({required: true, help: 'Name of proposal'}),
    auth: Args.string({required: true, help: 'Your authorization (e.g. user1@active)'}),
  }

  async run(): Promise<void> {
    const {args} = await this.parse(MultisigExecute)
    const authorization = parseAuthorization(args.auth)
    const result = await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'exec',
        data: {
          proposer: args.proposer,
          proposal_name: args.proposal,
          executer: authorization.actor,
        },
        authorization: [authorization],
      }],
    })

    ux.log(`Multisig ${args.proposal} successfully executed.`)
    const transactionId = typeof result === 'object' && result !== null && 'transaction_id' in result ?
      (result as {transaction_id?: unknown}).transaction_id :
      undefined
    if (typeof transactionId === 'string' && transactionId.length > 0) {
      ux.url('View TX', `${getExplorer()}/tx/${transactionId}?tab=traces`)
    }
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
