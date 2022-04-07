import { Command } from '@oclif/command'
import {CliUx} from '@oclif/core'
import { network } from '../../storage/networks'

export default class GetAccount extends Command {
  static description = 'Get Chain Info'

  async run() {
    const account = await network.rpc.get_info()
    CliUx.ux.styledJSON(account)
  }
}
