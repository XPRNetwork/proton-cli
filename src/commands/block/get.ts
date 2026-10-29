import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

export default class GetBlock extends Command {
  static description = 'Get Block'

  static args = {
    blockNumber: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(GetBlock)
    const result = await network.rpc.get_block(args.blockNumber)
    ux.styledJSON(result)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
