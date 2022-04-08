import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { red } from 'colors'

export default class Transaction extends Command {
  static description = 'Execute Transaction'

  static args = [
    { name: 'transactionJson', required: true },
  ]

  async run() {
    const { args } = this.parse(Transaction)

    // Fetch rows
    const result = await network.transact(args.transactionJson)
    CliUx.ux.styledJSON(result)
  }

  async catch(e: Error | any) {
    const error = e && e.details && e.details.length && e.details[0] && e.details[0].message
    if (error || typeof e === 'object') {
      CliUx.ux.log('\n' + red(error || e.message))
    } else {
      CliUx.ux.styledJSON(e)
    }
  }
}

