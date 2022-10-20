/* eslint-disable no-console */
import { Command } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'

export default class Multisig extends Command {
  static description = 'Multisig Cancel'

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
          name: 'cancel',
          data: {
            proposer: actor,
            proposal_name: proposalName,
            canceler: actor
          },
          authorization: [{ actor, permission: permission || 'active' }]
        }]
      })
      CliUx.ux.log(green(`Multisig ${proposalName} successfully cancelled.`))
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
