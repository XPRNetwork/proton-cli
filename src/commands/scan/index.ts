import { Command } from '@oclif/command'
import open from 'open'
import { getExplorer } from '../../apis/getExplorer'

export default class Scan extends Command {
  static description = 'Open Account in Proton Scan'

  static args = [
    { name: 'account', required: true },
  ]

  async run() {
    const { args } = this.parse(Scan)

    const explorer: string = getExplorer()
    open(`${explorer}/account/${args.account}`)
  }
}

