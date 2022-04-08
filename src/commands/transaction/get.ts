import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'

export default class Transaction extends Command {
  static description = 'Get Transaction by Transaction ID'

  static args = [
    { name: 'transactionId', required: true },
  ]

  async run() {
    const { args } = this.parse(Transaction)
    const result = await network.rpc.history_get_transaction(args.transactionId)
    CliUx.ux.styledJSON(result)
  }

  async catch(e: Error) {
    CliUx.ux.styledJSON(e)
  }
}

