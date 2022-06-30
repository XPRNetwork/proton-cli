import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

export default class DelegateBandwidth extends Command {
  static description = 'System Delegate Bandwidth'
  static hidden = true

  static flags = {
    transfer: flags.boolean({char: 't', default: false}),
  }

  static args = [
    {name: 'receiver', required: true},
    {name: 'cpu', required: true},
    {name: 'net', required: true},
  ]

  async run() {
    const {args, flags} = this.parse(DelegateBandwidth)


    const actions = [
      {
        account: "eosio",
        name: "delegatebw",
        authorization: [{
            actor: "wlcm.proton",
            permission: "newacc"
        }],
        data: {
          from: "wlcm.proton",
          receiver: args.receiver,
          stake_cpu_quantity: args.cpu,
          stake_net_quantity: args.net,
          transfer: Number(flags.transfer),
        },
      }
    ]

    // Execute
    await network.transact({ actions })

    this.log(`${green('Success:')} Added resources to ${args.account}!`)
    await CliUx.ux.url('View Account on block explorer', `${getExplorer()}/account/${args.receiver}`)
  }
}
