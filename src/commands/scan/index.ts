import { Command } from '@oclif/command'
import open from 'open'

export default class Scan extends Command {
  static description = 'Open Account in Proton Scan'

  static args = [
    { name: 'account', required: true },
  ]

  async run() {
    const { args } = this.parse(Scan)
    open(`https://protonscan.io/account/${args.account}`)
  }
}

