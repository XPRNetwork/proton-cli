import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import {error} from '../../debug'
import { network } from '../../networks'

export default class SetNetwork extends Command {
  static description = 'Set Network'

  static args = [
    {name: 'chain', required: true},
  ]

  async run() {
    const {args} = this.parse(SetNetwork)
    network.setChain(args.chain)
  }

  async catch(e: Error) {
    error(e)
    CliUx.ux.error(e)
  }
}
