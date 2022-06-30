import { Command, flags } from '@oclif/command'
import { network } from '../../storage/networks'
import { CliUx } from '@oclif/core'
import { green } from 'colors';
import { getExplorer } from '../../apis/getExplorer';

export default class BuyRam extends Command {
  static description = 'System Buy Ram'
  static hidden = true

  static args = [
    {name: 'receiver', required: true},
    {name: 'bytes', required: true},
  ]

  async run() {
    const {args} = this.parse(BuyRam)

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
    await CliUx.ux.url('View Account on block explorer', `${getExplorer()}/account/${args.receiver}`)
  }
}
