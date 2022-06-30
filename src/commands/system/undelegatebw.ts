import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

export default class UndelegateBandwidth extends Command {
  static description = 'System Undelegate Bandwidth'
  static hidden = true

  static args = [
    {name: 'receiver', required: true},
    {name: 'cpu', required: true},
    {name: 'net', required: true},
  ]

  async run() {
    const {args} = this.parse(UndelegateBandwidth)


    const actions = [
      {
        account: "eosio",
        name: "undelegatebw",
        authorization: [{
            actor: "wlcm.proton",
            permission: "newacc"
        }],
        data: {
          from: "wlcm.proton",
          receiver: args.receiver,
          stake_cpu_quantity: args.cpu,
          stake_net_quantity: args.net
        },
      }
    ]

    // Execute
    await network.transact({ actions })

    this.log(`${green('Success:')} Removed resources from ${args.account}!`)
    await CliUx.ux.url('View Account on block explorer', `${getExplorer()}/account/${args.receiver}`)
  }
}
