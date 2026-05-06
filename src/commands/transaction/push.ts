import { Command, Flags, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'
import { parseDetailsError } from '../../utils/detailsError'

export default class PushTransaction extends Command {
  static description = 'Push Transaction'

  static args = {
    transaction: Args.string({
      required: true,
    }),
  }

  static flags = {
    endpoint: Flags.string({ char: 'u', description: 'Your RPC endpoint' }),
  }

  async run() {
    const { args, flags } = await this.parse(PushTransaction)

    // Fetch rows
    const result = await network.transact(JSON.parse(args.transaction), { endpoint: flags.endpoint })
    ux.styledJSON(result)
  }

  async catch(e: Error) {
    parseDetailsError(e)
  }
}

