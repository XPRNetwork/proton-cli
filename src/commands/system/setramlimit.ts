import { Command, Args } from '@oclif/core'

import { network } from '../../storage/networks'
import { green } from 'colors';

export default class SetRamLimit extends Command {
  static description = 'System Set RAM Limit'
  static hidden = true

  static args = {
    account: Args.string({
      required: true,
    }),
    ramlimit: Args.string({
      required: true,
    }),
  }

  async run() {
    const {args} = await this.parse(SetRamLimit)

    const actions = [
      {
        account: "eosio",
        name: "ramlimitset",
        authorization: [{
          actor: "admin.proton",
          permission: "light"
        }],
        data: {
          account: args.account,
          ramlimit: +args.ramlimit,
        },
      }
    ]

    // Execute
    await network.transact({ actions })

    this.log(`${green('Success:')} Set RAM limit for ${args.account} to ${args.ramlimit}!`)
  }
}
