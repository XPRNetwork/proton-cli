import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { network } from '../../storage/networks'

export default class GetABI extends Command {
  static description = 'Get Contract ABI'

  static args = [
    { name: 'account', required: true },
  ]

  async run() {
    const { args } = this.parse(GetABI)
    const abi = await network.rpc.get_abi(args.account)
    CliUx.ux.styledJSON(abi)
  }
}
