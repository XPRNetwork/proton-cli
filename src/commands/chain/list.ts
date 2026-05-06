import { Command } from '@oclif/core'
import { ux } from '../../utils/ux'

import {networks} from '../../constants'

export default class AllNetworks extends Command {
  static description = 'All Networks'

  async run() {
    ux.log('All Networks:')
    ux.styledJSON(networks)
  }

  async catch(e: Error) {
    ux.styledJSON(e)
  }
}
