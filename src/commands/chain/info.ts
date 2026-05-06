import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

export default class GetAccount extends Command {
  static description = 'Get Chain Info'

  async run() {
    const account = await network.rpc.get_info()
    ux.styledJSON(account)
  }
}
