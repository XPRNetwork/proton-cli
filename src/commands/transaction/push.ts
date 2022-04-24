import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { parseDetailsError } from '../../utils/detailsError'

export default class PushTransaction extends Command {
  static description = 'Push Transaction'

  static args = [
    { name: 'transaction', required: true },
  ]

  async run() {
    const { args } = this.parse(PushTransaction)

    // Fetch rows
    const result = await network.transact(JSON.parse(args.transaction))
    CliUx.ux.styledJSON(result)
  }

  async catch(e: Error) {
    parseDetailsError(e)
  }
}

