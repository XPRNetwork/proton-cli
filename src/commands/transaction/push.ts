import { Command, flags } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { parseDetailsError } from '../../utils/detailsError'

export default class PushTransaction extends Command {
  static description = 'Push Transaction'

  static args = [
    { name: 'transaction', required: true },
  ]

  static flags = {
    endpoint: flags.string({ char: 'u', description: 'Your RPC endpoint' }),
  }

  async run() {
    const { args, flags } = this.parse(PushTransaction)

    // Fetch rows
    const result = await network.transact(JSON.parse(args.transaction), { endpoint: flags.endpoint })
    CliUx.ux.styledJSON(result)
  }

  async catch(e: Error) {
    parseDetailsError(e)
  }
}

