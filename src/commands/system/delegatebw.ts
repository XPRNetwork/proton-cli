import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

export default class DelegateBandwidth extends Command {
  static description = 'System Delegate Bandwidth'
  static hidden = true

  static flags = {
    transfer: Flags.boolean({char: 't', default: false}),
  }

  static args = {
    receiver: Args.string({
      required: true,
    }),
    cpu: Args.string({
      required: true,
    }),
    net: Args.string({
      required: true,
    }),
  }

  async run() {
    const {args, flags} = await this.parse(DelegateBandwidth)

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

    this.log(`${green('Success:')} Added resources to ${args.receiver}!`)
    await ux.url('View Account on block explorer', `${getExplorer()}/account/${args.receiver}`)
  }
}
