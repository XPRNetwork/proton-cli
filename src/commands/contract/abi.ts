import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { network } from '../../storage/networks'

export default class GetABI extends Command {
  static description = 'Get Contract ABI'

  static args = [
    { name: 'accountName', required: true },
  ]

  async run() {
    const { args } = this.parse(GetABI)
    const abi = await network.rpc.get_abi(args.accountName)
    CliUx.ux.styledJSON(abi)
  }
}
