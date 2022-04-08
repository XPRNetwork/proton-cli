import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'
import { red } from 'colors'
import { parseDetailsError } from '../../utils'

export default class Transaction extends Command {
  static description = 'Execute Transaction'

  static args = [
    { name: 'json', required: true },
  ]

  async run() {
    const { args } = this.parse(Transaction)

    // Fetch rows
    const result = await network.transact(args.json)
    CliUx.ux.styledJSON(result)
  }

  async catch(e: Error | any) {
    parseDetailsError(e)
  }
}

