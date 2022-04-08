import { Command } from '@oclif/command'
import {networks} from '../../constants'
import { CliUx } from '@oclif/core'

export default class AllNetworks extends Command {
  static description = 'All Networks'

  async run() {
    CliUx.ux.log('All Networks:')
    CliUx.ux.styledJSON(networks)
  }

  async catch(e: Error) {
    CliUx.ux.styledJSON(e)
  }
}
