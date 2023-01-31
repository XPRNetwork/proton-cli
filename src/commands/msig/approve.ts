/* eslint-disable no-console */
import { Command } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green, red } from 'colors'
import { getExplorer } from '../../apis/getExplorer'

export default class MultisigApprove extends Command {
  static description = 'Multisig Approve'

  static args = [
    {name: 'proposer', required: true, help: 'Name of proposer'},
    {name: 'proposal', required: true, help: 'Name of proposal'},
    {name: 'auth', required: true, help: 'Signing authorization (e.g. user1@active)'},
    {name: 'msigAuth', required: false, help: 'Multisig authorization (e.g. user2@active)'},
  ]

  async run() {
    const {args: { proposer, proposal, auth, msigAuth }} = this.parse(MultisigApprove)
    const [actor, permission] = auth.split('@')
    const [msigActor, msigPermission] = (auth || msigAuth).split('@')

    try {
      await network.transact({
        actions: [{
          account: 'eosio.msig',
          name: 'approve',
          data: {
            proposer,
            proposal_name: proposal,
            level: {
              actor: msigActor,
              permission: msigPermission
            }
          },
          authorization: [{ actor, permission }]
        }]
      })
      CliUx.ux.log(green(`Multisig ${proposal} successfully approved.`))
      CliUx.ux.url(`View Proposal`, `${getExplorer()}/msig/${actor}/${proposal}`)
    } catch (err: any) {
      return this.error(red(err));
    }
  }
}
