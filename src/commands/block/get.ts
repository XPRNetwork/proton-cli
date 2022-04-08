import { Command } from '@oclif/command'
import { CliUx } from '@oclif/core'
import { network } from '../../storage/networks'

export default class GetBlock extends Command {
  static description = 'Get Block'

  static args = [
    { name: 'blockNumber', required: true },
  ]

  async run() {
    const { args } = this.parse(GetBlock)
    const result = await network.rpc.get_block(args.blockNumber)
    CliUx.ux.styledJSON(result)
  }

  async catch(e: Error) {
    CliUx.ux.styledJSON(e)
  }
}
