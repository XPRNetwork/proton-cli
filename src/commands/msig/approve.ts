/* eslint-disable no-console */
import { Command } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'

export default class Multisig extends Command {
  static description = 'Multisig Approve'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  async run() {
    const {args: {proposalName, auth}} = this.parse(Multisig)
    const [actor, permission] = auth.split('@')
  
    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'approve',
          data: {
            proposer: actor,
            proposal_name: proposalName,
            level: { actor, permission }
          },
          authorization: [{ actor, permission: permission || 'active' }]
        }]
      })
      CliUx.ux.log(green(`Multisig ${proposalName} successfully approved.`))
      CliUx.ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposalName}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
