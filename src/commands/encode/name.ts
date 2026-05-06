import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { Name } from '@greymass/eosio'
import { parseDetailsError } from '../../utils/detailsError'

export default class EncodeName extends Command {
  static description = 'Encode Name'

  static args = {
    account: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(EncodeName)
    ux.log(`${Name.from(args.account).value}`)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

