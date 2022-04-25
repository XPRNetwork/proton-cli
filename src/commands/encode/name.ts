import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { Name } from '@greymass/eosio'
import { parseDetailsError } from '../../utils/detailsError'

export default class EncodeName extends Command {
  static description = 'Encode Name'

  static args = [
    { name: 'account', required: true },
  ]

  async run() {
    const { args } = this.parse(EncodeName)
    CliUx.ux.log(`${Name.from(args.account).value}`)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

