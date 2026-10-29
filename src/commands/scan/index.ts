import { Command, Args } from '@oclif/core'

import open from 'open'
import { getExplorer } from '../../apis/getExplorer'

export default class Scan extends Command {
  static description = 'Open Account in Proton Scan'

  static args = {
    account: Args.string({
      required: true,
    }),
  }

  async run() {
    const { args } = await this.parse(Scan)

    const explorer: string = getExplorer()
    open(`${explorer}/account/${args.account}`)
  }
}

