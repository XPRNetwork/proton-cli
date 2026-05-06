import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import { parseDetailsError } from '../../utils/detailsError'

export default class Transaction extends Command {
  static description = 'Execute Transaction'

  static args = {
    json: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(Transaction)

    // Fetch rows
    const result = await network.transact(args.json)
    ux.styledJSON(result)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

