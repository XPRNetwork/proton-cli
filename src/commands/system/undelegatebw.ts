import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

export default class UndelegateBandwidth extends Command {
  static description = 'System Undelegate Bandwidth'
  static hidden = true

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
    const {args} = await this.parse(UndelegateBandwidth)

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

    this.log(`${green('Success:')} Removed resources from ${args.receiver}!`)
    await ux.url('View Account on block explorer', `${getExplorer()}/account/${args.receiver}`)
  }
}
