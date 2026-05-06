import { Command, Args } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

export default class GetABI extends Command {
  static description = 'Get Contract ABI'

  static args = {
    account: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(GetABI)
    const abi = await network.rpc.get_abi(args.account)
    ux.styledJSON(abi)
  }
}
