import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import { network } from '../../storage/networks'

export default class GetNetwork extends Command {
  static description = 'Get Current Chain'

  static aliases = ['network']

  async run() {
    ux.log('Current Network:')
    ux.styledJSON(network.network)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
