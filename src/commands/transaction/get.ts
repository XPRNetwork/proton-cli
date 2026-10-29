import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

export default class Transaction extends Command {
  static description = 'Get Transaction by Transaction ID'

  static args = {
    id: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(Transaction)
    const result = await network.rpc.history_get_transaction(args.id)
    ux.styledJSON(result)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}

