/* eslint-disable no-console */
import { Command } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'

export default class MultisigExecute extends Command {
  static description = 'Multisig Execute'

  static args = [
    {name: 'proposer', required: true, help: 'Name of proposer'},
    {name: 'proposal', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Your authorization (e.g. user1@active'},
  ]

  async run() {
    const {args: {proposer, proposal, auth}} = this.parse(MultisigExecute)
    const [actor, permission] = auth.split('@')
  
    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'exec',
          data: {
            proposer: proposer,
            proposal_name: proposal,
            executer: actor
          },
          authorization: [{ actor, permission }]
        }]
      })
      CliUx.ux.log(green(`Multisig ${proposal} successfully executed.`))
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
