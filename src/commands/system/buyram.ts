import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

export default class BuyRam extends Command {
  static description = 'System Buy Ram'
  static hidden = true

  static args = {
    receiver: Args.string({
      required: true,
    }),
    bytes: Args.string({
      required: true,
    }),
  }

  async run() {
    const {args} = await this.parse(BuyRam)

    const actions = [
      {
        account: "eosio",
        name: "buyrambsys",
        authorization: [{
            actor: "wlcm.proton",
            permission: "newacc"
          }
        ],
        data: {
          payer: "wlcm.proton",
          receiver: args.receiver,
          bytes: args.bytes,
        }
      }
    ]

    // Execute
    await network.transact({ actions })

    this.log(`${green('Success:')} Bought ${args.bytes} bytes RAM for ${args.receiver}!`)
    await ux.url('View Account on block explorer', `${getExplorer()}/account/${args.receiver}`)
  }
}
