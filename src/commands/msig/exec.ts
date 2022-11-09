/* eslint-disable no-console */
import { Command } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'

export default class MultisigExecute extends Command {
  static description = 'Multisig Execute'

  static args = [
    {name: 'proposalName', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Your authorization'},
  ]

  async run() {
    const {args: {proposalName, auth}} = this.parse(MultisigExecute)
    const [actor, permission] = auth.split('@')
  
    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'exec',
          data: {
            proposer: actor,
            proposal_name: proposalName,
            executer: actor
          },
          authorization: [{ actor, permission: permission || 'active' }]
        }]
      })
      CliUx.ux.log(green(`Multisig ${proposalName} successfully executed.`))
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
