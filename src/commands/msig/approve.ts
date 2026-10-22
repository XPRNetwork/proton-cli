import {Command, flags} from '@oclif/command'
import {CliUx} from '@oclif/core'
import {getExplorer} from '../../apis/getExplorer'
import {network} from '../../storage/networks'
import {parseDetailsError} from '../../utils/detailsError'
import {parseAuthorization} from '../../utils/multisig'

/* eslint-disable camelcase */

export default class MultisigApprove extends Command {
  static description = 'Multisig Approve'

  static args = [
    {name: 'proposer', required: true, help: 'Name of proposer'},
    {name: 'proposal', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Requested permission to approve; also signs the transaction (e.g. user1@active)'},
  ]

  static flags = {
    'proposal-hash': flags.string({description: 'Optional proposal transaction hash (64 hex characters, 0x prefix allowed)'}),
  }

  async run(): Promise<void> {
    const {args, flags: commandFlags} = this.parse(MultisigApprove)
    const authorization = parseAuthorization(args.auth)
    const data: Record<string, unknown> = {
      proposer: args.proposer,
      proposal_name: args.proposal,
      level: authorization,
    }

    const proposalHash = commandFlags['proposal-hash']
    if (proposalHash) {
      const normalizedProposalHash = proposalHash.replace(/^0x/i, '')
      if (!/^[\da-f]{64}$/i.test(normalizedProposalHash)) {
        throw new Error('--proposal-hash must be exactly 64 hexadecimal characters')
      }

      data.proposal_hash = normalizedProposalHash
    }

    await network.transact({
      actions: [{
        account: 'eosio.msig',
        name: 'approve',
        data,
        authorization: [authorization],
      }],
    })

    CliUx.ux.log(`Multisig ${args.proposal} successfully approved.`)
    CliUx.ux.url('View Proposal', `${getExplorer()}/msig/${args.proposer}/${args.proposal}`)
  }

  async catch(e: Error | any): Promise<void> {
    parseDetailsError(e)
    return this.error(e instanceof Error ? e.message : String(e), {exit: 1})
  }
}
